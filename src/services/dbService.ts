import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/utils/dbtypes';
import { PostgrestError } from '@supabase/supabase-js';

export const dbService = {
  // User Profile Functions
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
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
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // User Settings Functions
  getUserSettings: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  createUserSettings: async (userId: string, settings: any) => {
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
      return { data: null, error: error as PostgrestError };
    }
  },
  
  updateUserSettings: async (userId: string, updates: any) => {
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
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Project Functions
  getProjects: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  createProject: async (userId: string, project: any) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: userId
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Task Functions
  getTasks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Time Entry Functions
  createTimeEntry: async (userId: string, timeEntry: any) => {
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
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Client Functions
  getClients: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  createClient: async (client: any) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating client:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  updateClient: async (clientId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating client:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  deleteClient: async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Client Note Functions
  getClientNotesByClientId: async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching client notes:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  createClientNote: async (note: any) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .insert(note)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating client note:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  deleteClientNote: async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting client note:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Notification Functions
  getNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  updateNotification: async (notificationId: string, userId: string, updates: any) => {
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
      return { data: null, error: error as PostgrestError };
    }
  },
  
  deleteNotification: async (notificationId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Risk Functions
  getAiRisk: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no risk exists, create a mock AI-generated risk
      if (!data) {
        const mockRisk = {
          id: `mock-${projectId}`,
          name: 'Schedule Delay Risk',
          description: 'AI-detected potential delay in project timeline based on current progress.',
          category: 'Schedule',
          probability: 7, // on scale of 1-10
          impact: 8, // on scale of 1-10
          owner: { 
            name: 'Project Manager', 
            avatar: '', 
            initials: 'PM' 
          },
          status: 'Open',
          lastReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        return mockRisk;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching AI risk:', error);
      return null;
    }
  },
  
  // Auth Functions
  upsertAppUser: async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: user.full_name || user.email,
          avatar_url: user.avatar_url || null
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error upserting app user:', error);
      return { data: null, error: error as PostgrestError };
    }
  },
  
  // Add the missing getDashboardStats function
  getDashboardStats: async (userId: string) => {
    try {
      // Get completed tasks count
      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'done');
      
      // Get hours tracked - sum of time entries
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('time_spent')
        .eq('user_id', userId);
      
      // Get open issues/tasks count
      const { data: openIssues, error: issuesError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .neq('status', 'done');
      
      // Get team members count
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId);
      
      if (tasksError || timeError || issuesError || teamError) {
        console.error('Error fetching dashboard stats:', 
          tasksError || timeError || issuesError || teamError
        );
        throw new Error('Failed to load dashboard statistics');
      }
      
      // Calculate total hours from minutes
      const hoursTracked = timeEntries ? 
        Math.round(timeEntries.reduce((sum, entry) => sum + (entry.time_spent || 0), 0) / 60 * 10) / 10 : 
        0;
      
      return {
        completedTasks: completedTasks?.length || 0,
        hoursTracked,
        openIssues: openIssues?.length || 0,
        teamMembers: teamMembers?.length || 0
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }
};

export default dbService;
