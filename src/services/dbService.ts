
import { supabase } from "../integrations/supabase/client";

// Get user profile data
async function getUserProfile(userId: string) {
  return await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

// Update user profile data
async function updateUserProfile(userId: string, updates: any) {
  return await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);
}

// Get all tasks for a user
async function getTasks(userId: string) {
  return await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

// Create a new task
async function createTask(userId: string, taskData: any) {
  return await supabase
    .from('tasks')
    .insert([{ ...taskData, user_id: userId }]);
}

// Update an existing task
async function updateTask(taskId: string, userId: string, updates: any) {
  return await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId);
}

// Delete a task
async function deleteTask(taskId: string, userId: string) {
  return await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
}

// Get dashboard statistics
async function getDashboardStats(userId: string) {
  // For the dashboard, we'll need to get:
  // 1. Count of completed tasks
  // 2. Count of open issues/tasks
  // 3. Total hours tracked
  // 4. Team members count

  const completedTasksPromise = supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'completed');

  const openTasksPromise = supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .not('status', 'eq', 'completed');

  const hoursPromise = supabase
    .from('time_entries')
    .select('time_spent')
    .eq('user_id', userId);

  const teamMembersPromise = supabase
    .from('team_members')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  const [completedTasks, openTasks, hours, teamMembers] = await Promise.all([
    completedTasksPromise,
    openTasksPromise,
    hoursPromise,
    teamMembersPromise
  ]);

  // Calculate total hours
  let totalHours = 0;
  if (hours.data) {
    totalHours = hours.data.reduce((total: number, entry: any) => {
      return total + (entry.time_spent || 0) / 60; // Convert minutes to hours
    }, 0);
  }

  return {
    data: {
      completedTasks: completedTasks.count || 0,
      openIssues: openTasks.count || 0,
      hoursTracked: parseFloat(totalHours.toFixed(1)),
      teamMembers: teamMembers.count || 0
    },
    error: completedTasks.error || openTasks.error || hours.error || teamMembers.error
  };
}

// Get clients
async function getClients(userId: string) {
  return await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name');
}

// Create a client
async function createClient(userId: string, clientData: any) {
  return await supabase
    .from('clients')
    .insert([{ ...clientData, user_id: userId }]);
}

// Get projects
async function getProjects(userId: string) {
  return await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('name');
}

// Create a project
async function createProject(userId: string, projectData: any) {
  return await supabase
    .from('projects')
    .insert([{ ...projectData, user_id: userId }]);
}

// Get time entries
async function getTimeEntries(userId: string, filters?: any) {
  let query = supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId);

  if (filters) {
    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters.start_date) {
      query = query.gte('date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('date', filters.end_date);
    }
  }

  return await query.order('date', { ascending: false });
}

// Create a time entry
async function createTimeEntry(userId: string, entryData: any) {
  return await supabase
    .from('time_entries')
    .insert([{ ...entryData, user_id: userId }]);
}

// Get user settings
async function getUserSettings(userId: string) {
  return await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
}

// Update user settings
async function updateUserSettings(userId: string, updates: any) {
  return await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId);
}

// Create user settings
async function createUserSettings(userId: string, settings: any) {
  return await supabase
    .from('user_settings')
    .insert([{ ...settings, user_id: userId }]);
}

// Upsert application user
async function upsertAppUser(userData: any) {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userData.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { error: fetchError };
  }

  if (existingUser) {
    return await supabase
      .from('users')
      .update(userData)
      .eq('id', userData.id);
  } else {
    return await supabase.from('users').insert([userData]);
  }
}

// Hash password for custom authentication
async function hashPassword(password: string): Promise<string> {
  // This is a simplified example - in a real app, use proper password hashing
  // such as bcrypt, which would typically be done on the server side
  // Here we're just using a basic hash for demonstration
  
  // In a real application, we'd use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify custom password
async function verifyCustomPassword(userId: string, password: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('custom_password_hash')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    if (!user || !user.custom_password_hash) return false;
    
    const hashedPassword = await hashPassword(password);
    return hashedPassword === user.custom_password_hash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Get risks
async function getRisks(userId: string) {
  return await supabase
    .from('risks')
    .select('*')
    .order('created_at', { ascending: false });
}

// Create a risk
async function createRisk(riskData: any) {
  return await supabase
    .from('risks')
    .insert([riskData]);
}

// Update a risk
async function updateRisk(riskId: string, updates: any) {
  return await supabase
    .from('risks')
    .update(updates)
    .eq('id', riskId);
}

// Delete a risk
async function deleteRisk(riskId: string) {
  return await supabase
    .from('risks')
    .delete()
    .eq('id', riskId);
}

// Get notifications for a user
async function getNotifications(userId: string) {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

// Update notification
async function updateNotification(notificationId: string, userId: string, updates: any) {
  return await supabase
    .from('notifications')
    .update(updates)
    .eq('id', notificationId)
    .eq('user_id', userId);
}

// Get resource allocations
async function getResourceAllocations() {
  return await supabase
    .from('resource_allocations')
    .select('*');
}

// Get utilization history
async function getUtilizationHistory() {
  return await supabase
    .from('utilization_history')
    .select('*');
}

// Get unavailability
async function getUnavailability() {
  return await supabase
    .from('unavailability')
    .select('*');
}

// Delete skills by resource ID
async function deleteSkillsByResourceId(resourceId: string) {
  return await supabase
    .from('resource_skills')
    .delete()
    .eq('resource_id', resourceId);
}

// Create user skill
async function createUserSkill(skill: any) {
  return await supabase
    .from('user_skills')
    .insert([skill]);
}

// Create default export object
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
  getNotifications,
  updateNotification,
  getResourceAllocations,
  getUtilizationHistory,
  getUnavailability,
  deleteSkillsByResourceId,
  createUserSkill
};

export default dbService;

// Export individual functions for direct importing
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
  getNotifications,
  updateNotification,
  getResourceAllocations,
  getUtilizationHistory,
  getUnavailability,
  deleteSkillsByResourceId,
  createUserSkill
};
