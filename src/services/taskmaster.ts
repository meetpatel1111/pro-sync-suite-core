
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: string;
  project?: string;
  user_id: string;
  created_at?: string;
}

export async function getAllTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data: data as Task[] };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Task };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function deleteTask(id: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
