import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// User profile functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

export async function updateUserProfile(userId: string, updates: any) {
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
    return { data: null, error };
  }
}

// Tasks functions
export async function getTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { data: null, error };
  }
}

export async function createTask(taskData: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
}

export async function updateTask(taskId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating task:', error);
    return { data: null, error };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { data: null, error };
  }
}

// Dashboard stats function
export async function getDashboardStats(userId: string) {
  try {
    // Get tasks stats
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('user_id', userId);
    
    if (tasksError) throw tasksError;
    
    const taskStats = {
      total: tasks ? tasks.length : 0,
      completed: tasks ? tasks.filter(t => t.status === 'completed').length : 0,
      pending: tasks ? tasks.filter(t => t.status !== 'completed').length : 0,
      completionRate: tasks && tasks.length > 0 ? 
        (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
    };
    
    // Get project stats
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('user_id', userId);
    
    if (projectsError) throw projectsError;
    
    const projectStats = {
      total: projects ? projects.length : 0,
      active: projects ? projects.filter(p => p.status === 'active').length : 0,
      completed: projects ? projects.filter(p => p.status === 'completed').length : 0
    };
    
    // Get time tracking summary
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('user_id', userId);
    
    if (timeError) throw timeError;
    
    const hoursTracked = timeEntries ? 
      timeEntries.reduce((sum, entry) => sum + (entry.time_spent / 60), 0) : 0;
    
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId);
    
    if (teamError) throw teamError;
    
    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (activityError) throw activityError;
    
    return { 
      data: {
        taskStats,
        projectStats,
        hoursTracked,
        teamMembers: teamMembers ? teamMembers.length : 0,
        recentActivity
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { data: null, error };
  }
}

// Client functions
export async function getClients(userId: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { data: null, error };
  }
}

export async function createClient(clientData: any) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating client:', error);
    return { data: null, error };
  }
}

// Project functions
export async function getProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: null, error };
  }
}

export async function createProject(projectData: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }
}

// Time entries functions
export async function getTimeEntries(userId: string, filters = {}) {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);
    
    // Apply any additional filters
    if (filters.start_date) {
      query = query.gte('date', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('date', filters.end_date);
    }
    
    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return { data: null, error };
  }
}

export async function createTimeEntry(entryData: any) {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(entryData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating time entry:', error);
    return { data: null, error };
  }
}

// User settings functions
export async function getUserSettings(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error };
  }
}

export async function updateUserSettings(userId: string, settings: any) {
  try {
    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('user_settings')
        .insert({ ...settings, user_id: userId })
        .select()
        .single();
    }
    
    return { data: result.data, error: result.error };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { data: null, error };
  }
}

export async function createUserSettings(userId: string, settings: any) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ ...settings, user_id: userId })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating user settings:', error);
    return { data: null, error };
  }
}

export async function upsertAppUser(user: any) {
  try {
    const { id, email, user_metadata } = user;
    const full_name = user_metadata?.full_name || email;

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id,
          email,
          full_name,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error upserting app user:', error);
    return { data: null, error };
  }
}

// Password functions
export async function hashPassword(password: string) {
  try {
    // This is a basic hash - in reality you would use bcrypt or similar
    // But for demo purposes, we'll use a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Risk related functions
export async function getRisks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching risks:', error);
    return { data: null, error };
  }
}

export async function createRisk(riskData: any) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert(riskData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating risk:', error);
    return { data: null, error };
  }
}

export async function updateRisk(riskId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', riskId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating risk:', error);
    return { data: null, error };
  }
}

export async function deleteRisk(riskId: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .delete()
      .eq('id', riskId);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting risk:', error);
    return { data: null, error };
  }
}

// Verification function
export async function verifyCustomPassword(userId: string, password: string) {
  try {
    const hashedPassword = await hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .select('custom_password_hash')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { 
      data: { 
        verified: data.custom_password_hash === hashedPassword 
      } 
    };
  } catch (error) {
    console.error('Error verifying password:', error);
    return { data: null, error };
  }
}

// Add missing getNotifications function
export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
}

// Export the functions as default and as named exports
export {
  getUserProfile,
  updateUserProfile,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  getClients,
  createClient,
  getProjects,
  createProject,
  getTimeEntries,
  createTimeEntry,
  getUserSettings,
  updateUserSettings,
  createUserSettings,
  upsertAppUser,
  hashPassword,
  verifyCustomPassword,
  getRisks,
  createRisk,
  updateRisk,
  deleteRisk,
  getNotifications
};

// Export the default object for backward compatibility
const dbService = {
  getUserProfile,
  updateUserProfile,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  getClients,
  createClient,
  getProjects,
  createProject,
  getTimeEntries,
  createTimeEntry,
  getUserSettings,
  updateUserSettings,
  createUserSettings,
  upsertAppUser,
  hashPassword,
  verifyCustomPassword,
  getRisks,
  createRisk,
  updateRisk,
  deleteRisk,
  getNotifications
};

export default dbService;
