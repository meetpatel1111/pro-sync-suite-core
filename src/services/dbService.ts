import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkTableExists, safeQueryTable } from '@/utils/db-helpers';
import { User } from '@supabase/supabase-js';

// Service to handle database checking and creation
export const dbService = {
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

  // Check and create user_profiles table if not exists
  async checkUserProfileTable() {
    const exists = await this.tableExists('user_profiles');
    if (!exists) {
      console.log('Creating user_profiles table...');
      const { error } = await supabase.rpc('create_user_profiles_table');
      if (error) {
        console.error('Error creating user_profiles table:', error);
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
    return await safeQueryTable('user_profiles', (query) => 
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
    return await safeQueryTable('user_profiles', (query) => 
      query
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    );
  },

  // Get user settings
  async getUserSettings(userId: string) {
    return await safeQueryTable('user_settings', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .single()
    );
  },

  // Update user settings
  async updateUserSettings(userId: string, updates: Record<string, any>) {
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
  async createClient(clientData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    user_id: string;
  }) {
    return await safeQueryTable('clients', (query) => 
      query.insert(clientData)
    );
  },
  
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
        .single()
    );
    
    if (data && data.id) {
      // Update existing record
      return await safeQueryTable('productivity_metrics', (query) => 
        query
          .update(metrics)
          .eq('id', data.id)
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
  }
};
