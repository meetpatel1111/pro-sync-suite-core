import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  job_title?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  theme?: string;
  language?: string;
  timezone?: string;
  notifications_enabled?: boolean;
  email_notifications?: Record<string, boolean>;
  app_notifications?: Record<string, boolean>;
  default_dashboard?: string;
  [key: string]: any;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: string;
  project?: string;
  user_id: string;
}

export interface Project {
  id?: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
}

export interface TimeEntry {
  id?: string;
  description: string;
  project: string;
  project_id?: string;
  task_id?: string;
  time_spent: number;
  date?: string;
  user_id: string;
  billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
  notes?: string;
}

export interface Client {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  user_id: string;
}

export interface ClientNote {
  id?: string;
  client_id: string;
  content: string;
  user_id: string;
}

export interface NotificationType {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_to?: string;
  related_id?: string;
  read?: boolean;
}

export const dbService = {
  // User profiles
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return { data: null, error };
    }
  },

  // User settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return null;
    }
  },

  async createUserSettings(userId: string, settings: Partial<UserSettings>): Promise<{ data: UserSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          ...settings
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createUserSettings:', error);
      return { data: null, error };
    }
  },

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<{ data: UserSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return { data: null, error };
    }
  },

  // Tasks
  async getTasks(userId: string): Promise<{ data: Task[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getTasks:', error);
      return { data: null, error };
    }
  },

  async getTask(taskId: string): Promise<{ data: Task | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in getTask:', error);
      return { data: null, error };
    }
  },

  async createTask(task: Task): Promise<{ data: Task | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createTask:', error);
      return { data: null, error };
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ data: Task | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateTask:', error);
      return { data: null, error };
    }
  },

  async deleteTask(taskId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      return { error };
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return { error };
    }
  },

  // Projects
  async getProjects(userId: string): Promise<{ data: Project[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getProjects:', error);
      return { data: null, error };
    }
  },

  async getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in getProject:', error);
      return { data: null, error };
    }
  },

  async createProject(project: Project): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createProject:', error);
      return { data: null, error };
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateProject:', error);
      return { data: null, error };
    }
  },

  async deleteProject(projectId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      return { error };
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return { error };
    }
  },

  // Time entries
  async getTimeEntries(userId: string): Promise<{ data: TimeEntry[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getTimeEntries:', error);
      return { data: null, error };
    }
  },

  async createTimeEntry(entry: TimeEntry): Promise<{ data: TimeEntry | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entry])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createTimeEntry:', error);
      return { data: null, error };
    }
  },

  async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<{ data: TimeEntry | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateTimeEntry:', error);
      return { data: null, error };
    }
  },

  async deleteTimeEntry(entryId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      return { error };
    } catch (error) {
      console.error('Error in deleteTimeEntry:', error);
      return { error };
    }
  },

  // Clients
  async getClients(userId: string): Promise<{ data: Client[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getClients:', error);
      return { data: null, error };
    }
  },

  async createClient(client: Client): Promise<{ data: Client | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createClient:', error);
      return { data: null, error };
    }
  },

  // Notifications
  async getNotifications(userId: string): Promise<{ data: NotificationType[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return { data: null, error };
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return { error };
    }
  },

  async deleteNotification(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return { error };
    }
  },

  // Helper function to ensure user exists in app_users
  async upsertAppUser(user: User): Promise<{ data: any; error: any } | null> {
    if (!user || !user.id) {
      console.error('Invalid user provided to upsertAppUser');
      return null;
    }

    try {
      // First check if the user already exists in user_profiles
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        // User already exists, no need to create
        return { data: existingUser, error: null };
      }

      // Create user profile if it doesn't exist
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in upsertAppUser:', error);
      return { data: null, error };
    }
  },

  // Add updateNotification function
  updateNotification: async (id: string, updates: Partial<{ read: boolean }>) => {
    try {
      return await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      console.error('Error updating notification:', error);
      return { error };
    }
  },

  // Get AI Risk data (placeholder for future integration)
  async getAiRisk(projectId: string): Promise<any> {
    // This is just a placeholder for future real implementation
    return {
      id: 'risk-1',
      name: 'Schedule Delay Risk',
      description: 'The project may face timeline challenges due to resource constraints.',
      category: 'Schedule',
      probability: 3,  // 1-5 scale
      impact: 4,       // 1-5 scale
      owner: {
        name: 'Taylor Lee',
        avatar: '',
        initials: 'TL'
      },
      status: 'Open',
      lastReview: new Date().toISOString(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  },

  // Fix the exported function here
  async getDashboardStats(userId: string): Promise<any> {
    try {
      // Get completed tasks count
      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed');
      
      if (tasksError) {
        console.error('Error fetching completed tasks:', tasksError);
      }
      
      // Get time entries to calculate hours tracked
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('time_spent')
        .eq('user_id', userId);
      
      if (timeError) {
        console.error('Error fetching time entries:', timeError);
      }
      
      // Get open issues (tasks with status not completed)
      const { data: openIssues, error: issuesError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .neq('status', 'completed');
      
      if (issuesError) {
        console.error('Error fetching open issues:', issuesError);
      }
      
      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId);
      
      if (teamError) {
        console.error('Error fetching team members:', teamError);
      }
      
      // Calculate hours from minutes
      const totalMinutes = timeEntries?.reduce((sum, entry) => sum + (entry.time_spent || 0), 0) || 0;
      const hoursTracked = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal place
      
      return {
        completedTasks: completedTasks?.length || 0,
        hoursTracked: hoursTracked,
        openIssues: openIssues?.length || 0,
        teamMembers: teamMembers?.length || 0
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        completedTasks: 0,
        hoursTracked: 0,
        openIssues: 0,
        teamMembers: 0
      };
    }
  }
};

// Export getDashboardStats directly so it can be imported individually
export const { getDashboardStats } = dbService;
