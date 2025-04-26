import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkTableExists, safeQueryTable } from '@/utils/db-helpers';
import { User } from '@supabase/supabase-js';

// Service to handle database checking and creation
/**
 * Get a user by their ID from the 'users' table.
 * @param userId The user's UUID
 * @returns The user object or null
 */
async function getUserById(userId: string) {
  return await safeQueryTable('users', (query) =>
    query
      .select('*')
      .eq('id', userId)
      .single()
  );
}

// Get all insights for the user: dashboards, charts, KPIs
async function getInsights(userId: string) {
  // Get all dashboards for the user
  const dashboardsResult = await dbService.getAllDashboards(userId);
  const dashboards = dashboardsResult?.data || [];

  // Get all charts for each dashboard (if report_id exists)
  let charts: any[] = [];
  for (const dashboard of dashboards) {
    if (dashboard.report_id) {
      const chartsResult = await dbService.getAllCharts(dashboard.report_id);
      charts = charts.concat(chartsResult?.data || []);
    }
  }

  // Get all KPI metrics
  const kpisResult = await dbService.getAllKpiMetrics();
  const kpis = kpisResult?.data || [];

  return { dashboards, charts, kpis };
}

/**
 * Get all team members (users) from the database.
 * @returns Array of user objects
 */
async function getAllTeamMembers() {
  return await safeQueryTable('users', (query) => query.select('*'));
}

/**
 * Get dashboard statistics for the current user.
 * Returns: { completedTasks, hoursTracked, openIssues, teamMembers }
 */
export async function getDashboardStats(userId: string) {
  try {
    // Completed Tasks
    const { data: completedTasksData, error: completedTasksError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'done');
    const completedTasks = completedTasksError ? null : completedTasksData?.length ?? 0;

    // Hours Tracked
    const { data: timeEntriesData, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('user_id', userId);
    let hoursTracked = null;
    if (!timeEntriesError && Array.isArray(timeEntriesData)) {
      hoursTracked = timeEntriesData.reduce((sum, entry) => sum + (entry.time_spent || 0), 0) / 60; // Assuming time_spent is in minutes
      hoursTracked = Math.round(hoursTracked * 10) / 10; // 1 decimal place
    }

    // Open Issues (tasks with status 'open' or 'issue')
    const { data: openIssuesData, error: openIssuesError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['open', 'issue']);
    const openIssues = openIssuesError ? null : openIssuesData?.length ?? 0;

    // Team Members (users with the same org/team as the user, fallback to all users count)
    const { data: teamData, error: teamError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    const teamMembers = teamError ? null : teamData?.length ?? 0;

    return { completedTasks, hoursTracked, openIssues, teamMembers };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { completedTasks: null, hoursTracked: null, openIssues: null, teamMembers: null };
  }
}

// --- User Settings CRUD ---
async function createUserSettings(userId: string, defaults: Record<string, any> = {}) {
  return await safeQueryTable('user_settings', (query) =>
    query.insert({
      user_id: userId,
      ...defaults
    }).single()
  );
}

export const dbService = {
  getInsights,
  getUserById,
  getAllTeamMembers,

  /**
   * Get all time logs for a user (alias for getTimeEntries with no filters)
   * @param userId The user's UUID
   * @returns Array of time log entries
   */
  async getTimeLogs(userId: string) {
    return await this.getTimeEntries(userId);
  },

  /**
   * Get all projects for a given user ID.
   * @param userId The user ID to filter projects by
   * @returns Array of Project objects matching the user ID
   */
  async getProjectsByUser(userId: string) {
    if (!userId) return { data: [], error: 'Missing userId' };
    return await safeQueryTable('projects', (query) =>
      query.select('*').eq('user_id', userId)
    );
  },
  /**
   * Ensure all users have a default settings row in user_settings.
   * This can be called at startup or by an admin to backfill missing settings.
   */
  async ensureDefaultSettingsForAllUsers() {
    // 1. Fetch all users
    const { data: users, error: usersError } = await supabase.from('users').select('id');
    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      return;
    }
    // 2. For each user, check if settings exist
    for (const user of users) {
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      if (settingsError || !settings) {
        // 3. Insert default settings if missing
        const defaults = {
          user_id: user.id,
          themeMode: 'system',
          preferredLanguage: 'en',
          notifications_enabled: true,
          // Add all other required default fields here
        };
        const { error: insertError } = await supabase.from('user_settings').insert([defaults]);
        if (insertError) {
          console.error('Failed to insert default settings for user', user.id, insertError);
        } else {
          console.log('Inserted default settings for user', user.id);
        }
      }
    }
  },
  /**
   * Upsert a user into the application's users table.
   * If the user already exists, does nothing. Otherwise, inserts the user.
   * @param user Supabase User object
   */
  async upsertAppUser(user: User) {
    if (!user) return;
    // You may want to add more fields as needed
    const { id, email, user_metadata } = user;
    const full_name = user_metadata?.full_name || user_metadata?.name || '';
    const avatar_url = user_metadata?.avatar_url || '';
    // Enforce username: from user_metadata.username, or fallback to email prefix
    let username = user_metadata?.username || (email ? email.split('@')[0] : '');
    return await supabase
      .from('users')
      .upsert([
        {
          id,
          email,
          full_name,
          avatar_url,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ], { onConflict: 'id' });
  },

  // --- Task Settings CRUD ---
  async getTaskSettings(userId: string) {
    return await safeQueryTable('task_settings', (query) =>
      query.select('*').eq('user_id', userId).single()
    );
  },
  async updateTaskSettings(userId: string, updates: Record<string, any>) {
    return await safeQueryTable('task_settings', (query) =>
      query.update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('user_id', userId)
    );
  },
  async createTaskSettings(userId: string, defaults: Record<string, any> = {}) {
    return await safeQueryTable('task_settings', (query) =>
      query.insert({
        user_id: userId,
        ...defaults
      }).single()
    );
  },

  /* --- InsightIQ CRUD --- */
  async createChart(chartData) {
    return await safeQueryTable('charts', q => q.insert(chartData).single());
  },
  async getChartById(chart_id: string) {
    return await safeQueryTable('charts', q => q.select('*').eq('chart_id', chart_id).single());
  },
  async getAllCharts(report_id: string) {
    return await safeQueryTable('charts', q => q.select('*').eq('report_id', report_id));
  },
  async updateChart(chart_id: string, updates) {
    return await safeQueryTable('charts', q => q.update(updates).eq('chart_id', chart_id));
  },
  async deleteChart(chart_id: string) {
    return await safeQueryTable('charts', q => q.delete().eq('chart_id', chart_id));
  },

  async createDashboard(dashboardData) {
    return await safeQueryTable('dashboards', q => q.insert(dashboardData).single());
  },
  async getDashboardById(dashboard_id: string) {
    return await safeQueryTable('dashboards', q => q.select('*').eq('dashboard_id', dashboard_id).single());
  },
  async getAllDashboards(user_id: string) {
    return await safeQueryTable('dashboards', q => q.select('*').eq('user_id', user_id));
  },
  async updateDashboard(dashboard_id: string, updates) {
    return await safeQueryTable('dashboards', q => q.update(updates).eq('dashboard_id', dashboard_id));
  },
  async deleteDashboard(dashboard_id: string) {
    return await safeQueryTable('dashboards', q => q.delete().eq('dashboard_id', dashboard_id));
  },

  async createDashboardWidget(widgetData) {
    return await safeQueryTable('dashboard_widgets', q => q.insert(widgetData).single());
  },
  async getDashboardWidgets(dashboard_id: string) {
    return await safeQueryTable('dashboard_widgets', q => q.select('*').eq('dashboard_id', dashboard_id));
  },
  async updateDashboardWidget(widget_id: string, updates) {
    return await safeQueryTable('dashboard_widgets', q => q.update(updates).eq('widget_id', widget_id));
  },
  async deleteDashboardWidget(widget_id: string) {
    return await safeQueryTable('dashboard_widgets', q => q.delete().eq('widget_id', widget_id));
  },

  async createKpiMetric(metricData) {
    return await safeQueryTable('kpi_metrics', q => q.insert(metricData).single());
  },
  async getKpiMetricById(metric_id: string) {
    return await safeQueryTable('kpi_metrics', q => q.select('*').eq('metric_id', metric_id).single());
  },
  async getAllKpiMetrics() {
    return await safeQueryTable('kpi_metrics', q => q.select('*'));
  },
  async updateKpiMetric(metric_id: string, updates) {
    return await safeQueryTable('kpi_metrics', q => q.update(updates).eq('metric_id', metric_id));
  },
  async deleteKpiMetric(metric_id: string) {
    return await safeQueryTable('kpi_metrics', q => q.delete().eq('metric_id', metric_id));
  },

  async createReportExport(exportData) {
    return await safeQueryTable('report_exports', q => q.insert(exportData).single());
  },
  async getReportExports(report_id: string) {
    return await safeQueryTable('report_exports', q => q.select('*').eq('report_id', report_id));
  },
  async deleteReportExport(export_id: string) {
    return await safeQueryTable('report_exports', q => q.delete().eq('id', export_id));
  },

  async createScheduledReport(schedData) {
    return await safeQueryTable('scheduled_reports', q => q.insert(schedData).single());
  },
  async getScheduledReports(report_id: string) {
    return await safeQueryTable('scheduled_reports', q => q.select('*').eq('report_id', report_id));
  },
  async deleteScheduledReport(id: string) {
    return await safeQueryTable('scheduled_reports', q => q.delete().eq('id', id));
  },

  async createReportPermission(permData) {
    return await safeQueryTable('report_permissions', q => q.insert(permData).single());
  },
  async getReportPermissions(report_id: string) {
    return await safeQueryTable('report_permissions', q => q.select('*').eq('report_id', report_id));
  },
  async deleteReportPermission(id: string) {
    return await safeQueryTable('report_permissions', q => q.delete().eq('id', id));
  },

  /* --- ResourceHub CRUD --- */
  async createRole(roleData) {
    return await safeQueryTable('roles', q => q.insert(roleData).single());
  },
  async getRoleById(role_id: string) {
    return await safeQueryTable('roles', q => q.select('*').eq('role_id', role_id).single());
  },
  async getAllRoles() {
    return await safeQueryTable('roles', q => q.select('*'));
  },
  async updateRole(role_id: string, updates) {
    return await safeQueryTable('roles', q => q.update(updates).eq('role_id', role_id));
  },
  async deleteRole(role_id: string) {
    return await safeQueryTable('roles', q => q.delete().eq('role_id', role_id));
  },

  async createProjectResource(resourceData) {
    return await safeQueryTable('project_resources', q => q.insert(resourceData).single());
  },
  async getProjectResources(project_id: string) {
    return await safeQueryTable('project_resources', q => q.select('*').eq('project_id', project_id));
  },
  async deleteProjectResource(id: string) {
    return await safeQueryTable('project_resources', q => q.delete().eq('id', id));
  },

  async createResourceAllocation(allocationData) {
    return await safeQueryTable('resource_allocation', q => q.insert(allocationData).single());
  },
  async getResourceAllocations(user_id: string) {
    return await safeQueryTable('resource_allocation', q => q.select('*').eq('user_id', user_id));
  },
  async updateResourceAllocation(id: string, updates) {
    return await safeQueryTable('resource_allocation', q => q.update(updates).eq('id', id));
  },
  async deleteResourceAllocation(id: string) {
    return await safeQueryTable('resource_allocation', q => q.delete().eq('id', id));
  },

  async createUserSkill(skillData) {
    return await safeQueryTable('user_skills', q => q.insert(skillData).single());
  },
  async getUserSkills(user_id: string) {
    return await safeQueryTable('user_skills', q => q.select('*').eq('user_id', user_id));
  },
  async deleteUserSkill(id: string) {
    return await safeQueryTable('user_skills', q => q.delete().eq('id', id));
  },

  async createResourceUtilization(utilData) {
    return await safeQueryTable('resource_utilization', q => q.insert(utilData).single());
  },
  async getResourceUtilization(user_id: string) {
    return await safeQueryTable('resource_utilization', q => q.select('*').eq('user_id', user_id));
  },
  async updateResourceUtilization(id: string, updates) {
    return await safeQueryTable('resource_utilization', q => q.update(updates).eq('id', id));
  },
  async deleteResourceUtilization(id: string) {
    return await safeQueryTable('resource_utilization', q => q.delete().eq('id', id));
  },

  async createAvailabilityCalendar(entryData) {
    return await safeQueryTable('availability_calendar', q => q.insert(entryData).single());
  },
  async getAvailabilityCalendar(user_id: string) {
    return await safeQueryTable('availability_calendar', q => q.select('*').eq('user_id', user_id));
  },
  async updateAvailabilityCalendar(id: string, updates) {
    return await safeQueryTable('availability_calendar', q => q.update(updates).eq('id', id));
  },
  async deleteAvailabilityCalendar(id: string) {
    return await safeQueryTable('availability_calendar', q => q.delete().eq('id', id));
  },

  async createTaskAssignment(assignmentData) {
    return await safeQueryTable('task_assignments', q => q.insert(assignmentData).single());
  },
  async getTaskAssignments(task_id: string) {
    return await safeQueryTable('task_assignments', q => q.select('*').eq('task_id', task_id));
  },
  async deleteTaskAssignment(id: string) {
    return await safeQueryTable('task_assignments', q => q.delete().eq('id', id));
  },
  /* --- FileVault CRUD --- */
  async createFolder(folderData) {
    return await safeQueryTable('folders', q => q.insert(folderData).single());
  },
  async getFolderById(folder_id: string) {
    return await safeQueryTable('folders', q => q.select('*').eq('folder_id', folder_id).single());
  },
  async getAllFolders(userId: string) {
    return await safeQueryTable('folders', q => q.select('*').eq('created_by', userId));
  },
  async updateFolder(folder_id: string, updates) {
    return await safeQueryTable('folders', q => q.update(updates).eq('folder_id', folder_id));
  },
  async deleteFolder(folder_id: string) {
    return await safeQueryTable('folders', q => q.delete().eq('folder_id', folder_id));
  },

  async createFileShare(shareData) {
    return await safeQueryTable('file_shares', q => q.insert(shareData).single());
  },
  async getFileShares(file_id: string) {
    return await safeQueryTable('file_shares', q => q.select('*').eq('file_id', file_id));
  },
  async deleteFileShare(share_id: string) {
    return await safeQueryTable('file_shares', q => q.delete().eq('id', share_id));
  },

  async createFilePermission(permData) {
    return await safeQueryTable('file_permissions', q => q.insert(permData).single());
  },
  async getFilePermissions(file_id: string) {
    return await safeQueryTable('file_permissions', q => q.select('*').eq('file_id', file_id));
  },
  async updateFilePermission(permission_id: string, updates) {
    return await safeQueryTable('file_permissions', q => q.update(updates).eq('id', permission_id));
  },
  async deleteFilePermission(permission_id: string) {
    return await safeQueryTable('file_permissions', q => q.delete().eq('id', permission_id));
  },

  async createFileVersion(versionData) {
    return await safeQueryTable('file_versions', q => q.insert(versionData).single());
  },
  async getFileVersions(file_id: string) {
    return await safeQueryTable('file_versions', q => q.select('*').eq('file_id', file_id));
  },
  async setActiveFileVersion(version_id: string, file_id: string) {
    // Set all to inactive, then set one to active
    await safeQueryTable('file_versions', q => q.update({ is_active: false }).eq('file_id', file_id));
    return await safeQueryTable('file_versions', q => q.update({ is_active: true }).eq('id', version_id));
  },

  async createFileTrash(trashData) {
    return await safeQueryTable('file_trash', q => q.insert(trashData).single());
  },
  async getTrashedFiles(userId: string) {
    return await safeQueryTable('file_trash', q => q.select('*').eq('user_id', userId));
  },
  async restoreTrashedFile(trash_id: string, restored_at: string) {
    return await safeQueryTable('file_trash', q => q.update({ restored_at }).eq('id', trash_id));
  },

  async createFileTag(tagData) {
    return await safeQueryTable('file_tags', q => q.insert(tagData).single());
  },
  async getFileTags(file_id: string) {
    return await safeQueryTable('file_tags', q => q.select('*').eq('file_id', file_id));
  },
  async deleteFileTag(tag_id: string) {
    return await safeQueryTable('file_tags', q => q.delete().eq('id', tag_id));
  },

  async createFileAccessLog(logData) {
    return await safeQueryTable('file_access_logs', q => q.insert(logData).single());
  },
  async getFileAccessLogs(file_id: string) {
    return await safeQueryTable('file_access_logs', q => q.select('*').eq('file_id', file_id));
  },

  async createFileFavorite(favData) {
    return await safeQueryTable('file_favorites', q => q.insert(favData).single());
  },
  async getFileFavorites(user_id: string) {
    return await safeQueryTable('file_favorites', q => q.select('*').eq('user_id', user_id));
  },
  async deleteFileFavorite(fav_id: string) {
    return await safeQueryTable('file_favorites', q => q.delete().eq('id', fav_id));
  },

  /* --- BudgetBuddy CRUD --- */
  async createTransaction(txData) {
    return await safeQueryTable('transactions', q => q.insert(txData).single());
  },
  async getTransactionById(tx_id: string) {
    return await safeQueryTable('transactions', q => q.select('*').eq('id', tx_id).single());
  },
  async getAllTransactions(userId: string) {
    return await safeQueryTable('transactions', q => q.select('*').eq('user_id', userId));
  },
  async updateTransaction(tx_id: string, updates) {
    return await safeQueryTable('transactions', q => q.update(updates).eq('id', tx_id));
  },
  async deleteTransaction(tx_id: string) {
    return await safeQueryTable('transactions', q => q.delete().eq('id', tx_id));
  },

  async createBudget(budgetData) {
    return await safeQueryTable('budgets', q => q.insert(budgetData).single());
  },
  async getBudgetById(budget_id: string) {
    return await safeQueryTable('budgets', q => q.select('*').eq('id', budget_id).single());
  },
  async getAllBudgets(userId: string) {
    return await safeQueryTable('budgets', q => q.select('*').eq('user_id', userId));
  },
  async updateBudget(budget_id: string, updates) {
    return await safeQueryTable('budgets', q => q.update(updates).eq('id', budget_id));
  },
  async deleteBudget(budget_id: string) {
    return await safeQueryTable('budgets', q => q.delete().eq('id', budget_id));
  },

  async createCategory(categoryData) {
    return await safeQueryTable('categories', q => q.insert(categoryData).single());
  },
  async getCategoryById(category_id: string) {
    return await safeQueryTable('categories', q => q.select('*').eq('id', category_id).single());
  },
  async getAllCategories() {
    return await safeQueryTable('categories', q => q.select('*'));
  },
  async updateCategory(category_id: string, updates) {
    return await safeQueryTable('categories', q => q.update(updates).eq('id', category_id));
  },
  async deleteCategory(category_id: string) {
    return await safeQueryTable('categories', q => q.delete().eq('id', category_id));
  },

  async createReport(reportData) {
    return await safeQueryTable('reports', q => q.insert(reportData).single());
  },
  async getReportById(report_id: string) {
    return await safeQueryTable('reports', q => q.select('*').eq('id', report_id).single());
  },
  async getAllReports(userId: string) {
    return await safeQueryTable('reports', q => q.select('*').eq('user_id', userId));
  },
  async updateReport(report_id: string, updates) {
    return await safeQueryTable('reports', q => q.update(updates).eq('id', report_id));
  },
  async deleteReport(report_id: string) {
    return await safeQueryTable('reports', q => q.delete().eq('id', report_id));
  },
  // Check and create all required tables
  async initializeDatabase() {
    try {
      await this.checkUserProfileTable();
      await this.checkSettingsTable();
      await this.checkNotificationsTable();
      await this.checkFilesTable();
      
      console.log('Database initialization complete');
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: 'Database Error',
        description: 'Failed to initialize database. Some features may not work properly.',
        variant: 'destructive',
      });
      return false;
    }
  },

  // Check if a table exists using a safer approach
  async tableExists(tableName: string): Promise<boolean> {
    return await checkTableExists(tableName);
  },

  // Check and create users table if not exists
  async checkUserProfileTable() {
    const exists = await this.tableExists('users');
    if (!exists) {
      console.log('Creating users table...');
      const { error } = await supabase.rpc('create_users_table');
      if (error) {
        console.error('Error creating users table:', error);
      }
    }
  },

  // Check and create user_settings table if not exists
  async checkSettingsTable() {
    const exists = await this.tableExists('user_settings');
    if (!exists) {
      console.log('Creating user_settings table...');
      const { error } = await supabase.rpc('create_user_settings_table');
      if (error) {
        console.error('Error creating user_settings table:', error);
      }
    }
  },

  // Check and create notifications table if not exists
  async checkNotificationsTable() {
    const exists = await this.tableExists('notifications');
    if (!exists) {
      console.log('Creating notifications table...');
      const { error } = await supabase.rpc('create_notifications_table');
      if (error) {
        console.error('Error creating notifications table:', error);
      }
    }
  },

  // Check and create files table if not exists
  async checkFilesTable() {
    const exists = await this.tableExists('files');
    if (!exists) {
      console.log('Creating files table...');
      const { error } = await supabase.rpc('create_files_table');
      if (error) {
        console.error('Error creating files table:', error);
      }
    }
  },

  // Type-safe way to query the notifications table
  async getNotifications(userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  // Type-safe way to update a notification
  async updateNotification(id: string, userId: string, updates: any) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
    );
  },

  // Type-safe way to delete a notification
  async deleteNotification(id: string, userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    );
  },

  // Get user profile
  async getUserProfile(userId: string) {
    return await safeQueryTable('users', (query) => 
      query
        .select('*')
        .eq('id', userId)
        .single()
    );
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<{
    full_name: string, 
    avatar_url: string, 
    bio: string, 
    job_title: string, 
    phone: string, 
    location: string
  }>) {
    return await safeQueryTable('users', (query) => 
      query
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    );
  },

  /**
   * Get all user settings for the given user.
   * This returns all columns from the user_settings table, including all extended ProSync Suite settings fields.
   * @param userId The user's UUID
   * @returns A single settings object or null
   */
  async getUserSettings(userId: string) {
    return await safeQueryTable('user_settings', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .single()
    );
  }, 

  /**
   * Update user settings for the given user.
   * The updates object can include any of the extended ProSync Suite user_settings fields (see migration).
   * @param userId The user's UUID
   * @param updates Partial settings object with any fields to update
   * @returns Update result
   */
  async updateUserSettings(userId: string, updates: Record<string, any>) {
    // updates may include any user_settings field (see migration_user_settings_extend.sql for full list)
    return await safeQueryTable('user_settings', (query) => 
      query
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    );
  },

  // Get files
  async getFiles(userId: string) {
    return await safeQueryTable('files', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Add a file
  async addFile(fileData: {
    name: string;
    description?: string;
    file_type: string;
    size_bytes: number;
    storage_path: string;
    is_public: boolean;
    is_archived: boolean;
    user_id: string;
    project_id?: string;
    task_id?: string;
  }) {
    return await safeQueryTable('files', (query) => 
      query.insert(fileData)
    );
  },
  
  // Delete a file
  async deleteFile(fileId: string, userId: string) {
    return await safeQueryTable('files', (query) => 
      query
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId)
    );
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
    );
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update({ read: true })
        .eq('user_id', userId)
    );
  },
  
  // Get projects
  async getProjects(userId: string) {
    return await safeQueryTable('projects', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Create project
  async createProject(projectData: {
    name: string;
    description?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    user_id: string;
  }) {
    return await safeQueryTable('projects', (query) => 
      query.insert(projectData)
    );
  },
  
  // Get tasks
  async getTasks(userId: string, filters?: {
    status?: string;
    priority?: string;
    project?: string;
  }) {
    return await safeQueryTable('tasks', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.status) {
        filteredQuery = filteredQuery.eq('status', filters.status);
      }
      
      if (filters?.priority) {
        filteredQuery = filteredQuery.eq('priority', filters.priority);
      }
      
      if (filters?.project) {
        filteredQuery = filteredQuery.eq('project', filters.project);
      }
      
      return filteredQuery.order('created_at', { ascending: false });
    });
  },
  
  // Get clients
  async getClients(userId: string) {
    return await safeQueryTable('clients', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Create client
  // async createClient(clientData: {
  //   name: string;
  //   email?: string;
  //   phone?: string;
  //   company?: string;
  //   user_id: string;
  // }) {
  //   return await safeQueryTable('clients', (query) => 
  //     query.insert(clientData)
  //   );
  // },
  
  // Get time entries with enhanced filters
  async getTimeEntries(userId: string, filters?: {
    project_id?: string;
    task_id?: string;
    startDate?: string;
    endDate?: string;
    billable?: boolean;
  }) {
    return await safeQueryTable('time_entries', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.project_id) {
        filteredQuery = filteredQuery.eq('project_id', filters.project_id);
      }
      
      if (filters?.task_id) {
        filteredQuery = filteredQuery.eq('task_id', filters.task_id);
      }
      
      if (filters?.billable !== undefined) {
        filteredQuery = filteredQuery.eq('billable', filters.billable);
      }
      
      if (filters?.startDate) {
        filteredQuery = filteredQuery.gte('date', filters.startDate);
      }
      
      if (filters?.endDate) {
        filteredQuery = filteredQuery.lte('date', filters.endDate);
      }
      
      return filteredQuery.order('date', { ascending: false });
    });
  },

  // Create time entry with enhanced fields
  async createTimeEntry(entryData: {
    description: string;
    project: string;
    project_id?: string;
    task_id?: string;
    time_spent: number;
    date: string;
    user_id: string;
    manual?: boolean;
    billable?: boolean;
    hourly_rate?: number;
    tags?: string[];
    notes?: string;
  }) {
    return await safeQueryTable('time_entries', (query) => 
      query.insert(entryData)
    );
  },

  // Get work sessions
  async getWorkSessions(userId: string, filters?: {
    active_only?: boolean;
    project_id?: string;
    task_id?: string;
  }) {
    return await safeQueryTable('work_sessions', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.active_only) {
        filteredQuery = filteredQuery.eq('is_active', true);
      }
      
      if (filters?.project_id) {
        filteredQuery = filteredQuery.eq('project_id', filters.project_id);
      }
      
      if (filters?.task_id) {
        filteredQuery = filteredQuery.eq('task_id', filters.task_id);
      }
      
      return filteredQuery.order('start_time', { ascending: false });
    });
  },

  // Start a work session
  async startWorkSession(sessionData: {
    user_id: string;
    project_id?: string;
    task_id?: string;
    description?: string;
    start_time: string;
  }) {
    return await safeQueryTable('work_sessions', (query) => 
      query.insert({
        ...sessionData,
        is_active: true
      })
    );
  },

  // End a work session
  async endWorkSession(sessionId: string, userId: string, endTime: string, durationSeconds: number) {
    return await safeQueryTable('work_sessions', (query) => 
      query
        .update({
          end_time: endTime,
          duration_seconds: durationSeconds,
          is_active: false
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
    );
  },

  // Get timesheets
  async getTimesheets(userId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return await safeQueryTable('timesheets', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.status) {
        filteredQuery = filteredQuery.eq('status', filters.status);
      }
      
      if (filters?.startDate) {
        filteredQuery = filteredQuery.gte('start_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        filteredQuery = filteredQuery.lte('end_date', filters.endDate);
      }
      
      return filteredQuery.order('start_date', { ascending: false });
    });
  },

  // Create timesheet
  async createTimesheet(timesheetData: {
    user_id: string;
    start_date: string;
    end_date: string;
    status?: string;
    notes?: string;
  }) {
    return await safeQueryTable('timesheets', (query) => 
      query.insert(timesheetData)
    );
  },

  // Update timesheet
  async updateTimesheet(timesheetId: string, userId: string, updates: {
    status?: string;
    total_hours?: number;
    billable_hours?: number;
    non_billable_hours?: number;
    notes?: string;
    submitted_at?: string;
  }) {
    return await safeQueryTable('timesheets', (query) => 
      query
        .update(updates)
        .eq('id', timesheetId)
        .eq('user_id', userId)
    );
  },

  // Add entries to timesheet
  async addTimeEntriesToTimesheet(timesheetId: string, timeEntryIds: string[]) {
    const entries = timeEntryIds.map(entryId => ({
      timesheet_id: timesheetId,
      time_entry_id: entryId
    }));
    
    if (entries.length === 0) {
      console.log("No time entries to add to timesheet");
      return { data: [], error: null };
    }
    
    return await safeQueryTable('timesheet_entries', (query) => 
      query.insert(entries)
    );
  },

  // Get productivity metrics
  async getProductivityMetrics(userId: string, startDate?: string, endDate?: string) {
    return await safeQueryTable('productivity_metrics', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (startDate) {
        filteredQuery = filteredQuery.gte('date', startDate);
      }
      
      if (endDate) {
        filteredQuery = filteredQuery.lte('date', endDate);
      }
      
      return filteredQuery.order('date', { ascending: false });
    });
  },

  // Update or insert productivity metrics for a day
  async upsertProductivityMetrics(userId: string, date: string, metrics: {
    total_hours: number;
    billable_percentage?: number;
    efficiency_score?: number;
    focus_time_minutes?: number;
    break_time_minutes?: number;
    distractions_count?: number;
  }) {
    // Check if metrics exist for this date
    const { data, error } = await safeQueryTable('productivity_metrics', (query) => 
      query
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
    );
    
    // Fix: Check if data exists and has at least one element before accessing id
    if (data && data.length > 0 && data[0]?.id) {
      // Update existing record
      return await safeQueryTable('productivity_metrics', (query) => 
        query
          .update(metrics)
          .eq('id', data[0].id)
          .eq('user_id', userId)
      );
    } else {
      // Insert new record
      return await safeQueryTable('productivity_metrics', (query) => 
        query.insert({
          user_id: userId,
          date,
          ...metrics
        })
      );
    }
  },

  // Get billing rates
  async getBillingRates(userId: string, filters?: {
    project_id?: string;
    client_id?: string;
    is_default?: boolean;
  }) {
    return await safeQueryTable('billing_rates', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.project_id) {
        filteredQuery = filteredQuery.eq('project_id', filters.project_id);
      }
      
      if (filters?.client_id) {
        filteredQuery = filteredQuery.eq('client_id', filters.client_id);
      }
      
      if (filters?.is_default !== undefined) {
        filteredQuery = filteredQuery.eq('is_default', filters.is_default);
      }
      
      return filteredQuery.order('created_at', { ascending: false });
    });
  },

  // Create billing rate
  async createBillingRate(rateData: {
    user_id: string;
    project_id?: string;
    client_id?: string;
    rate_amount: number;
    rate_type?: string;
    currency?: string;
    effective_from?: string;
    effective_to?: string;
    is_default?: boolean;
  }) {
    return await safeQueryTable('billing_rates', (query) => 
      query.insert(rateData)
    );
  },

  // --- FileVault & BudgetBuddy Add Functions ---

  // --- ClientConnect & RiskRadar Add Functions ---

  // CLIENTCONNECT TABLES
  async addClient(client: { name: string; industry?: string }) {
    return await safeQueryTable('clients', q => q.insert(client).single());
  },
  async addClientUser(clientUser: { client_id: string; email: string }) {
    return await safeQueryTable('client_users', q => q.insert(clientUser).single());
  },
  async addClientPortalAccess(clientPortalAccess: { user_id: string; login_time?: string }) {
    return await safeQueryTable('client_portal_access', q => q.insert(clientPortalAccess).single());
  },
  async addClientProject(clientProject: { client_id: string; project_id: string }) {
    return await safeQueryTable('client_projects', q => q.insert(clientProject).single());
  },
  async addClientFile(clientFile: { file_id: string; client_id: string }) {
    return await safeQueryTable('client_files', q => q.insert(clientFile).single());
  },
  async addClientMessage(clientMessage: { from_user_id: string; to_user_id: string; message: string }) {
    return await safeQueryTable('client_messages', q => q.insert(clientMessage).single());
  },
  async addClientFeedback(clientFeedback: { project_id: string; rating: number; comments?: string }) {
    return await safeQueryTable('client_feedback', q => q.insert(clientFeedback).single());
  },
  async addSupportTicket(supportTicket: { client_id: string; status: string }) {
    return await safeQueryTable('support_tickets', q => q.insert(supportTicket).single());
  },
  async addClientView(clientView: { user_id: string; project_id: string }) {
    return await safeQueryTable('client_views', q => q.insert(clientView).single());
  },
  async addClientMeeting(clientMeeting: { client_id: string; time?: string }) {
    return await safeQueryTable('client_meetings', q => q.insert(clientMeeting).single());
  },
  async addClientDashboard(clientDashboard: { client_id: string }) {
    return await safeQueryTable('client_dashboards', q => q.insert(clientDashboard).single());
  },
  async addClientNotification(clientNotification: { user_id: string; message: string }) {
    return await safeQueryTable('client_notifications', q => q.insert(clientNotification).single());
  },
  async addSharedReport(sharedReport: { report_id: string; client_id: string }) {
    return await safeQueryTable('shared_reports', q => q.insert(sharedReport).single());
  },
  async addClientContract(clientContract: { client_id: string }) {
    return await safeQueryTable('client_contracts', q => q.insert(clientContract).single());
  },
  async addClientIssue(clientIssue: { status: string; priority: string }) {
    return await safeQueryTable('client_issues', q => q.insert(clientIssue).single());
  },
  async addClientSla(clientSla: { client_id: string; response_time: string }) {
    return await safeQueryTable('client_sla', q => q.insert(clientSla).single());
  },
  async addSharedTask(sharedTask: { task_id: string; client_id: string }) {
    return await safeQueryTable('shared_tasks', q => q.insert(sharedTask).single());
  },
  async addSharedGantt(sharedGantt: { plan_id: string; share_token: string }) {
    return await safeQueryTable('shared_gantt', q => q.insert(sharedGantt).single());
  },
  async addClientUpload(clientUpload: { file_id: string; uploaded_by: string }) {
    return await safeQueryTable('client_uploads', q => q.insert(clientUpload).single());
  },
  async addFeedbackReminder(feedbackReminder: { client_id: string; due_date: string }) {
    return await safeQueryTable('feedback_reminders', q => q.insert(feedbackReminder).single());
  },
  async addClientTheme(clientTheme: { client_id: string; logo_url: string }) {
    return await safeQueryTable('client_theme', q => q.insert(clientTheme).single());
  },
  async addAccountManager(accountManager: { client_id: string; user_id: string }) {
    return await safeQueryTable('account_managers', q => q.insert(accountManager).single());
  },
  async addClientLanguage(clientLanguage: { client_id: string; language: string }) {
    return await safeQueryTable('client_language', q => q.insert(clientLanguage).single());
  },
  async addClientPermission(clientPermission: { user_id: string; permission: string }) {
    return await safeQueryTable('client_permissions', q => q.insert(clientPermission).single());
  },
  async addClientTimeLog(clientTimeLog: { client_id: string }) {
    return await safeQueryTable('client_time_logs', q => q.insert(clientTimeLog).single());
  },
  async addClientInvoiceCC(clientInvoice: { client_id: string }) {
    return await safeQueryTable('client_invoices', q => q.insert(clientInvoice).single());
  },
  async addExternalInvite(externalInvite: { invite_email: string; role: string }) {
    return await safeQueryTable('external_invites', q => q.insert(externalInvite).single());
  },
  async addClientAsset(clientAsset: { file_id: string; asset_type: string }) {
    return await safeQueryTable('client_assets', q => q.insert(clientAsset).single());
  },
  async addClientEmail(clientEmail: { subject: string }) {
    return await safeQueryTable('client_emails', q => q.insert(clientEmail).single());
  },
  async addClientFileLog(clientFileLog: { file_id: string; user_id: string }) {
    return await safeQueryTable('client_file_logs', q => q.insert(clientFileLog).single());
  },
  async addClientRating(clientRating: { project_id: string; rating: number }) {
    return await safeQueryTable('client_ratings', q => q.insert(clientRating).single());
  },
  async addStageApproval(stageApproval: { stage_id: string; client_id: string }) {
    return await safeQueryTable('stage_approvals', q => q.insert(stageApproval).single());
  },
  async addClientNote(clientNote: { user_id: string; text: string }) {
    return await safeQueryTable('client_notes', q => q.insert(clientNote).single());
  },
  async addFeedbackReviewer(feedbackReviewer: { reviewer_id: string; feedback_id: number }) {
    return await safeQueryTable('feedback_reviewers', q => q.insert(feedbackReviewer).single());
  },
  async addClientLogin(clientLogin: { user_id: string; login_time?: string }) {
    return await safeQueryTable('client_logins', q => q.insert(clientLogin).single());
  },
  async addClientAnalytics(clientAnalytics: { client_id: string; activity_type: string }) {
    return await safeQueryTable('client_analytics', q => q.insert(clientAnalytics).single());
  },
  async addClientTask(clientTask: { task_id: string; assigned_to: string }) {
    return await safeQueryTable('client_tasks', q => q.insert(clientTask).single());
  },
  async addClientSuggestion(clientSuggestion: { user_id: string; suggestion: string }) {
    return await safeQueryTable('client_suggestions', q => q.insert(clientSuggestion).single());
  },
  async addClientAiSummary(clientAiSummary: { conversation_id: string }) {
    return await safeQueryTable('client_ai_summary', q => q.insert(clientAiSummary).single());
  },
// --- RiskRadar TABLES ---
  async addRisk(risk: { project_id: string; title: string }) {
    return await safeQueryTable('risks', q => q.insert(risk).single());
  },
  async addRiskCategory(riskCategory: { name: string }) {
    return await safeQueryTable('risk_categories', q => q.insert(riskCategory).single());
  },
  async addRiskOwner(riskOwner: { risk_id: string; user_id: string }) {
    return await safeQueryTable('risk_owners', q => q.insert(riskOwner).single());
  },
  async addRiskImpact(riskImpact: { risk_id: string; severity: string; likelihood: string }) {
    return await safeQueryTable('risk_impact', q => q.insert(riskImpact).single());
  },
  async addRiskMitigation(riskMitigation: { risk_id: string; strategy: string }) {
    return await safeQueryTable('risk_mitigation', q => q.insert(riskMitigation).single());
  },
  async addRiskStatus(riskStatus: { risk_id: string; status: string }) {
    return await safeQueryTable('risk_status', q => q.insert(riskStatus).single());
  },
  async addRiskScore(riskScore: { risk_id: string; score: number }) {
    return await safeQueryTable('risk_scores', q => q.insert(riskScore).single());
  },
  async addRiskLog(riskLog: { risk_id: string; user_id: string; action: string }) {
    return await safeQueryTable('risk_logs', q => q.insert(riskLog).single());
  },
  async addRiskDeadline(riskDeadline: { risk_id: string; due_date: string }) {
    return await safeQueryTable('risk_deadlines', q => q.insert(riskDeadline).single());
  },
  async addRiskReport(riskReport: { risk_id: string }) {
    return await safeQueryTable('risk_reports', q => q.insert(riskReport).single());
  },
  async addRiskTag(riskTag: { risk_id: string; tag: string }) {
    return await safeQueryTable('risk_tags', q => q.insert(riskTag).single());
  },
  async addInsightRisk(insightRisk: { risk_id: string; metric: string }) {
    return await safeQueryTable('insight_risks', q => q.insert(insightRisk).single());
  },
  async addPlanRisk(planRisk: { plan_id: string; risk_id: string }) {
    return await safeQueryTable('plan_risks', q => q.insert(planRisk).single());
  },
  async addRiskTask(riskTask: { task_id: string; risk_id: string }) {
    return await safeQueryTable('risk_tasks', q => q.insert(riskTask).single());
  },
  async addRiskHeatmap(riskHeatmap: { project_id: string; data: any }) {
    return await safeQueryTable('risk_heatmap', q => q.insert(riskHeatmap).single());
  },
  async addRiskAlert(riskAlert: { risk_id: string; alert_type: string }) {
    return await safeQueryTable('risk_alerts', q => q.insert(riskAlert).single());
  },
  async addRiskHistory(riskHistory: { risk_id: string; past_scores: any }) {
    return await safeQueryTable('risk_history', q => q.insert(riskHistory).single());
  },
  async addRiskTemplate(riskTemplate: { category: string }) {
    return await safeQueryTable('risk_templates', q => q.insert(riskTemplate).single());
  },
  async addAiRisk(aiRisk: { project_id: string; prediction: string }) {
    return await safeQueryTable('ai_risks', q => q.insert(aiRisk).single());
  },
  async addRiskPhase(riskPhase: { risk_ids: string[] }) {
    return await safeQueryTable('risk_phase', q => q.insert(riskPhase).single());
  },
  async addRiskDocument(riskDocument: { risk_id: string }) {
    return await safeQueryTable('risk_documents', q => q.insert(riskDocument).single());
  },
  async addRiskEscalation(riskEscalation: { risk_id: string; steps: string }) {
    return await safeQueryTable('risk_escalation', q => q.insert(riskEscalation).single());
  },
  async addAutoResolved(autoResolved: { risk_id: string; close_date: string }) {
    return await safeQueryTable('auto_resolved', q => q.insert(autoResolved).single());
  },
  async addRiskComment(riskComment: { risk_id: string; comment: string }) {
    return await safeQueryTable('risk_comments', q => q.insert(riskComment).single());
  },
  async addRiskWatchlist(riskWatchlist: { user_id: string; risk_id: string }) {
    return await safeQueryTable('risk_watchlist', q => q.insert(riskWatchlist).single());
  },
  async addMitigationOwner(mitigationOwner: { mitigation_id: string; user_id: string }) {
    return await safeQueryTable('mitigation_owners', q => q.insert(mitigationOwner).single());
  },
  async addRiskMatrix(riskMatrix: { impact: string; probability: string }) {
    return await safeQueryTable('risk_matrix', q => q.insert(riskMatrix).single());
  },
  async addRiskCost(riskCost: { risk_id: string; estimated_cost: number }) {
    return await safeQueryTable('risk_costs', q => q.insert(riskCost).single());
  },
  async addEscalationNotification(escalationNotification: { risk_id: string; status: string }) {
    return await safeQueryTable('escalation_notifications', q => q.insert(escalationNotification).single());
  },
  async addOrgRiskIndex(orgRiskIndex: { department_id: string; score: number }) {
    return await safeQueryTable('org_risk_index', q => q.insert(orgRiskIndex).single());
  },
  async addClientRiskReport(clientRiskReport: { client_id: string; risk_id: string }) {
    return await safeQueryTable('client_risk_reports', q => q.insert(clientRiskReport).single());
  },
  async addSlaRisk(slaRisk: { sla_id: string; risk_id: string }) {
    return await safeQueryTable('sla_risks', q => q.insert(slaRisk).single());
  },
  async addRiskApproval(riskApproval: { risk_id: string; approved_by: string }) {
    return await safeQueryTable('risk_approvals', q => q.insert(riskApproval).single());
  },
  async addConfidentialRisk(confidentialRisk: { risk_id: string; flag: boolean }) {
    return await safeQueryTable('confidential_risks', q => q.insert(confidentialRisk).single());
  },
  async addRiskDigest(riskDigest: { user_id: string; date: string }) {
    return await safeQueryTable('risk_digests', q => q.insert(riskDigest).single());
  },
  async addMitigationOverdue(mitigationOverdue: { risk_id: string; deadline: string }) {
    return await safeQueryTable('mitigation_overdue', q => q.insert(mitigationOverdue).single());
  },
  async addScorecard(scorecard: { risk_id: string }) {
    return await safeQueryTable('scorecards', q => q.insert(scorecard).single());
  },
  async addComplianceRisk(complianceRisk: { standard_id: string; risk_id: string }) {
    return await safeQueryTable('compliance_risks', q => q.insert(complianceRisk).single());
  },
  async addReviewCalendar(reviewCalendar: { risk_id: string; review_date: string }) {
    return await safeQueryTable('review_calendar', q => q.insert(reviewCalendar).single());
  },
  async addGroupTrend(groupTrend: { group_id: string; trend_data: any }) {
    return await safeQueryTable('group_trends', q => q.insert(groupTrend).single());
  },
  async addRiskExport(riskExport: { format: string; file_url: string }) {
    return await safeQueryTable('risk_exports', q => q.insert(riskExport).single());
  },
  async addDepartmentRisk(departmentRisk: { department_id: string; heatmap: any }) {
    return await safeQueryTable('department_risks', q => q.insert(departmentRisk).single());
  },
  async addRiskReviewer(riskReviewer: { reviewer_id: string; risk_id: string }) {
    return await safeQueryTable('risk_reviewers', q => q.insert(riskReviewer).single());
  },
  async addWeeklySummary(weeklySummary: { week_start: string; risk_list: string[] }) {
    return await safeQueryTable('weekly_summary', q => q.insert(weeklySummary).single());
  },
  async addRiskImport(riskImport: { status: string }) {
    return await safeQueryTable('risk_imports', q => q.insert(riskImport).single());
  },
  async addRiskKpi(riskKpi: { value: number }) {
    return await safeQueryTable('risk_kpis', q => q.insert(riskKpi).single());
  },
  async addCrossProjectRisk(crossProjectRisk: { risk_id: string; linked_projects: string[] }) {
    return await safeQueryTable('cross_project_risks', q => q.insert(crossProjectRisk).single());
  },
  async addArchivedRisk(archivedRisk: { risk_id: string; archived_date: string }) {
    return await safeQueryTable('archived_risks', q => q.insert(archivedRisk).single());
  },
  async addAuditLink(auditLink: { audit_id: string; risk_id: string }) {
    return await safeQueryTable('audit_links', q => q.insert(auditLink).single());
  },

  // FILEVAULT TABLES
  async addFolder(folder: { folder_name: string; created_by?: string; created_at?: string }) {
    return await safeQueryTable('folders', q => q.insert(folder).single());
  },
  async addFileShare(fileShare: { file_id: string; shared_with_id: string; shared_with_type: string; created_at?: string }) {
    return await safeQueryTable('file_shares', q => q.insert(fileShare).single());
  },
  async addFilePermission(filePermission: { file_id: string; user_id: string; access_level: string; created_at?: string }) {
    return await safeQueryTable('file_permissions', q => q.insert(filePermission).single());
  },
  async addFileVersion(fileVersion: { file_id: string; version_no: number; uploaded_at?: string; is_active?: boolean }) {
    return await safeQueryTable('file_versions', q => q.insert(fileVersion).single());
  },
  async addFileTrash(fileTrash: { file_id: string; deleted_at?: string; restored_at?: string }) {
    return await safeQueryTable('file_trash', q => q.insert(fileTrash).single());
  },
  async addFileTag(fileTag: { file_id: string; tag: string }) {
    return await safeQueryTable('file_tags', q => q.insert(fileTag).single());
  },
  async addFileAccessLog(fileAccessLog: { file_id: string; accessed_by: string; accessed_at?: string }) {
    return await safeQueryTable('file_access_logs', q => q.insert(fileAccessLog).single());
  },
  async addFileFavorite(fileFavorite: { file_id: string; user_id: string }) {
    return await safeQueryTable('file_favorites', q => q.insert(fileFavorite).single());
  },
  async addFileLog(fileLog: { file_id: string; action: string; actor_id: string; created_at?: string }) {
    return await safeQueryTable('file_logs', q => q.insert(fileLog).single());
  },
  async addFileDownload(fileDownload: { file_id: string; user_id: string; timestamp?: string }) {
    return await safeQueryTable('file_downloads', q => q.insert(fileDownload).single());
  },
  async addFileBackup(fileBackup: { file_id: string; backup_time?: string }) {
    return await safeQueryTable('file_backups', q => q.insert(fileBackup).single());
  },
  async addFileLink(fileLink: { file_id: string; expiry_date?: string; password_protected?: boolean }) {
    return await safeQueryTable('file_links', q => q.insert(fileLink).single());
  },
  async addAnnotation(annotation: { file_id: string; user_id: string; content: string }) {
    return await safeQueryTable('annotations', q => q.insert(annotation).single());
  },
  async addFileApproval(fileApproval: { file_id: string; approver_id: string; status: string }) {
    return await safeQueryTable('file_approvals', q => q.insert(fileApproval).single());
  },
  async addExternalLink(externalLink: { file_id: string; access_token: string }) {
    return await safeQueryTable('external_links', q => q.insert(externalLink).single());
  },
  async addStorageStat(storageStat: { user_id: string; total_storage: number }) {
    return await safeQueryTable('storage_stats', q => q.insert(storageStat).single());
  },
  async addFileLock(fileLock: { file_id: string; locked_by: string }) {
    return await safeQueryTable('file_locks', q => q.insert(fileLock).single());
  },
  async addTaskFile(taskFile: { task_id: string; file_id: string }) {
    return await safeQueryTable('task_files', q => q.insert(taskFile).single());
  },
  async addGanttFile(ganttFile: { item_id: string; file_id: string }) {
    return await safeQueryTable('gantt_files', q => q.insert(ganttFile).single());
  },
  async addOcrText(ocrText: { file_id: string; extracted_text: string }) {
    return await safeQueryTable('ocr_texts', q => q.insert(ocrText).single());
  },
  async addFileConversion(fileConversion: { file_id: string; target_format: string }) {
    return await safeQueryTable('file_conversions', q => q.insert(fileConversion).single());
  },
  async addFileCategory(fileCategory: { file_id: string; category: string }) {
    return await safeQueryTable('file_categories', q => q.insert(fileCategory).single());
  },
  async addMobileUpload(mobileUpload: { file_id: string; device_id: string }) {
    return await safeQueryTable('mobile_uploads', q => q.insert(mobileUpload).single());
  },
  async addApiKey(apiKey: { access_scope: string }) {
    return await safeQueryTable('api_keys', q => q.insert(apiKey).single());
  },
  async addFileAudit(fileAudit: { action: string; user_id: string; created_at?: string }) {
    return await safeQueryTable('file_audit', q => q.insert(fileAudit).single());
  },
  async addFileSync(fileSync: { file_id: string; sync_status: string }) {
    return await safeQueryTable('file_sync', q => q.insert(fileSync).single());
  },
  async addFileNote(fileNote: { file_id: string; content: string }) {
    return await safeQueryTable('file_notes', q => q.insert(fileNote).single());
  },
  async addFileSession(fileSession: { file_id: string; session_id: string }) {
    return await safeQueryTable('file_sessions', q => q.insert(fileSession).single());
  },
  async addChatFile(chatFile: { message_id: string; file_id: string }) {
    return await safeQueryTable('chat_files', q => q.insert(chatFile).single());
  },
  async addDashboardFile(dashboardFile: { widget_id: string; file_id: string }) {
    return await safeQueryTable('dashboard_files', q => q.insert(dashboardFile).single());
  },
  async addFileDeleteAfter(fileDeleteAfter: { file_id: string; delete_after: string }) {
    return await safeQueryTable('file_delete_after', q => q.insert(fileDeleteAfter).single());
  },
  async addAlert(alert: { alert_type: string; file_id: string }) {
    return await safeQueryTable('alerts', q => q.insert(alert).single());
  },
  async addAdminSetting(adminSetting: { setting_name: string; value: string }) {
    return await safeQueryTable('admin_settings', q => q.insert(adminSetting).single());
  },
  async addFileRestriction(fileRestriction: { allowed_type: string }) {
    return await safeQueryTable('file_restrictions', q => q.insert(fileRestriction).single());
  },
  async addLegalHold(legalHold: { file_id: string }) {
    return await safeQueryTable('legal_holds', q => q.insert(legalHold).single());
  },
  async addFileInsight(fileInsight: { file_id: string; metric: string }) {
    return await safeQueryTable('file_insights', q => q.insert(fileInsight).single());
  },

  // BUDGETBUDDY TABLES
  async addTransaction(transaction: { user_id: string; type: string; amount: number; category_id: string; created_at?: string }) {
    return await safeQueryTable('transactions', q => q.insert(transaction).single());
  },
  async addBudget(budget: { user_id: string; month: number; year: number; total_budget: number }) {
    return await safeQueryTable('budgets', q => q.insert(budget).single());
  },
  async addCategory(category: { category_name: string }) {
    return await safeQueryTable('categories', q => q.insert(category).single());
  },
  async addReport(report: { user_id: string; report_type: string; generated_at?: string }) {
    return await safeQueryTable('reports', q => q.insert(report).single());
  },
  async addProjectBudget(projectBudget: { project_id: string; budget_id: string }) {
    return await safeQueryTable('project_budgets', q => q.insert(projectBudget).single());
  },
  async addExpenseApproval(expenseApproval: { expense_id: string; status: string }) {
    return await safeQueryTable('expense_approvals', q => q.insert(expenseApproval).single());
  },
  async addReceipt(receipt: { transaction_id: string; file_url: string }) {
    return await safeQueryTable('receipts', q => q.insert(receipt).single());
  },
  async addSpendingLimit(spendingLimit: { category_id: string; limit: number }) {
    return await safeQueryTable('spending_limits', q => q.insert(spendingLimit).single());
  },
  async addCurrency(currency: { currency_code: string; exchange_rate: number }) {
    return await safeQueryTable('currencies', q => q.insert(currency).single());
  },
  async addReimbursement(reimbursement: { transaction_id: string; reimbursed: boolean }) {
    return await safeQueryTable('reimbursements', q => q.insert(reimbursement).single());
  },
  async addDashboardWidget(dashboardWidget: { widget_type: string; user_id: string }) {
    return await safeQueryTable('dashboard_widgets', q => q.insert(dashboardWidget).single());
  },
  async addExport(exportObj: { export_type: string; file_url: string }) {
    return await safeQueryTable('exports', q => q.insert(exportObj).single());
  },
  async addTimesheetBilling(timesheetBilling: { entry_id: string; billable_amount: number }) {
    return await safeQueryTable('timesheet_billing', q => q.insert(timesheetBilling).single());
  },
  async addDepartmentExpense(departmentExpense: { dept_id: string; category_id: string }) {
    return await safeQueryTable('department_expenses', q => q.insert(departmentExpense).single());
  },
  async addRecurringTransaction(recurringTransaction: { interval: string; start_date: string }) {
    return await safeQueryTable('recurring_transactions', q => q.insert(recurringTransaction).single());
  },
  async addVendor(vendor: { name: string; contact: string }) {
    return await safeQueryTable('vendors', q => q.insert(vendor).single());
  },
  async addClientInvoice(clientInvoice: { invoice_id: string; client_id: string }) {
    return await safeQueryTable('client_invoices', q => q.insert(clientInvoice).single());
  },
  async addInvoice(invoice: { amount: number; due_date: string }) {
    return await safeQueryTable('invoices', q => q.insert(invoice).single());
  },
  async addTax(tax: { rate: number; category_id: string }) {
    return await safeQueryTable('taxes', q => q.insert(tax).single());
  },
  async addFinancialAudit(financialAudit: { transaction_id: string; action: string }) {
    return await safeQueryTable('financial_audit', q => q.insert(financialAudit).single());
  },

// --- ClientConnect CRUD ---

  async getClientById(client_id: string) {
    return await safeQueryTable('clients', q => q.select('*').eq('client_id', client_id).single());
  },
  async updateClient(client_id: string, updates) {
    return await safeQueryTable('clients', q => q.update(updates).eq('client_id', client_id));
  },
  async deleteClient(client_id: string) {
    return await safeQueryTable('clients', q => q.delete().eq('client_id', client_id));
  },

  async createClientUser(userData) {
    return await safeQueryTable('client_users', q => q.insert(userData).single());
  },
  async getClientUserById(user_id: string) {
    return await safeQueryTable('client_users', q => q.select('*').eq('user_id', user_id).single());
  },
  async updateClientUser(user_id: string, updates) {
    return await safeQueryTable('client_users', q => q.update(updates).eq('user_id', user_id));
  },
  async deleteClientUser(user_id: string) {
    return await safeQueryTable('client_users', q => q.delete().eq('user_id', user_id));
  },

  // --- RiskRadar CRUD ---
  async createRisk(riskData) {
    return await safeQueryTable('risks', q => q.insert(riskData).single());
  },

  async getAllRisks() {
    return await safeQueryTable('risks', q => q.select('*'));
  },
  async getRiskById(risk_id: string) {
    return await safeQueryTable('risks', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRisk(risk_id: string, updates) {
    return await safeQueryTable('risks', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRisk(risk_id: string) {
    return await safeQueryTable('risks', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskCategory(categoryData) {
    return await safeQueryTable('risk_categories', q => q.insert(categoryData).single());
  },
  async getRiskCategoryById(category_id: string) {
    return await safeQueryTable('risk_categories', q => q.select('*').eq('category_id', category_id).single());
  },
  async updateRiskCategory(category_id: string, updates) {
    return await safeQueryTable('risk_categories', q => q.update(updates).eq('category_id', category_id));
  },
  async deleteRiskCategory(category_id: string) {
    return await safeQueryTable('risk_categories', q => q.delete().eq('category_id', category_id));
  },

  // --- ClientConnect: Remaining Tables CRUD ---
  async createClientPortalAccess(data) {
    return await safeQueryTable('client_portal_access', q => q.insert(data).single());
  },
  async getClientPortalAccessByUserId(user_id: string) {
    return await safeQueryTable('client_portal_access', q => q.select('*').eq('user_id', user_id).single());
  },
  async updateClientPortalAccess(user_id: string, updates) {
    return await safeQueryTable('client_portal_access', q => q.update(updates).eq('user_id', user_id));
  },
  async deleteClientPortalAccess(user_id: string) {
    return await safeQueryTable('client_portal_access', q => q.delete().eq('user_id', user_id));
  },

  async createClientProjects(data) {
    return await safeQueryTable('client_projects', q => q.insert(data).single());
  },
  async getClientProjectsByClientId(client_id: string) {
    return await safeQueryTable('client_projects', q => q.select('*').eq('client_id', client_id));
  },
  async updateClientProjects(client_id: string, project_id: string, updates) {
    return await safeQueryTable('client_projects', q => q.update(updates).eq('client_id', client_id).eq('project_id', project_id));
  },
  async deleteClientProjects(client_id: string, project_id: string) {
    return await safeQueryTable('client_projects', q => q.delete().eq('client_id', client_id).eq('project_id', project_id));
  },

  async createClientFiles(data) {
    return await safeQueryTable('client_files', q => q.insert(data).single());
  },
  async getClientFilesById(file_id: string) {
    return await safeQueryTable('client_files', q => q.select('*').eq('file_id', file_id).single());
  },
  async updateClientFiles(file_id: string, updates) {
    return await safeQueryTable('client_files', q => q.update(updates).eq('file_id', file_id));
  },
  async deleteClientFiles(file_id: string) {
    return await safeQueryTable('client_files', q => q.delete().eq('file_id', file_id));
  },

  async createClientMessages(data) {
    return await safeQueryTable('client_messages', q => q.insert(data).single());
  },
  async getClientMessagesById(message_id: string) {
    return await safeQueryTable('client_messages', q => q.select('*').eq('message_id', message_id).single());
  },
  async updateClientMessages(message_id: string, updates) {
    return await safeQueryTable('client_messages', q => q.update(updates).eq('message_id', message_id));
  },
  async deleteClientMessages(message_id: string) {
    return await safeQueryTable('client_messages', q => q.delete().eq('message_id', message_id));
  },

  async createClientFeedback(data) {
    return await safeQueryTable('client_feedback', q => q.insert(data).single());
  },
  async getClientFeedbackByProjectId(project_id: string) {
    return await safeQueryTable('client_feedback', q => q.select('*').eq('project_id', project_id));
  },
  async updateClientFeedback(project_id: string, updates) {
    return await safeQueryTable('client_feedback', q => q.update(updates).eq('project_id', project_id));
  },
  async deleteClientFeedback(project_id: string) {
    return await safeQueryTable('client_feedback', q => q.delete().eq('project_id', project_id));
  },

  async createSupportTicket(data) {
    return await safeQueryTable('support_tickets', q => q.insert(data).single());
  },
  async getSupportTicketById(ticket_id: string) {
    return await safeQueryTable('support_tickets', q => q.select('*').eq('ticket_id', ticket_id).single());
  },
  async updateSupportTicket(ticket_id: string, updates) {
    return await safeQueryTable('support_tickets', q => q.update(updates).eq('ticket_id', ticket_id));
  },
  async deleteSupportTicket(ticket_id: string) {
    return await safeQueryTable('support_tickets', q => q.delete().eq('ticket_id', ticket_id));
  },

  // --- Next batch of ClientConnect CRUD ---
  async createClientFileLog(data) {
    return await safeQueryTable('client_file_logs', q => q.insert(data).single());
  },
  async getClientFileLog(file_id: string, user_id: string) {
    return await safeQueryTable('client_file_logs', q => q.select('*').eq('file_id', file_id).eq('user_id', user_id).single());
  },
  async updateClientFileLog(file_id: string, user_id: string, updates) {
    return await safeQueryTable('client_file_logs', q => q.update(updates).eq('file_id', file_id).eq('user_id', user_id));
  },
  async deleteClientFileLog(file_id: string, user_id: string) {
    return await safeQueryTable('client_file_logs', q => q.delete().eq('file_id', file_id).eq('user_id', user_id));
  },

  async createClientRating(data) {
    return await safeQueryTable('client_ratings', q => q.insert(data).single());
  },
  async getClientRating(project_id: string) {
    return await safeQueryTable('client_ratings', q => q.select('*').eq('project_id', project_id).single());
  },
  async updateClientRating(project_id: string, updates) {
    return await safeQueryTable('client_ratings', q => q.update(updates).eq('project_id', project_id));
  },
  async deleteClientRating(project_id: string) {
    return await safeQueryTable('client_ratings', q => q.delete().eq('project_id', project_id));
  },

  async createStageApproval(data) {
    return await safeQueryTable('stage_approvals', q => q.insert(data).single());
  },
  async getStageApproval(stage_id: string, client_id: string) {
    return await safeQueryTable('stage_approvals', q => q.select('*').eq('stage_id', stage_id).eq('client_id', client_id).single());
  },
  async updateStageApproval(stage_id: string, client_id: string, updates) {
    return await safeQueryTable('stage_approvals', q => q.update(updates).eq('stage_id', stage_id).eq('client_id', client_id));
  },
  async deleteStageApproval(stage_id: string, client_id: string) {
    return await safeQueryTable('stage_approvals', q => q.delete().eq('stage_id', stage_id).eq('client_id', client_id));
  },

  async createClientNote(data) {
    return await safeQueryTable('client_notes', q => q.insert(data).single());
  },
  async getClientNote(note_id: string) {
    return await safeQueryTable('client_notes', q => q.select('*').eq('note_id', note_id).single());
  },
  async updateClientNote(note_id: string, updates) {
    return await safeQueryTable('client_notes', q => q.update(updates).eq('note_id', note_id));
  },
  async deleteClientNote(note_id: string) {
    return await safeQueryTable('client_notes', q => q.delete().eq('note_id', note_id));
  },

  async createFeedbackReviewer(data) {
    return await safeQueryTable('feedback_reviewers', q => q.insert(data).single());
  },
  async getFeedbackReviewer(reviewer_id: string, feedback_id: number) {
    return await safeQueryTable('feedback_reviewers', q => q.select('*').eq('reviewer_id', reviewer_id).eq('feedback_id', feedback_id).single());
  },
  async updateFeedbackReviewer(reviewer_id: string, feedback_id: number, updates) {
    return await safeQueryTable('feedback_reviewers', q => q.update(updates).eq('reviewer_id', reviewer_id).eq('feedback_id', feedback_id));
  },
  async deleteFeedbackReviewer(reviewer_id: string, feedback_id: number) {
    return await safeQueryTable('feedback_reviewers', q => q.delete().eq('reviewer_id', reviewer_id).eq('feedback_id', feedback_id));
  },

  async createClientLogin(data) {
    return await safeQueryTable('client_logins', q => q.insert(data).single());
  },
  async getClientLogin(user_id: string) {
    return await safeQueryTable('client_logins', q => q.select('*').eq('user_id', user_id).single());
  },
  async updateClientLogin(user_id: string, updates) {
    return await safeQueryTable('client_logins', q => q.update(updates).eq('user_id', user_id));
  },
  async deleteClientLogin(user_id: string) {
    return await safeQueryTable('client_logins', q => q.delete().eq('user_id', user_id));
  },

  async createClientAnalytics(data) {
    return await safeQueryTable('client_analytics', q => q.insert(data).single());
  },
  async getClientAnalytics(client_id: string) {
    return await safeQueryTable('client_analytics', q => q.select('*').eq('client_id', client_id));
  },
  async updateClientAnalytics(client_id: string, updates) {
    return await safeQueryTable('client_analytics', q => q.update(updates).eq('client_id', client_id));
  },
  async deleteClientAnalytics(client_id: string) {
    return await safeQueryTable('client_analytics', q => q.delete().eq('client_id', client_id));
  },

  async createClientTask(data) {
    return await safeQueryTable('client_tasks', q => q.insert(data).single());
  },
  async getClientTask(task_id: string) {
    return await safeQueryTable('client_tasks', q => q.select('*').eq('task_id', task_id).single());
  },
  async updateClientTask(task_id: string, updates) {
    return await safeQueryTable('client_tasks', q => q.update(updates).eq('task_id', task_id));
  },
  async deleteClientTask(task_id: string) {
    return await safeQueryTable('client_tasks', q => q.delete().eq('task_id', task_id));
  },

  async createClientSuggestion(data) {
    return await safeQueryTable('client_suggestions', q => q.insert(data).single());
  },
  async getClientSuggestion(user_id: string) {
    return await safeQueryTable('client_suggestions', q => q.select('*').eq('user_id', user_id));
  },
  async updateClientSuggestion(user_id: string, updates) {
    return await safeQueryTable('client_suggestions', q => q.update(updates).eq('user_id', user_id));
  },
  async deleteClientSuggestion(user_id: string) {
    return await safeQueryTable('client_suggestions', q => q.delete().eq('user_id', user_id));
  },

  async createClientAiSummary(data) {
    return await safeQueryTable('client_ai_summary', q => q.insert(data).single());
  },
  async getClientAiSummary(conversation_id: string) {
    return await safeQueryTable('client_ai_summary', q => q.select('*').eq('conversation_id', conversation_id).single());
  },
  async updateClientAiSummary(conversation_id: string, updates) {
    return await safeQueryTable('client_ai_summary', q => q.update(updates).eq('conversation_id', conversation_id));
  },
  async deleteClientAiSummary(conversation_id: string) {
    return await safeQueryTable('client_ai_summary', q => q.delete().eq('conversation_id', conversation_id));
  },

  // --- Next batch of ClientConnect CRUD ---
  async createArchivedProject(data) {
    return await safeQueryTable('archived_projects', q => q.insert(data).single());
  },
  async getArchivedProject(project_id: string, client_id: string) {
    return await safeQueryTable('archived_projects', q => q.select('*').eq('project_id', project_id).eq('client_id', client_id).single());
  },
  async updateArchivedProject(project_id: string, client_id: string, updates) {
    return await safeQueryTable('archived_projects', q => q.update(updates).eq('project_id', project_id).eq('client_id', client_id));
  },
  async deleteArchivedProject(project_id: string, client_id: string) {
    return await safeQueryTable('archived_projects', q => q.delete().eq('project_id', project_id).eq('client_id', client_id));
  },

  async createGdprLog(data) {
    return await safeQueryTable('gdpr_logs', q => q.insert(data).single());
  },
  async getGdprLog(user_id: string) {
    return await safeQueryTable('gdpr_logs', q => q.select('*').eq('user_id', user_id).single());
  },
  async updateGdprLog(user_id: string, updates) {
    return await safeQueryTable('gdpr_logs', q => q.update(updates).eq('user_id', user_id));
  },
  async deleteGdprLog(user_id: string) {
    return await safeQueryTable('gdpr_logs', q => q.delete().eq('user_id', user_id));
  },

  async createCommunicationSetting(data) {
    return await safeQueryTable('communication_settings', q => q.insert(data).single());
  },
  async getCommunicationSetting(client_id: string) {
    return await safeQueryTable('communication_settings', q => q.select('*').eq('client_id', client_id).single());
  },
  async updateCommunicationSetting(client_id: string, updates) {
    return await safeQueryTable('communication_settings', q => q.update(updates).eq('client_id', client_id));
  },
  async deleteCommunicationSetting(client_id: string) {
    return await safeQueryTable('communication_settings', q => q.delete().eq('client_id', client_id));
  },

  async createClientBudget(data) {
    return await safeQueryTable('client_budget', q => q.insert(data).single());
  },
  async getClientBudget(budget_id: string) {
    return await safeQueryTable('client_budget', q => q.select('*').eq('budget_id', budget_id).single());
  },
  async updateClientBudget(budget_id: string, updates) {
    return await safeQueryTable('client_budget', q => q.update(updates).eq('budget_id', budget_id));
  },
  async deleteClientBudget(budget_id: string) {
    return await safeQueryTable('client_budget', q => q.delete().eq('budget_id', budget_id));
  },

  async createDeliverableComment(data) {
    return await safeQueryTable('deliverable_comments', q => q.insert(data).single());
  },
  async getDeliverableComment(deliverable_id: string) {
    return await safeQueryTable('deliverable_comments', q => q.select('*').eq('deliverable_id', deliverable_id).single());
  },
  async updateDeliverableComment(deliverable_id: string, updates) {
    return await safeQueryTable('deliverable_comments', q => q.update(updates).eq('deliverable_id', deliverable_id));
  },
  async deleteDeliverableComment(deliverable_id: string) {
    return await safeQueryTable('deliverable_comments', q => q.delete().eq('deliverable_id', deliverable_id));
  },

  async createClientDeliverable(data) {
    return await safeQueryTable('client_deliverables', q => q.insert(data).single());
  },
  async getClientDeliverable(file_id: string) {
    return await safeQueryTable('client_deliverables', q => q.select('*').eq('file_id', file_id).single());
  },
  async updateClientDeliverable(file_id: string, updates) {
    return await safeQueryTable('client_deliverables', q => q.update(updates).eq('file_id', file_id));
  },
  async deleteClientDeliverable(file_id: string) {
    return await safeQueryTable('client_deliverables', q => q.delete().eq('file_id', file_id));
  },

  async createTranslationLog(data) {
    return await safeQueryTable('translation_logs', q => q.insert(data).single());
  },
  async getTranslationLog(message_id: string) {
    return await safeQueryTable('translation_logs', q => q.select('*').eq('message_id', message_id).single());
  },
  async updateTranslationLog(message_id: string, updates) {
    return await safeQueryTable('translation_logs', q => q.update(updates).eq('message_id', message_id));
  },
  async deleteTranslationLog(message_id: string) {
    return await safeQueryTable('translation_logs', q => q.delete().eq('message_id', message_id));
  },

  async createClientBilling(data) {
    return await safeQueryTable('client_billing', q => q.insert(data).single());
  },
  async getClientBilling(invoice_id: string) {
    return await safeQueryTable('client_billing', q => q.select('*').eq('invoice_id', invoice_id).single());
  },
  async updateClientBilling(invoice_id: string, updates) {
    return await safeQueryTable('client_billing', q => q.update(updates).eq('invoice_id', invoice_id));
  },
  async deleteClientBilling(invoice_id: string) {
    return await safeQueryTable('client_billing', q => q.delete().eq('invoice_id', invoice_id));
  },

  async createClientExport(data) {
    return await safeQueryTable('client_exports', q => q.insert(data).single());
  },
  async getClientExport(dashboard_id: string) {
    return await safeQueryTable('client_exports', q => q.select('*').eq('dashboard_id', dashboard_id).single());
  },
  async updateClientExport(dashboard_id: string, updates) {
    return await safeQueryTable('client_exports', q => q.update(updates).eq('dashboard_id', dashboard_id));
  },
  async deleteClientExport(dashboard_id: string) {
    return await safeQueryTable('client_exports', q => q.delete().eq('dashboard_id', dashboard_id));
  },

  async createClientReportDownload(data) {
    return await safeQueryTable('client_report_downloads', q => q.insert(data).single());
  },
  async getClientReportDownload(report_id: string, user_id: string) {
    return await safeQueryTable('client_report_downloads', q => q.select('*').eq('report_id', report_id).eq('user_id', user_id).single());
  },
  async updateClientReportDownload(report_id: string, user_id: string, updates) {
    return await safeQueryTable('client_report_downloads', q => q.update(updates).eq('report_id', report_id).eq('user_id', user_id));
  },
  async deleteClientReportDownload(report_id: string, user_id: string) {
    return await safeQueryTable('client_report_downloads', q => q.delete().eq('report_id', report_id).eq('user_id', user_id));
  },

  // --- Next batch of ClientConnect CRUD ---
  async createRoleVisibility(data) {
    return await safeQueryTable('role_visibility', q => q.insert(data).single());
  },
  async getRoleVisibility(role: string, feature: string) {
    return await safeQueryTable('role_visibility', q => q.select('*').eq('role', role).eq('feature', feature).single());
  },
  async updateRoleVisibility(role: string, feature: string, updates) {
    return await safeQueryTable('role_visibility', q => q.update(updates).eq('role', role).eq('feature', feature));
  },
  async deleteRoleVisibility(role: string, feature: string) {
    return await safeQueryTable('role_visibility', q => q.delete().eq('role', role).eq('feature', feature));
  },

  async createClientInvitation(data) {
    return await safeQueryTable('client_invitations', q => q.insert(data).single());
  },
  async getClientInvitation(invite_id: string) {
    return await safeQueryTable('client_invitations', q => q.select('*').eq('invite_id', invite_id).single());
  },
  async updateClientInvitation(invite_id: string, updates) {
    return await safeQueryTable('client_invitations', q => q.update(updates).eq('invite_id', invite_id));
  },
  async deleteClientInvitation(invite_id: string) {
    return await safeQueryTable('client_invitations', q => q.delete().eq('invite_id', invite_id));
  },

  async createClientActivityLog(data) {
    return await safeQueryTable('client_activity_logs', q => q.insert(data).single());
  },
  async getClientActivityLog(log_id: string) {
    return await safeQueryTable('client_activity_logs', q => q.select('*').eq('log_id', log_id).single());
  },
  async updateClientActivityLog(log_id: string, updates) {
    return await safeQueryTable('client_activity_logs', q => q.update(updates).eq('log_id', log_id));
  },
  async deleteClientActivityLog(log_id: string) {
    return await safeQueryTable('client_activity_logs', q => q.delete().eq('log_id', log_id));
  },

  async createClientReminder(data) {
    return await safeQueryTable('client_reminders', q => q.insert(data).single());
  },
  async getClientReminder(reminder_id: string) {
    return await safeQueryTable('client_reminders', q => q.select('*').eq('reminder_id', reminder_id).single());
  },
  async updateClientReminder(reminder_id: string, updates) {
    return await safeQueryTable('client_reminders', q => q.update(updates).eq('reminder_id', reminder_id));
  },
  async deleteClientReminder(reminder_id: string) {
    return await safeQueryTable('client_reminders', q => q.delete().eq('reminder_id', reminder_id));
  },

  async createClientNotification(data) {
    return await safeQueryTable('client_notifications', q => q.insert(data).single());
  },
  async getClientNotification(notification_id: string) {
    return await safeQueryTable('client_notifications', q => q.select('*').eq('notification_id', notification_id).single());
  },
  async updateClientNotification(notification_id: string, updates) {
    return await safeQueryTable('client_notifications', q => q.update(updates).eq('notification_id', notification_id));
  },
  async deleteClientNotification(notification_id: string) {
    return await safeQueryTable('client_notifications', q => q.delete().eq('notification_id', notification_id));
  },

  async createClientPreference(data) {
    return await safeQueryTable('client_preferences', q => q.insert(data).single());
  },
  async getClientPreference(client_id: string) {
    return await safeQueryTable('client_preferences', q => q.select('*').eq('client_id', client_id).single());
  },
  async updateClientPreference(client_id: string, updates) {
    return await safeQueryTable('client_preferences', q => q.update(updates).eq('client_id', client_id));
  },
  async deleteClientPreference(client_id: string) {
    return await safeQueryTable('client_preferences', q => q.delete().eq('client_id', client_id));
  },

  async createClientIntegration(data) {
    return await safeQueryTable('client_integrations', q => q.insert(data).single());
  },
  async getClientIntegration(integration_id: string) {
    return await safeQueryTable('client_integrations', q => q.select('*').eq('integration_id', integration_id).single());
  },
  async updateClientIntegration(integration_id: string, updates) {
    return await safeQueryTable('client_integrations', q => q.update(updates).eq('integration_id', integration_id));
  },
  async deleteClientIntegration(integration_id: string) {
    return await safeQueryTable('client_integrations', q => q.delete().eq('integration_id', integration_id));
  },

  async createClientAuditLog(data) {
    return await safeQueryTable('client_audit_logs', q => q.insert(data).single());
  },
  async getClientAuditLog(audit_id: string) {
    return await safeQueryTable('client_audit_logs', q => q.select('*').eq('audit_id', audit_id).single());
  },
  async updateClientAuditLog(audit_id: string, updates) {
    return await safeQueryTable('client_audit_logs', q => q.update(updates).eq('audit_id', audit_id));
  },
  async deleteClientAuditLog(audit_id: string) {
    return await safeQueryTable('client_audit_logs', q => q.delete().eq('audit_id', audit_id));
  },

  async createClientAccessLog(data) {
    return await safeQueryTable('client_access_logs', q => q.insert(data).single());
  },
  async getClientAccessLog(access_id: string) {
    return await safeQueryTable('client_access_logs', q => q.select('*').eq('access_id', access_id).single());
  },
  async updateClientAccessLog(access_id: string, updates) {
    return await safeQueryTable('client_access_logs', q => q.update(updates).eq('access_id', access_id));
  },
  async deleteClientAccessLog(access_id: string) {
    return await safeQueryTable('client_access_logs', q => q.delete().eq('access_id', access_id));
  },

  async createClientSetting(data) {
    return await safeQueryTable('client_settings', q => q.insert(data).single());
  },
  async getClientSetting(client_id: string) {
    return await safeQueryTable('client_settings', q => q.select('*').eq('client_id', client_id).single());
  },
  async updateClientSetting(client_id: string, updates) {
    return await safeQueryTable('client_settings', q => q.update(updates).eq('client_id', client_id));
  },
  async deleteClientSetting(client_id: string) {
    return await safeQueryTable('client_settings', q => q.delete().eq('client_id', client_id));
  },

  async createRiskOwner(data) {
    return await safeQueryTable('risk_owners', q => q.insert(data).single());
  },
  async getRiskOwner(risk_id: string, user_id: string) {
    return await safeQueryTable('risk_owners', q => q.select('*').eq('risk_id', risk_id).eq('user_id', user_id).single());
  },
  async updateRiskOwner(risk_id: string, user_id: string, updates) {
    return await safeQueryTable('risk_owners', q => q.update(updates).eq('risk_id', risk_id).eq('user_id', user_id));
  },
  async deleteRiskOwner(risk_id: string, user_id: string) {
    return await safeQueryTable('risk_owners', q => q.delete().eq('risk_id', risk_id).eq('user_id', user_id));
  },

  async createRiskImpact(data) {
    return await safeQueryTable('risk_impact', q => q.insert(data).single());
  },
  async getRiskImpactByRiskId(risk_id: string) {
    return await safeQueryTable('risk_impact', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskImpact(risk_id: string, updates) {
    return await safeQueryTable('risk_impact', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskImpact(risk_id: string) {
    return await safeQueryTable('risk_impact', q => q.delete().eq('risk_id', risk_id));
  },

  // --- Next batch of RiskRadar CRUD ---
  async createRiskMitigation(data) {
    return await safeQueryTable('risk_mitigation', q => q.insert(data).single());
  },
  async getRiskMitigation(risk_id: string) {
    return await safeQueryTable('risk_mitigation', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskMitigation(risk_id: string, updates) {
    return await safeQueryTable('risk_mitigation', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskMitigation(risk_id: string) {
    return await safeQueryTable('risk_mitigation', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskStatus(data) {
    return await safeQueryTable('risk_status', q => q.insert(data).single());
  },
  async getRiskStatus(risk_id: string) {
    return await safeQueryTable('risk_status', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskStatus(risk_id: string, updates) {
    return await safeQueryTable('risk_status', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskStatus(risk_id: string) {
    return await safeQueryTable('risk_status', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskScore(data) {
    return await safeQueryTable('risk_scores', q => q.insert(data).single());
  },
  async getRiskScore(risk_id: string) {
    return await safeQueryTable('risk_scores', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskScore(risk_id: string, updates) {
    return await safeQueryTable('risk_scores', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskScore(risk_id: string) {
    return await safeQueryTable('risk_scores', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskLog(data) {
    return await safeQueryTable('risk_logs', q => q.insert(data).single());
  },
  async getRiskLog(id: number) {
    return await safeQueryTable('risk_logs', q => q.select('*').eq('id', id).single());
  },
  async updateRiskLog(id: number, updates) {
    return await safeQueryTable('risk_logs', q => q.update(updates).eq('id', id));
  },
  async deleteRiskLog(id: number) {
    return await safeQueryTable('risk_logs', q => q.delete().eq('id', id));
  },

  async createRiskDeadline(data) {
    return await safeQueryTable('risk_deadlines', q => q.insert(data).single());
  },
  async getRiskDeadline(risk_id: string) {
    return await safeQueryTable('risk_deadlines', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskDeadline(risk_id: string, updates) {
    return await safeQueryTable('risk_deadlines', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskDeadline(risk_id: string) {
    return await safeQueryTable('risk_deadlines', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskReport(data) {
    return await safeQueryTable('risk_reports', q => q.insert(data).single());
  },
  async getRiskReport(report_id: string) {
    return await safeQueryTable('risk_reports', q => q.select('*').eq('report_id', report_id).single());
  },
  async updateRiskReport(report_id: string, updates) {
    return await safeQueryTable('risk_reports', q => q.update(updates).eq('report_id', report_id));
  },
  async deleteRiskReport(report_id: string) {
    return await safeQueryTable('risk_reports', q => q.delete().eq('report_id', report_id));
  },

  async createRiskTag(data) {
    return await safeQueryTable('risk_tags', q => q.insert(data).single());
  },
  async getRiskTag(risk_id: string, tag: string) {
    return await safeQueryTable('risk_tags', q => q.select('*').eq('risk_id', risk_id).eq('tag', tag).single());
  },
  async updateRiskTag(risk_id: string, tag: string, updates) {
    return await safeQueryTable('risk_tags', q => q.update(updates).eq('risk_id', risk_id).eq('tag', tag));
  },
  async deleteRiskTag(risk_id: string, tag: string) {
    return await safeQueryTable('risk_tags', q => q.delete().eq('risk_id', risk_id).eq('tag', tag));
  },

  async createInsightRisk(data) {
    return await safeQueryTable('insight_risks', q => q.insert(data).single());
  },
  async getInsightRisk(risk_id: string, metric: string) {
    return await safeQueryTable('insight_risks', q => q.select('*').eq('risk_id', risk_id).eq('metric', metric).single());
  },
  async updateInsightRisk(risk_id: string, metric: string, updates) {
    return await safeQueryTable('insight_risks', q => q.update(updates).eq('risk_id', risk_id).eq('metric', metric));
  },
  async deleteInsightRisk(risk_id: string, metric: string) {
    return await safeQueryTable('insight_risks', q => q.delete().eq('risk_id', risk_id).eq('metric', metric));
  },

  async createPlanRisk(data) {
    return await safeQueryTable('plan_risks', q => q.insert(data).single());
  },
  async getPlanRisk(plan_id: string, risk_id: string) {
    return await safeQueryTable('plan_risks', q => q.select('*').eq('plan_id', plan_id).eq('risk_id', risk_id).single());
  },
  async updatePlanRisk(plan_id: string, risk_id: string, updates) {
    return await safeQueryTable('plan_risks', q => q.update(updates).eq('plan_id', plan_id).eq('risk_id', risk_id));
  },
  async deletePlanRisk(plan_id: string, risk_id: string) {
    return await safeQueryTable('plan_risks', q => q.delete().eq('plan_id', plan_id).eq('risk_id', risk_id));
  },

  async createRiskTask(data) {
    return await safeQueryTable('risk_tasks', q => q.insert(data).single());
  },
  async getRiskTask(task_id: string, risk_id: string) {
    return await safeQueryTable('risk_tasks', q => q.select('*').eq('task_id', task_id).eq('risk_id', risk_id).single());
  },
  async updateRiskTask(task_id: string, risk_id: string, updates) {
    return await safeQueryTable('risk_tasks', q => q.update(updates).eq('task_id', task_id).eq('risk_id', risk_id));
  },
  async deleteRiskTask(task_id: string, risk_id: string) {
    return await safeQueryTable('risk_tasks', q => q.delete().eq('task_id', task_id).eq('risk_id', risk_id));
  },

  // --- Next batch of RiskRadar CRUD ---
  async createRiskHeatmap(data) {
    return await safeQueryTable('risk_heatmap', q => q.insert(data).single());
  },
  async getRiskHeatmap(project_id: string) {
    return await safeQueryTable('risk_heatmap', q => q.select('*').eq('project_id', project_id).single());
  },
  async updateRiskHeatmap(project_id: string, updates) {
    return await safeQueryTable('risk_heatmap', q => q.update(updates).eq('project_id', project_id));
  },
  async deleteRiskHeatmap(project_id: string) {
    return await safeQueryTable('risk_heatmap', q => q.delete().eq('project_id', project_id));
  },

  async createRiskAlert(data) {
    return await safeQueryTable('risk_alerts', q => q.insert(data).single());
  },
  async getRiskAlert(risk_id: string, alert_type: string) {
    return await safeQueryTable('risk_alerts', q => q.select('*').eq('risk_id', risk_id).eq('alert_type', alert_type).single());
  },
  async updateRiskAlert(risk_id: string, alert_type: string, updates) {
    return await safeQueryTable('risk_alerts', q => q.update(updates).eq('risk_id', risk_id).eq('alert_type', alert_type));
  },
  async deleteRiskAlert(risk_id: string, alert_type: string) {
    return await safeQueryTable('risk_alerts', q => q.delete().eq('risk_id', risk_id).eq('alert_type', alert_type));
  },

  async createRiskHistory(data) {
    return await safeQueryTable('risk_history', q => q.insert(data).single());
  },
  async getRiskHistory(risk_id: string) {
    return await safeQueryTable('risk_history', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskHistory(risk_id: string, updates) {
    return await safeQueryTable('risk_history', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskHistory(risk_id: string) {
    return await safeQueryTable('risk_history', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskTemplate(data) {
    return await safeQueryTable('risk_templates', q => q.insert(data).single());
  },
  async getRiskTemplate(template_id: string) {
    return await safeQueryTable('risk_templates', q => q.select('*').eq('template_id', template_id).single());
  },
  async updateRiskTemplate(template_id: string, updates) {
    return await safeQueryTable('risk_templates', q => q.update(updates).eq('template_id', template_id));
  },
  async deleteRiskTemplate(template_id: string) {
    return await safeQueryTable('risk_templates', q => q.delete().eq('template_id', template_id));
  },

  async createAiRisk(data) {
    return await safeQueryTable('ai_risks', q => q.insert(data).single());
  },
  async getAiRisk(project_id: string) {
    return await safeQueryTable('ai_risks', q => q.select('*').eq('project_id', project_id).single());
  },
  async updateAiRisk(project_id: string, updates) {
    return await safeQueryTable('ai_risks', q => q.update(updates).eq('project_id', project_id));
  },
  async deleteAiRisk(project_id: string) {
    return await safeQueryTable('ai_risks', q => q.delete().eq('project_id', project_id));
  },

  async createRiskPhase(data) {
    return await safeQueryTable('risk_phase', q => q.insert(data).single());
  },
  async getRiskPhase(phase_id: string) {
    return await safeQueryTable('risk_phase', q => q.select('*').eq('phase_id', phase_id).single());
  },
  async updateRiskPhase(phase_id: string, updates) {
    return await safeQueryTable('risk_phase', q => q.update(updates).eq('phase_id', phase_id));
  },
  async deleteRiskPhase(phase_id: string) {
    return await safeQueryTable('risk_phase', q => q.delete().eq('phase_id', phase_id));
  },

  async createRiskDocument(data) {
    return await safeQueryTable('risk_documents', q => q.insert(data).single());
  },
  async getRiskDocument(file_id: string, risk_id: string) {
    return await safeQueryTable('risk_documents', q => q.select('*').eq('file_id', file_id).eq('risk_id', risk_id).single());
  },
  async updateRiskDocument(file_id: string, risk_id: string, updates) {
    return await safeQueryTable('risk_documents', q => q.update(updates).eq('file_id', file_id).eq('risk_id', risk_id));
  },
  async deleteRiskDocument(file_id: string, risk_id: string) {
    return await safeQueryTable('risk_documents', q => q.delete().eq('file_id', file_id).eq('risk_id', risk_id));
  },

  async createRiskEscalation(data) {
    return await safeQueryTable('risk_escalation', q => q.insert(data).single());
  },
  async getRiskEscalation(risk_id: string) {
    return await safeQueryTable('risk_escalation', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateRiskEscalation(risk_id: string, updates) {
    return await safeQueryTable('risk_escalation', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteRiskEscalation(risk_id: string) {
    return await safeQueryTable('risk_escalation', q => q.delete().eq('risk_id', risk_id));
  },

  async createAutoResolved(data) {
    return await safeQueryTable('auto_resolved', q => q.insert(data).single());
  },
  async getAutoResolved(risk_id: string) {
    return await safeQueryTable('auto_resolved', q => q.select('*').eq('risk_id', risk_id).single());
  },
  async updateAutoResolved(risk_id: string, updates) {
    return await safeQueryTable('auto_resolved', q => q.update(updates).eq('risk_id', risk_id));
  },
  async deleteAutoResolved(risk_id: string) {
    return await safeQueryTable('auto_resolved', q => q.delete().eq('risk_id', risk_id));
  },

  async createRiskComment(data) {
    return await safeQueryTable('risk_comments', q => q.insert(data).single());
  },
  async getRiskComment(id: number) {
    return await safeQueryTable('risk_comments', q => q.select('*').eq('id', id).single());
  },
  async updateRiskComment(id: number, updates) {
    return await safeQueryTable('risk_comments', q => q.update(updates).eq('id', id));
  },
  async deleteRiskComment(id: number) {
    return await safeQueryTable('risk_comments', q => q.delete().eq('id', id));
  },

  async createRiskWatchlist(data) {
    return await safeQueryTable('risk_watchlist', q => q.insert(data).single());
  },
  async getRiskWatchlist(user_id: string, risk_id: string) {
    return await safeQueryTable('risk_watchlist', q => q.select('*').eq('user_id', user_id).eq('risk_id', risk_id).single());
  },
  async updateRiskWatchlist(user_id: string, risk_id: string, updates) {
    return await safeQueryTable('risk_watchlist', q => q.update(updates).eq('user_id', user_id).eq('risk_id', risk_id));
  },
  async deleteRiskWatchlist(user_id: string, risk_id: string) {
    return await safeQueryTable('risk_watchlist', q => q.delete().eq('user_id', user_id).eq('risk_id', risk_id));
  },

  async createMitigationOwner(data) {
    return await safeQueryTable('mitigation_owners', q => q.insert(data).single());
  },
  async getMitigationOwner(mitigation_id: string, owner_id: string) {
    return await safeQueryTable('mitigation_owners', q => q.select('*').eq('mitigation_id', mitigation_id).eq('owner_id', owner_id).single());
  },
  async updateMitigationOwner(mitigation_id: string, owner_id: string, updates) {
    return await safeQueryTable('mitigation_owners', q => q.update(updates).eq('mitigation_id', mitigation_id).eq('owner_id', owner_id));
  },
  async deleteMitigationOwner(mitigation_id: string, owner_id: string) {
    return await safeQueryTable('mitigation_owners', q => q.delete().eq('mitigation_id', mitigation_id).eq('owner_id', owner_id));
  },

  // --- ResourceHub Allocations CRUD ---
  async getAllocations(resourceId?: string, projectId?: string) {
    return await safeQueryTable('allocations', (query) => {
      let q = query.select('*');
      if (resourceId) q = q.eq('resource_id', resourceId);
      if (projectId) q = q.eq('project_id', projectId);
      return q.order('from_date', { ascending: false });
    });
  },
  async addAllocation(allocation) {
    return await safeQueryTable('allocations', (query) => query.insert(allocation).single());
  },
  async updateAllocation(id: string, updates) {
    return await safeQueryTable('allocations', (query) => query.update(updates).eq('id', id));
  },
  async deleteAllocation(id: string) {
    return await safeQueryTable('allocations', (query) => query.delete().eq('id', id));
  },

  // --- ResourceHub Unavailability CRUD ---
  async getUnavailability(resourceId?: string) {
    return await safeQueryTable('unavailability', (query) => {
      let q = query.select('*');
      if (resourceId) q = q.eq('resource_id', resourceId);
      return q.order('from_date', { ascending: false });
    });
  },
  async addUnavailability(unavailability) {
    return await safeQueryTable('unavailability', (query) => query.insert(unavailability).single());
  },
  async updateUnavailability(id: string, updates) {
    return await safeQueryTable('unavailability', (query) => query.update(updates).eq('id', id));
  },
  async deleteUnavailability(id: string) {
    return await safeQueryTable('unavailability', (query) => query.delete().eq('id', id));
  },

  // --- ResourceHub Skills CRUD ---
  async deleteSkillsByResourceId(userId: string) {
    return await safeQueryTable('user_skills', (q) => q.delete().eq('user_id', userId));
  },

  // --- ResourceHub Utilization History CRUD ---
  async getUtilizationHistory(resourceId?: string) {
    return await safeQueryTable('utilization_history', (query) => {
      let q = query.select('*');
      if (resourceId) q = q.eq('resource_id', resourceId);
      return q.order('date', { ascending: false });
    });
  },
  async addUtilizationHistory(utilization) {
    return await safeQueryTable('utilization_history', (query) => query.insert(utilization).single());
  },
  async updateUtilizationHistory(id: string, updates) {
    return await safeQueryTable('utilization_history', (query) => query.update(updates).eq('id', id));
  },
  async deleteUtilizationHistory(id: string) {
    return await safeQueryTable('utilization_history', (query) => query.delete().eq('id', id));
  },

  /**
   * Get all tasks for an array of project IDs.
   * @param projectIds Array of project IDs
   * @returns Array of Task objects matching the project IDs
   */
  /**
   * Get all projects for a given client ID.
   * @param clientId The client ID to filter projects by
   * @returns Array of Project objects matching the client ID
   */
  async getProjectsByClient(clientId: string) {
    if (!clientId) return { data: [], error: 'Missing clientId' };
    return await safeQueryTable('projects', (query) =>
      query.select('*').eq('client_id', clientId)
    );
  },

  async getTasksByProjectIds(projectIds: string[]) {
    if (!projectIds || projectIds.length === 0) return [];
    return await safeQueryTable('tasks', (query) =>
      query.select('*').in('project', projectIds)
    );
  },

  /**
   * Insert a new automation event into the automation_events table.
   * @param event The automation event object
   * @returns The inserted event row
   */
  async createAutomationEvent(event: {
    event_type: string;
    source_module: string;
    source_id: string;
    payload: any;
    status: string;
    triggered_at: Date;
  }) {
    return await safeQueryTable('automation_events', (query) =>
      query.insert({
        event_type: event.event_type,
        source_module: event.source_module,
        source_id: event.source_id,
        payload: event.payload,
        status: event.status,
        triggered_at: event.triggered_at,
      }).single()
    );
  }
};

export default dbService;