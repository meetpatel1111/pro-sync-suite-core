import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { Client, ClientNote, TimeEntry, ResourceAllocation, File, Task, Project } from '@/utils/dbtypes';

// Helper functions
const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// User Profile Functions
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Added updateUserProfile function
const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select();
    
    return { data, error };
  } catch (error) {
    return { error, data: null };
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
    
    if (error && error.code !== 'PGRST116') return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

const createUserSettings = async (userId: string, settings: any) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ user_id: userId, ...settings })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const updateUserSettings = async (userId: string, settings: any) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Auth related functions
const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { data: hashedPassword, error: null };
  } catch (error) {
    return handleError(error);
  }
};

const verifyCustomPassword = async (userId: string, password: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('custom_password_hash')
      .eq('id', userId)
      .single();
    
    if (error || !user?.custom_password_hash) return false;
    
    const isMatch = await bcrypt.compare(password, user.custom_password_hash);
    return isMatch;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// User management
const upsertAppUser = async (user: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.avatar_url || ''
      })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Notifications
const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const getUnreadNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Update notification
const updateNotification = async (notificationId: string, updateData: any) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating notification:', error);
    return { data: null, error };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select();
      
    return { data, error };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error };
  }
};

// Client Functions
const getClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createClient = async (client: Client) => {
  try {
    // Ensure required fields
    if (!client.name || !client.user_id) {
      return handleError(new Error('Client name and user_id are required'));
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        user_id: client.user_id,
        email: client.email || null,
        phone: client.phone || null,
        company: client.company || null
      })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

const updateClient = async (clientId: string, updates: Partial<Client>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const deleteClient = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Client Notes Functions
const getClientNotes = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createClientNote = async (note: Partial<ClientNote>) => {
  try {
    // Validate required fields
    if (!note.client_id || !note.user_id || !note.content) {
      return handleError(new Error('client_id, user_id, and content are required'));
    }

    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: note.client_id,
        user_id: note.user_id,
        content: note.content
      })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

const deleteClientNote = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Time Tracking Functions
const getTimeEntries = async (userId: string, filters: { 
  projectId?: string; 
  start_date?: string; 
  end_date?: string; 
  [key: string]: any;
} = {}) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters with type checking
    if (filters && typeof filters === 'object') {
      if ('projectId' in filters && filters.projectId) {
        const projectId = String(filters.projectId);
        query = query.eq('project_id', projectId);
      }
      
      if ('start_date' in filters && filters.start_date) {
        const startDate = String(filters.start_date);
        query = query.gte('date', startDate);
      }
      
      if ('end_date' in filters && filters.end_date) {
        const endDate = String(filters.end_date);
        query = query.lte('date', endDate);
      }
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Fixed createTimeEntry function
const createTimeEntry = async (userId: string, timeEntryData: Partial<TimeEntry>) => {
  try {
    // Create a new entry object with required fields
    const entry: any = {
      user_id: userId,
      description: timeEntryData.description || 'Time entry',
      project: timeEntryData.project || 'Unassigned',
      time_spent: timeEntryData.time_spent || 0,
      date: new Date().toISOString(),
      ...timeEntryData
    };

    // Handle date conversion if it exists
    if (typeof entry.date === 'object' && entry.date instanceof Date) {
      entry.date = entry.date.toISOString();
    }
    
    const { data, error } = await supabase
      .from('time_entries')
      .insert(entry)
      .select();

    return { data, error };
  } catch (error) {
    return { error };
  }
};

// Resource functions
const createResourceAllocation = async (allocation: ResourceAllocation) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert({
        resource_id: allocation.resource_id,
        user_id: allocation.user_id,
        allocation: allocation.allocation,
        team: allocation.team
      })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Keep only one version of getResourceAllocations
const getResourceAllocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  } catch (error) {
    return { error };
  }
};

const deleteResourceAllocation = async (allocationId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .delete()
      .eq('id', allocationId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// File Vault Functions
const getFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createFileRecord = async (file: File) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .insert(file)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// User skills functions
const getUserSkills = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createUserSkill = async (skill: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({ skill, user_id: userId })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// User functions
const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Risk functions
const getRisks = async (projectId: string = '') => {
  try {
    let query = supabase.from('risks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Utilization history
const getUtilizationHistory = async (resourceId: string) => {
  try {
    const { data, error } = await supabase
      .from('utilization_history')
      .select('*')
      .eq('resource_id', resourceId)
      .order('date', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Unavailability
const getUnavailability = async (resourceId: string) => {
  try {
    const { data, error } = await supabase
      .from('unavailability')
      .select('*')
      .eq('resource_id', resourceId)
      .order('from_date', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Tasks
const getTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Projects
const getProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Dashboard stats
const getDashboardStats = async (userId: string) => {
  try {
    // This would typically involve multiple queries and aggregation
    // Placeholder for actual implementation
    const stats = {
      totalTasks: 0,
      completedTasks: 0,
      upcomingDeadlines: [],
      activeProjects: 0
    };
    
    // Get task counts
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('user_id', userId);
      
    if (tasksError) return handleError(tasksError);
    
    if (tasks) {
      stats.totalTasks = tasks.length;
      stats.completedTasks = tasks.filter(t => t.status === 'completed').length;
    }
    
    // Get project count
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (projectsError) return handleError(projectsError);
    
    if (projects) {
      stats.activeProjects = projects.length;
    }
    
    return { data: stats, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Add the missing functions
const uploadFile = async (userId: string, fileData: any) => {
  try {
    console.log('Uploading file for user:', userId, fileData);
    // Implementation would go here
    return { data: { id: 'mock-file-id', name: fileData.file.name }, error: null };
  } catch (error) {
    return { error };
  }
};

const getResources = async (userId: string) => {
  try {
    console.log('Getting resources for user:', userId);
    // Implementation would go here
    return { data: [], error: null };
  } catch (error) {
    return { error };
  }
};

const getResourceSkills = async (userId: string) => {
  try {
    console.log('Getting resource skills for user:', userId);
    // Implementation would go here
    return { data: [], error: null };
  } catch (error) {
    return { error };
  }
};

const getTeamMembers = async (userId: string) => {
  try {
    console.log('Getting team members for user:', userId);
    // Implementation would go here
    return { data: [], error: null };
  } catch (error) {
    return { error };
  }
};

const getDashboards = async (userId: string) => {
  try {
    console.log('Getting dashboards for user:', userId);
    // Implementation would go here
    return { data: [], error: null };
  } catch (error) {
    return { error };
  }
};

const getWidgets = async (dashboardId: string) => {
  try {
    console.log('Getting widgets for dashboard:', dashboardId);
    // Implementation would go here
    return { data: [], error: null };
  } catch (error) {
    return { error };
  }
};

const createDashboard = async (dashboardData: any) => {
  try {
    console.log('Creating dashboard:', dashboardData);
    // Implementation would go here
    return { 
      data: [{ 
        id: 'mock-dashboard-id', 
        ...dashboardData, 
        created_at: new Date().toISOString() 
      }], 
      error: null 
    };
  } catch (error) {
    return { error };
  }
};

const updateDashboard = async (dashboardId: string, dashboardData: any) => {
  try {
    console.log('Updating dashboard:', dashboardId, dashboardData);
    // Implementation would go here
    return { 
      data: { 
        id: dashboardId, 
        ...dashboardData, 
        updated_at: new Date().toISOString() 
      }, 
      error: null 
    };
  } catch (error) {
    return { error };
  }
};

const deleteDashboard = async (dashboardId: string) => {
  try {
    console.log('Deleting dashboard:', dashboardId);
    // Implementation would go here
    return { data: { id: dashboardId }, error: null };
  } catch (error) {
    return { error };
  }
};

const createWidget = async (widgetData: any) => {
  try {
    console.log('Creating widget:', widgetData);
    // Implementation would go here
    return { 
      data: [{ 
        id: 'mock-widget-id', 
        ...widgetData, 
        created_at: new Date().toISOString() 
      }], 
      error: null 
    };
  } catch (error) {
    return { error };
  }
};

const createRisk = async (riskData: any) => {
  try {
    console.log('Creating risk:', riskData);
    const { data, error } = await supabase
      .from('risks')
      .insert(riskData)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { error };
  }
};

const updateRisk = async (riskId: string, riskData: any) => {
  try {
    console.log('Updating risk:', riskId, riskData);
    const { data, error } = await supabase
      .from('risks')
      .update(riskData)
      .eq('id', riskId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { error };
  }
};

const deleteWidget = async (widgetId: string) => {
  try {
    console.log('Deleting widget:', widgetId);
    // Implementation would go here
    return { data: { id: widgetId }, error: null };
  } catch (error) {
    return { error };
  }
};

// Also adding collabService related functions needed based on the unhandled errors
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('message_id', messageId);
      
    return { data, error };
  } catch (error) {
    return { error };
  }
};

const createApproval = async (approvalData: any) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .insert(approvalData)
      .select();
      
    return { data, error };
  } catch (error) {
    return { error };
  }
};

// Fix the exports object to remove duplicate getResourceAllocations
const dbService = {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  hashPassword,
  verifyCustomPassword,
  upsertAppUser,
  getNotifications,
  getUnreadNotifications,
  updateNotification,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientNotes,
  createClientNote,
  deleteClientNote,
  getTimeEntries,
  createTimeEntry,
  createResourceAllocation,
  getResourceAllocations,
  deleteResourceAllocation,
  getFiles,
  createFileRecord,
  getUserSkills,
  createUserSkill,
  getUsers,
  getRisks,
  createRisk,
  updateRisk,
  getUtilizationHistory,
  getUnavailability,
  getTasks,
  getProjects,
  getDashboardStats,
  uploadFile,
  getResources,
  getResourceSkills,
  getTeamMembers,
  getDashboards,
  getWidgets,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createWidget,
  deleteWidget,
  markNotificationAsRead
};

export default dbService;
