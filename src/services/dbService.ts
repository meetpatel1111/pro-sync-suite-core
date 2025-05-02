import { supabase } from '@/integrations/supabase/client';
import { Client, ClientNote, ResourceAllocation, Task, TimeEntry } from '@/utils/dbtypes';
import { PostgrestError } from '@supabase/supabase-js';

// Function to get user profile by ID
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to update user profile
const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
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
    console.error('Unexpected error updating user profile:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to get user settings
const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user settings:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to update user settings
const updateUserSettings = async (userId: string, updates: any) => {
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
    console.error('Unexpected error updating user settings:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to get projects for a user
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
    console.error('Unexpected error fetching projects:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to create a new project
const createProject = async (projectData: any) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating project:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to update an existing project
const updateProject = async (projectId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating project:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to delete a project
const deleteProject = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error deleting project:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to get time entries for a user
const getTimeEntries = async (userId: string, options?: { projectId?: string }) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    // Add filter by project ID if provided
    if (options?.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching time entries:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to create a new time entry
const createTimeEntry = async (userId: string, timeEntryData: any) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{ ...timeEntryData, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating time entry:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to update an existing time entry
const updateTimeEntry = async (entryId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating time entry:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to delete a time entry
const deleteTimeEntry = async (entryId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error deleting time entry:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to hash a password
const hashPassword = async (password: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('hash-password', {
      body: { password },
    });

    if (error) {
      console.error('Error hashing password:', error);
      return { data: null, error };
    }

    return { data: data.hashedPassword, error: null };
  } catch (error) {
    console.error('Unexpected error hashing password:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to verify a custom password
const verifyCustomPassword = async (userId: string, passwordPlain: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-password', {
      body: { user_id: userId, password_plain: passwordPlain },
    });

    if (error) {
      console.error('Error verifying custom password:', error);
      return { data: null, error };
    }

    return { data: data.isValid, error: null };
  } catch (error) {
    console.error('Unexpected error verifying custom password:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to get notifications for a user
const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

// Function to update a notification
const updateNotification = async (notificationId: string, userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .match({ id: notificationId, user_id: userId })
      .select();

    return { data, error };
  } catch (error) {
    console.error('Error updating notification:', error);
    return { error };
  }
};

// Function to create a new client
const createClient = async (client: Partial<Client>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating client:', error);
    return { error };
  }
};

// Function to get clients for a user
const getClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error getting clients:', error);
    return { error };
  }
};

// Function to delete a client
const deleteClient = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { error };
  }
};

// Fix the batch upsert clients function
const createClients = async (clients: Partial<Client>[]) => {
  try {
    // Make sure name and user_id are required
    const validClients = clients.filter(client => client.name && client.user_id);
    if (validClients.length === 0) {
      return { error: { message: 'No valid clients to insert' } };
    }
    
    const { data, error } = await supabase
      .from('clients')
      .upsert(validClients);
    
    return { data, error };
  } catch (error) {
    console.error('Error creating clients:', error);
    return { error };
  }
};

// Function to delete a client note
const deleteClientNote = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting client note:', error);
    return { error };
  }
};

// Fix the createClientNote function
const createClientNote = async (clientNote: Partial<ClientNote>) => {
  try {
    // Make sure required fields are present
    if (!clientNote.client_id || !clientNote.user_id || !clientNote.content) {
      return { error: { message: 'Missing required fields in client note' } };
    }
    
    const { data, error } = await supabase
      .from('client_notes')
      .insert(clientNote);
    
    return { data, error };
  } catch (error) {
    console.error('Error creating client note:', error);
    return { error };
  }
};

// Add missing function to get client notes by client ID
const getClientNotesByClientId = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId);
    
    return { data, error };
  } catch (error) {
    console.error('Error getting client notes:', error);
    return { error };
  }
};

// Add missing function to update client
const updateClient = async (id: string, updates: Partial<Client>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating client:', error);
    return { error };
  }
};

// Add missing functions for resource allocations
const createResourceAllocation = async (allocation: Partial<ResourceAllocation>) => {
  try {
    if (!allocation.user_id || !allocation.team || allocation.allocation === undefined) {
      return { error: { message: 'Missing required fields for resource allocation' } };
    }
    
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert(allocation);
    
    return { data, error };
  } catch (error) {
    console.error('Error creating resource allocation:', error);
    return { error };
  }
};

const deleteResourceAllocation = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .delete()
      .eq('id', id);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting resource allocation:', error);
    return { error };
  }
};

// Add functions for file operations
const getFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error getting files:', error);
    return { error };
  }
};

const createFileRecord = async (userId: string, file: any) => {
  try {
    const fileData = {
      ...file,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('files')
      .insert(fileData);
    
    return { data, error };
  } catch (error) {
    console.error('Error creating file record:', error);
    return { error };
  }
};

// Add functions for user operations
const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    return { data, error };
  } catch (error) {
    console.error('Error getting users:', error);
    return { error };
  }
};

const getUserSkills = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error getting user skills:', error);
    return { error };
  }
};

// Add function to create user skill
const createUserSkill = async (skill: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill: skill
      });
    
    return { data, error };
  } catch (error) {
    console.error('Error creating user skill:', error);
    return { error };
  }
};

// Add these missing functions for authentication and user management
const upsertAppUser = async (user: any) => {
  try {
    // First check if user exists in user_profiles
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (!existingUser && !checkError) {
      // User doesn't exist, create a new entry
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null
        });
        
      if (error) return { error };
      return { data };
    } else if (!checkError) {
      // User exists, return it
      return { data: existingUser };
    } else {
      // Error checking for user
      return { error: checkError };
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    return { error };
  }
};

const createUserSettings = async (userId: string, defaultSettings: any) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...defaultSettings
      });
      
    return { data, error };
  } catch (error) {
    console.error('Error creating user settings:', error);
    return { error };
  }
};

// Functions for tasks
const getTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
      
    return { data, error };
  } catch (error) {
    console.error('Error getting tasks:', error);
    return { error };
  }
};

// Functions for settings
const getTaskSettings = async (userId: string) => {
  // This is a convenience wrapper around getUserSettings
  return getUserSettings(userId);
};

const updateTaskSettings = async (userId: string, settings: any) => {
  // This is a convenience wrapper around updateUserSettings
  return updateUserSettings(userId, settings);
};

// Risks management
const getRisks = async (projectId?: string) => {
  try {
    let query = supabase.from('risks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error('Error getting risks:', error);
    return { error };
  }
};

// Dashboard statistics
const getDashboardStats = async (userId: string) => {
  try {
    // Get tasks stats
    const { data: tasks, error: tasksError } = await getTasks(userId);
    if (tasksError) throw tasksError;
    
    // Get time entries
    const { data: timeEntries, error: timeEntriesError } = await getTimeEntries(userId);
    if (timeEntriesError) throw timeEntriesError;
    
    // Get project stats
    const { data: projects, error: projectsError } = await getProjects(userId);
    if (projectsError) throw projectsError;
    
    // Get team members/users
    const { data: users, error: usersError } = await getUsers();
    if (usersError) throw usersError;
    
    // Calculate stats
    const stats = {
      completedTasks: tasks ? tasks.filter(task => task.status === 'done').length : 0,
      openIssues: tasks ? tasks.filter(task => task.status === 'todo' || task.status === 'inProgress').length : 0,
      hoursTracked: timeEntries ? timeEntries.reduce((sum, entry) => 
        sum + (entry.duration || 0) / 3600, 0) : 0, // Convert seconds to hours
      teamMembers: users ? users.length : 0
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { data: null, error };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  hashPassword,
  verifyCustomPassword,
  getNotifications,
  updateNotification,
  createClient,
  getClients,
  createClients,
  createClientNote,
  getClientNotesByClientId,
  updateClient,
  deleteClient,
  deleteClientNote,
  createResourceAllocation,
  deleteResourceAllocation,
  getFiles,
  createFileRecord,
  getUsers,
  getUserSkills,
  createUserSkill,
  upsertAppUser,
  createUserSettings,
  getTasks,
  getTaskSettings,
  updateTaskSettings,
  getRisks,
  getDashboardStats
};
