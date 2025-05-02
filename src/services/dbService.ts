import { supabase } from '@/integrations/supabase/client';

// Define interfaces for database types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  description: string;
  project?: string;
  project_id?: string;
  task_id?: string;
  time_spent: number;
  date: string;
  billable?: boolean;
  notes?: string;
  tags?: string[];
  created_at?: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  notes?: string;
  created_at?: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  created_at?: string;
}

export interface UserSettings {
  user_id: string;
  theme?: string;
  default_view?: 'board' | 'list';
  show_completed?: boolean;
  auto_archive?: boolean;
  default_priority?: 'low' | 'medium' | 'high';
  default_project?: string;
  reminder_time?: string;
  notification_settings?: object;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Define the dbService object with methods for database operations
export const dbService = {
  // User Profile operations
  getUserProfile: async (userId: string) => {
    return supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    return supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);
  },

  // Time Entry operations
  getTimeEntries: async (userId: string) => {
    return supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
  },

  createTimeEntry: async (timeEntry: Partial<TimeEntry>) => {
    return supabase
      .from('time_entries')
      .insert([timeEntry]);
  },

  updateTimeEntry: async (entryId: string, userId: string, updates: Partial<TimeEntry>) => {
    return supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', userId);
  },

  deleteTimeEntry: async (entryId: string, userId: string) => {
    return supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);
  },

  // User Settings operations
  getUserSettings: async (userId: string) => {
    return supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  createUserSettings: async (userId: string, settings: Partial<UserSettings>) => {
    return supabase
      .from('user_settings')
      .insert([{ user_id: userId, ...settings }]);
  },

  updateUserSettings: async (userId: string, updates: Partial<UserSettings>) => {
    return supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId);
  },

  // Project operations
  getProjects: async (userId: string) => {
    return supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  // Tasks operations
  getTasks: async (userId: string, filters = {}) => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (filters.project) {
      query = query.eq('project_id', filters.project);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Dashboard operations
  getDashboardStats: async (userId: string) => {
    // This is a placeholder for a more complex dashboard query
    // In a real application, this might involve multiple queries or a stored procedure
    return {
      data: {
        totalTasks: 0,
        completedTasks: 0,
        timeTracked: 0,
        recentProjects: []
      },
      error: null
    };
  },
  
  // Files operations
  getFiles: async (userId: string) => {
    return supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
  },

  // Timesheet operations
  getTimesheets: async (userId: string) => {
    return supabase
      .from('timesheets')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
  },

  createTimesheet: async (timesheet: Partial<Timesheet>) => {
    return supabase
      .from('timesheets')
      .insert([timesheet])
      .select();
  },

  updateTimesheet: async (timesheetId: string, userId: string, updates: Partial<Timesheet>) => {
    return supabase
      .from('timesheets')
      .update(updates)
      .eq('id', timesheetId)
      .eq('user_id', userId);
  },

  deleteTimesheet: async (timesheetId: string, userId: string) => {
    return supabase
      .from('timesheets')
      .delete()
      .eq('id', timesheetId)
      .eq('user_id', userId);
  },

  // Work Session operations
  getWorkSessions: async (userId: string, options = { active_only: false }) => {
    let query = supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId);
    
    if (options.active_only) {
      query = query.is('end_time', null);
    }
    
    return query.order('start_time', { ascending: false });
  },

  startWorkSession: async (session: Partial<WorkSession>) => {
    return supabase
      .from('work_sessions')
      .insert([session])
      .select();
  },

  endWorkSession: async (sessionId: string, userId: string, endTime: string, duration: number) => {
    return supabase
      .from('work_sessions')
      .update({ end_time: endTime, duration })
      .eq('id', sessionId)
      .eq('user_id', userId);
  },

  // Time Entry to Timesheet operations
  addTimeEntriesToTimesheet: async (timesheetId: string, entryIds: string[]) => {
    const updates = entryIds.map(entryId => ({
      timesheet_id: timesheetId,
      time_entry_id: entryId
    }));
    
    return supabase
      .from('timesheet_entries')
      .insert(updates);
  }
};
