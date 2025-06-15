import { supabase } from '@/integrations/supabase/client';

export const dbService = {
  // Dashboard operations
  async getDashboards(userId: string) {
    return await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async createDashboard(dashboard: any) {
    return await supabase
      .from('dashboards')
      .insert([dashboard])
      .select();
  },

  async updateDashboard(id: string, updates: any) {
    return await supabase
      .from('dashboards')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteDashboard(id: string) {
    return await supabase
      .from('dashboards')
      .delete()
      .eq('id', id);
  },

  // Widget operations
  async getWidgets(dashboardId: string) {
    return await supabase
      .from('widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: true });
  },

  async createWidget(widget: any) {
    return await supabase
      .from('widgets')
      .insert([widget])
      .select();
  },

  async updateWidget(id: string, updates: any) {
    return await supabase
      .from('widgets')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteWidget(id: string) {
    return await supabase
      .from('widgets')
      .delete()
      .eq('id', id);
  },

  // Project operations
  async getProjects(userId: string) {
    return await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getProjectsWithMembers(userId: string) {
    return await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(role)
      `)
      .eq('project_members.user_id', userId)
      .order('created_at', { ascending: false });
  },

  async createProject(project: any) {
    return await supabase
      .from('projects')
      .insert([project])
      .select();
  },

  async updateProject(id: string, updates: any) {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteProject(id: string) {
    return await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  },

  // Project member operations
  async getProjectMembers(projectId: string) {
    return await supabase
      .from('project_members')
      .select(`
        *,
        users!inner(full_name)
      `)
      .eq('project_id', projectId);
  },

  async addProjectMember(projectId: string, userId: string, role: string) {
    return await supabase
      .from('project_members')
      .insert([{ project_id: projectId, user_id: userId, role }])
      .select();
  },

  async updateProjectMember(projectId: string, userId: string, role: string) {
    return await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select();
  },

  async removeProjectMember(projectId: string, userId: string) {
    return await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
  },

  // Project view operations
  async getUserProjectView(projectId: string, userId: string) {
    return await supabase
      .from('project_views')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId);
  },

  async updateUserProjectView(projectId: string, userId: string, viewData: any) {
    return await supabase
      .from('project_views')
      .upsert([{ 
        project_id: projectId, 
        user_id: userId, 
        ...viewData,
        updated_at: new Date().toISOString()
      }])
      .select();
  },

  // Task operations
  async getTasks(userId: string, filters: any = {}) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.project) {
      query = query.eq('project', filters.project);
    }

    return await query.order('created_at', { ascending: false });
  },

  async getProjectTasks(projectId: string, filters: any = {}) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.assignee) {
      query = query.contains('assigned_to', [filters.assignee]);
    }

    return await query.order('created_at', { ascending: false });
  },

  async createTask(task: any) {
    return await supabase
      .from('tasks')
      .insert([task])
      .select();
  },

  async updateTask(id: string, updates: any) {
    return await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteTask(id: string) {
    return await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
  },

  // Task dependency operations
  async getTaskDependencies(taskId: string) {
    return await supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId);
  },

  async createTaskDependency(dependency: any) {
    return await supabase
      .from('task_dependencies')
      .insert([dependency])
      .select();
  },

  async deleteTaskDependency(id: string) {
    return await supabase
      .from('task_dependencies')
      .delete()
      .eq('id', id);
  },

  // Time entry operations
  async getTimeEntries(userId: string, filters: any = {}) {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    return await query.order('date', { ascending: false });
  },

  async createTimeEntry(entry: any) {
    return await supabase
      .from('time_entries')
      .insert([entry])
      .select();
  },

  async updateTimeEntry(id: string, updates: any) {
    return await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteTimeEntry(id: string) {
    return await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);
  },

  // Notification operations
  async getNotifications(userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async updateNotification(id: string, userId: string, updates: any) {
    return await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
  },

  async deleteNotification(id: string, userId: string) {
    return await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
  },

  // File operations
  async getFiles(userId: string, filters: any = {}) {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);

    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id);
    }
    if (filters.file_type) {
      query = query.eq('file_type', filters.file_type);
    }

    return await query.order('created_at', { ascending: false });
  },

  async createFile(file: any) {
    return await supabase
      .from('files')
      .insert([file])
      .select();
  },

  async updateFile(id: string, updates: any) {
    return await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select();
  },

  async deleteFile(id: string) {
    return await supabase
      .from('files')
      .delete()
      .eq('id', id);
  },
};
