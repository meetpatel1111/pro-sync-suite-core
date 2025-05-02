
import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  job_title: string;
  location: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  completedTasks: number | null;
  hoursTracked: number | null;
  openIssues: number | null;
  teamMembers: number | null;
}

// User Profile Functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}

// User Settings Functions
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function createUserSettings(userId: string, settings: any) {
  const { data, error } = await supabase
    .from('user_settings')
    .insert([{ user_id: userId, ...settings }])
    .select()
    .single();
  
  return { data, error };
}

export async function updateUserSettings(userId: string, settings: any) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

// Task Functions
export async function createTask(userId: string, task: any) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id: userId, ...task }])
    .select()
    .single();
  
  return { data, error };
}

export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateTask(taskId: string, updates: any) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  return { data, error };
}

// Project Functions
export async function createProject(userId: string, project: any) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ user_id: userId, ...project }])
    .select()
    .single();
  
  return { data, error };
}

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateProject(projectId: string, updates: any) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  return { data, error };
}

// TimeEntry Functions
export async function createTimeEntry(userId: string, entry: any) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([{ user_id: userId, ...entry }])
    .select()
    .single();
  
  return { data, error };
}

export async function getTimeEntries(userId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  return { data, error };
}

export async function updateTimeEntry(entryId: string, updates: any) {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteTimeEntry(entryId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId);
  
  return { data, error };
}

// Dashboard Stats Function
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Get completed tasks count
    const { data: completedTasksData, error: completedTasksError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (completedTasksError) throw completedTasksError;

    // Get hours tracked
    const { data: timeEntriesData, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('user_id', userId);

    if (timeEntriesError) throw timeEntriesError;

    // Get open issues count
    const { data: openIssuesData, error: openIssuesError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .eq('priority', 'high')
      .not('status', 'eq', 'completed');

    if (openIssuesError) throw openIssuesError;

    // Get team members count
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('team_members')
      .select('count', { count: 'exact' })
      .eq('user_id', userId);

    if (teamMembersError) throw teamMembersError;

    // Calculate total hours
    const hoursTracked = timeEntriesData?.reduce((total, entry) => total + (entry.time_spent || 0), 0) || 0;

    return {
      completedTasks: completedTasksData?.count || 0,
      hoursTracked: hoursTracked,
      openIssues: openIssuesData?.count || 0,
      teamMembers: teamMembersData?.count || 0
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      completedTasks: null,
      hoursTracked: null,
      openIssues: null,
      teamMembers: null
    };
  }
}

// Create a dbService object that contains all our functions
export const dbService = {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  createTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getDashboardStats,
  
  // Add a function to upsert app users (used in useAuth.tsx)
  upsertAppUser: async (user: any) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({ 
        id: user.id, 
        email: user.email,
        full_name: user.user_metadata?.full_name || user.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || user.avatar_url || ''
      })
      .select();
    
    return { data, error };
  },
};
