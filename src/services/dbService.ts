
import { supabase } from '@/integrations/supabase/client';

// Export all functions wrapped in a dbService object
export const dbService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  async updateUserSettings(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  async getTasks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async getProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  async createNotification(notification: any) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markNotificationRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async updateNotification(notificationId: string, userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  async markAllNotificationsRead(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async deleteNotification(notificationId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async saveFile(fileData: any) {
    try {
      const { data, error } = await supabase
        .from('files')
        .insert(fileData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  async getFiles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  async createTaskComment(comment: any) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert(comment)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating task comment:', error);
      throw error;
    }
  },

  async getTaskComments(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error fetching task comments:', error);
      throw error;
    }
  },

  async getDashboardStats(userId: string) {
    try {
      // Get tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      if (tasksError) throw tasksError;
      
      // Get projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
      
      if (projectsError) throw projectsError;
      
      // Get recent activity
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      // Calculate statistics
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const pendingTasks = tasks?.filter(t => t.status !== 'completed').length || 0;
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      
      // Format data for DashboardStats component
      const statsFormatted = {
        completedTasks: completedTasks,
        hoursTracked: 0, // You may want to calculate this from time entries
        openIssues: pendingTasks,
        teamMembers: 5, // Default value, replace with actual team members count
      };
      
      return { 
        data: statsFormatted,
        fullData: {
          taskStats: {
            total: tasks?.length || 0,
            completed: completedTasks,
            pending: pendingTasks,
            completionRate: tasks?.length ? (completedTasks / tasks.length) * 100 : 0
          },
          projectStats: {
            total: projects?.length || 0,
            active: activeProjects,
            completed: completedProjects
          },
          recentActivity: notifications || []
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { error };
    }
  },

  async getTimeEntries(userId: string, filters?: {
    project_id?: string,
    start_date?: string,
    end_date?: string
  }) {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId);
      
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      
      if (filters?.start_date) {
        query = query.gte('date', filters.start_date);
      }
      
      if (filters?.end_date) {
        query = query.lte('date', filters.end_date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return { error };
    }
  },

  async createTimeEntry(userId: string, timeEntry: any) {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          ...timeEntry,
          user_id: userId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating time entry:', error);
      return { error };
    }
  },

  async upsertAppUser(user: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: user.full_name || user.email,
          avatar_url: user.avatar_url,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  },

  async createUserSettings(userId: string, settings: any) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...settings
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating user settings:', error);
      return { error };
    }
  },

  async hashPassword(password: string) {
    // In a real app, this would use a secure password hashing function
    // For demo purposes, we'll just do a simple hash - NEVER use this in production!
    return btoa(`${password}_hashed`);
  }
};

// Also export individual functions for backwards compatibility
export async function getUserProfile(userId: string) {
  return dbService.getUserProfile(userId);
}

export async function updateUserProfile(userId: string, updates: any) {
  return dbService.updateUserProfile(userId, updates);
}

export async function getUserSettings(userId: string) {
  return dbService.getUserSettings(userId);
}

export async function updateUserSettings(userId: string, updates: any) {
  return dbService.updateUserSettings(userId, updates);
}

export async function getTasks(userId: string) {
  return dbService.getTasks(userId);
}

export async function getProjects(userId: string) {
  return dbService.getProjects(userId);
}

export async function createNotification(notification: any) {
  return dbService.createNotification(notification);
}

export async function getNotifications(userId: string) {
  return dbService.getNotifications(userId);
}

export async function markNotificationRead(notificationId: string) {
  return dbService.markNotificationRead(notificationId);
}

export async function markAllNotificationsRead(userId: string) {
  return dbService.markAllNotificationsRead(userId);
}

export async function deleteNotification(notificationId: string) {
  return dbService.deleteNotification(notificationId, notificationId);
}

export async function saveFile(fileData: any) {
  return dbService.saveFile(fileData);
}

export async function getFiles(userId: string) {
  return dbService.getFiles(userId);
}

export async function getDashboardStats(userId: string) {
  return dbService.getDashboardStats(userId);
}

export async function getTimeEntries(userId: string, filters?: {
  project_id?: string,
  start_date?: string,
  end_date?: string
}) {
  return dbService.getTimeEntries(userId, filters);
}

export async function upsertAppUser(user: any) {
  return dbService.upsertAppUser(user);
}

export default dbService;
