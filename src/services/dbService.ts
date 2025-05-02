import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

export async function updateUserSettings(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { data: null, error };
  }
}

export async function getUserSettings(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error };
  }
}

export async function createTask(task: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
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
    
    if (error) throw error;
    return { data, error: null };
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
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { data: null, error };
  }
}

export async function getTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { data: null, error };
  }
}

export async function createProject(project: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }
}

export async function updateProject(projectId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating project:', error);
    return { data: null, error };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { data: null, error };
  }
}

export async function getProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: null, error };
  }
}

export async function getDashboardStats(userId: string) {
  try {
    // Get completed tasks count
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('count')
      .eq('user_id', userId)
      .eq('status', 'done')
      .single();

    // Get hours tracked (sum of time entries)
    const { data: timeTracked, error: timeError } = await supabase
      .from('time_entries')
      .select('sum(time_spent)')
      .eq('user_id', userId)
      .single();

    // Get open issues count
    const { data: openIssues, error: issuesError } = await supabase
      .from('tasks')
      .select('count')
      .eq('user_id', userId)
      .in('status', ['todo', 'inProgress', 'review'])
      .single();

    // Get team members count
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('count')
      .eq('user_id', userId)
      .single();

    return {
      completedTasks: completedTasks?.count || 0,
      hoursTracked: timeTracked?.sum || 0,
      openIssues: openIssues?.count || 0,
      teamMembers: teamMembers?.count || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getTimeEntries(userId: string, filters?: {
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
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return { data: null, error };
  }
}

export async function getRisks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching risks:', error);
    return { data: null, error };
  }
}
