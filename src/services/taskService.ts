
import { supabase } from '@/integrations/supabase/client';

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

const updateTask = async (taskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating task:', error);
    return { data: null, error };
  }
};

const deleteTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting task:', error);
    return { data: null, error };
  }
};

// Export all functions
export const taskService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};

export default taskService;
