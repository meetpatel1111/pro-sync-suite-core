import { supabase } from '@/integrations/supabase/client';
import { User, TimeEntry } from '@/utils/dbtypes';

// Define UserSettings interface
export interface UserSettings {
  id?: string;
  user_id: string;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  email_notifications?: any;
  app_notifications?: any;
  auto_save?: boolean;
  interface_density?: string;
  font_size?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// User Profile Functions
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching user profile:', error);
    return { data: null, error };
  }
};

const createUserProfile = async (user: Omit<User, 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating user profile:', error);
    return { data: null, error };
  }
};

const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating user profile:', error);
    return { data: null, error };
  }
};

const deleteUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting user profile:', error);
    return { data: null, error };
  }
};

// Upsert App User
const upsertAppUser = async (user: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          username: user.email.split('@')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while upserting user:', error);
    return { data: null, error };
  }
};

// Time Entry Functions
const getTimeEntry = async (timeEntryId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single();

    if (error) {
      console.error('Error fetching time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching time entry:', error);
    return { data: null, error };
  }
};

const listTimeEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error listing time entries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while listing time entries:', error);
    return { data: null, error };
  }
};

const createTimeEntry = async (timeEntryData: Partial<TimeEntry>) => {
  try {
    // Ensure required fields have values
    const data = {
      description: timeEntryData.description || 'Time entry',
      project: timeEntryData.project || 'General',
      time_spent: timeEntryData.time_spent || 60,
      user_id: timeEntryData.user_id,
      ...timeEntryData
    };
    
    // Ensure date is not null before processing
    if (!data.date) {
      data.date = new Date().toISOString();
    } else {
      // Format the date properly
      data.date = new Date(data.date).toISOString();
    }
    
    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating time entry:', error);
      return { data: null, error };
    }
    return { data: result, error: null };
  } catch (error) {
    console.error('Exception while creating time entry:', error);
    return { data: null, error };
  }
};

const updateTimeEntry = async (timeEntryId: string, updates: Partial<TimeEntry>) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating time entry:', error);
    return { data: null, error };
  }
};

const deleteTimeEntry = async (timeEntryId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', timeEntryId);

    if (error) {
      console.error('Error deleting time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting time entry:', error);
    return { data: null, error };
  }
};

// User Settings Functions
const getUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
  
      if (error) {
        // If no settings found, return null data, but no error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Error fetching user settings:', error);
        return { data: null, error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Exception while fetching user settings:', error);
      return { data: null, error };
    }
  };
  
const createUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user settings:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating user settings:', error);
    return { data: null, error };
  }
};

const updateUserSettings = async (userId: string, updates: Partial<UserSettings>) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating user settings:', error);
    return { data: null, error };
  }
};

const deleteUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user settings:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting user settings:', error);
    return { data: null, error };
  }
};

// Dashboard Stats Function
const getDashboardStats = async (userId: string) => {
  try {
    console.log('Fetching dashboard stats for user:', userId);
    
    // Get completed tasks count
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('count')
      .eq('user_id', userId)
      .eq('status', 'completed');
    
    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError);
    }
    
    // Get total hours tracked
    const { data: timeData, error: timeError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('user_id', userId);
    
    if (timeError) {
      console.error('Error fetching time entries:', timeError);
    }
    
    // Get open issues count
    const { data: issuesData, error: issuesError } = await supabase
      .from('risks')
      .select('count')
      .eq('status', 'open');
    
    if (issuesError) {
      console.error('Error fetching open issues:', issuesError);
    }
    
    // Get team members count
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('count')
      .eq('user_id', userId);
    
    if (teamError) {
      console.error('Error fetching team members:', teamError);
    }
    
    // Calculate total hours
    let totalHours = 0;
    if (timeData) {
      totalHours = timeData.reduce((sum, entry) => sum + (entry.time_spent || 0), 0);
    }
    
    return {
      data: {
        completedTasks: tasksData?.length || 0,
        hoursTracked: Math.round(totalHours / 60), // Convert to hours
        openIssues: issuesData?.length || 0,
        teamMembers: teamData?.length || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { data: null, error };
  }
};

// Add Client functions
const getClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching clients:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching clients:', error);
    return { data: null, error };
  }
};

const getClientById = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client by ID:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching client by ID:', error);
    return { data: null, error };
  }
};

const createClient = async (clientData: any) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating client:', error);
    return { data: null, error };
  }
};

const updateClient = async (clientId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating client:', error);
    return { data: null, error };
  }
};

const deleteClient = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting client:', error);
    return { data: null, error };
  }
};

// Client Notes functions
const getClientNotes = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client notes:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching client notes:', error);
    return { data: null, error };
  }
};

const createClientNote = async (noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating client note:', error);
    return { data: null, error };
  }
};

const updateClientNote = async (noteId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating client note:', error);
    return { data: null, error };
  }
};

const deleteClientNote = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting client note:', error);
    return { data: null, error };
  }
};

// Get TimeEntries with filters
const getTimeEntries = async (userId: string, filters?: any) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.start_date) {
        query = query.gte('date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('date', filters.end_date);
      }
    }

    // Order by date
    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching time entries:', error);
    return { data: null, error };
  }
};

// Get notifications
const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching notifications:', error);
    return { data: null, error };
  }
};

const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while marking notification as read:', error);
    return { data: null, error };
  }
};

// Resource functions
const getResources = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resources:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resources:', error);
    return { data: null, error };
  }
};

const getResourceAllocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resource allocations:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resource allocations:', error);
    return { data: null, error };
  }
};

const getResourceSkills = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resource skills:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resource skills:', error);
    return { data: null, error };
  }
};

const getTeamMembers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching team members:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching team members:', error);
    return { data: null, error };
  }
};

// Projects functions
const getProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching projects:', error);
    return { data: null, error };
  }
};

// Tasks functions
const getTasks = async (userId: string, filters?: any) => {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.project) {
        query = query.eq('project', filters.project);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assignee) {
        query = query.eq('assignee', filters.assignee);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching tasks:', error);
    return { data: null, error };
  }
};

const createTask = async (taskData: any) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating task:', error);
    return { data: null, error };
  }
};

// Risks functions
const getRisks = async (userId: string, projectId?: string) => {
  try {
    let query = supabase.from('risks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risks:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching risks:', error);
    return { data: null, error };
  }
};

// FileVault functions
const getFiles = async (userId: string, filters?: any) => {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.type) {
        query = query.eq('file_type', filters.type);
      }
      if (filters.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching files:', error);
    return { data: null, error };
  }
};

const uploadFile = async (fileData: any) => {
  try {
    // In a real implementation, we would upload to storage and then record in the database
    // This is a mock implementation for now
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: fileData.name,
        file_type: fileData.type,
        size_bytes: fileData.size,
        user_id: fileData.userId,
        storage_path: `files/${fileData.userId}/${fileData.name}`,
        project_id: fileData.projectId,
        is_public: fileData.isPublic || false,
        description: fileData.description || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while uploading file:', error);
    return { data: null, error };
  }
};

// InsightIQ functions
const getDashboards = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboards:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching dashboards:', error);
    return { data: null, error };
  }
};

const getWidgets = async (dashboardId: string) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching widgets:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching widgets:', error);
    return { data: null, error };
  }
};

const createDashboard = async (dashboardData: any) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .insert(dashboardData)
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating dashboard:', error);
    return { data: null, error };
  }
};

const updateDashboard = async (dashboardId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .update(updates)
      .eq('id', dashboardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating dashboard:', error);
    return { data: null, error };
  }
};

const deleteDashboard = async (dashboardId: string) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) {
      console.error('Error deleting dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting dashboard:', error);
    return { data: null, error };
  }
};

const createWidget = async (widgetData: any) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .insert(widgetData)
      .select()
      .single();

    if (error) {
      console.error('Error creating widget:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating widget:', error);
    return { data: null, error };
  }
};

const deleteWidget = async (widgetId: string) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId);

    if (error) {
      console.error('Error deleting widget:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting widget:', error);
    return { data: null, error };
  }
};

// RiskRadar functions
const createRisk = async (riskData: any) => {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert(riskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating risk:', error);
    return { data: null, error };
  }
};

const updateRisk = async (riskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', riskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating risk:', error);
    return { data: null, error };
  }
};

// PlanBoard functions
const createResourceAllocation = async (allocationData: any) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert(allocationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating resource allocation:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating resource allocation:', error);
    return { data: null, error };
  }
};

// Export all functions
const dbService = {
  // User profile functions
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  
  // Time entry functions
  getTimeEntry,
  listTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  
  // User settings functions
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings,
  
  // App user functions
  upsertAppUser,
  
  // Dashboard stats function
  getDashboardStats,
  
  // Client functions
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientNotes,
  createClientNote,
  updateClientNote,
  deleteClientNote,
  
  // Time entries function
  getTimeEntries,
  
  // Notification functions
  getNotifications,
  markNotificationAsRead,
  
  // Resource functions
  getResources,
  getResourceAllocations,
  getResourceSkills,
  getTeamMembers,
  
  // Project functions
  getProjects,
  
  // Task functions
  getTasks,
  createTask,
  
  // Risk functions
  getRisks,
  createRisk,
  updateRisk,
  
  // FileVault functions
  getFiles,
  uploadFile,
  
  // InsightIQ functions
  getDashboards,
  getWidgets,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createWidget,
  deleteWidget,
  
  // PlanBoard functions
  createResourceAllocation
};

export default dbService;
