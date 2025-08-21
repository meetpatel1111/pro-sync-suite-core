
import { supabase } from '@/integrations/supabase/client';

export interface Sprint {
  id: string;
  project_id: string;
  board_id?: string;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  capacity: number;
  velocity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SprintTask {
  id: string;
  sprint_id: string;
  task_id: string;
  committed_at: string;
  initial_story_points?: number;
  current_story_points?: number;
  created_at: string;
}

class SprintService {
  async getSprints(boardId: string): Promise<{ data: Sprint[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      return { data: (data || []) as Sprint[], error };
    } catch (error) {
      console.error('Error fetching sprints:', error);
      return { data: [], error };
    }
  }

  async createSprint(sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at' | 'capacity' | 'velocity'>): Promise<{ data: Sprint | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert({
          ...sprint,
          capacity: 0,
          velocity: 0
        })
        .select()
        .single();

      return { data: data as Sprint, error };
    } catch (error) {
      console.error('Error creating sprint:', error);
      return { data: null, error };
    }
  }

  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<{ data: Sprint | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', sprintId)
        .select()
        .single();

      return { data: data as Sprint, error };
    } catch (error) {
      console.error('Error updating sprint:', error);
      return { data: null, error };
    }
  }

  async addTaskToSprint(sprintId: string, taskId: string, storyPoints?: number): Promise<{ data: SprintTask | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .insert({
          sprint_id: sprintId,
          task_id: taskId,
          initial_story_points: storyPoints,
          current_story_points: storyPoints
        })
        .select()
        .single();

      // Update task with sprint_id
      await supabase
        .from('tasks')
        .update({ sprint_id: sprintId })
        .eq('id', taskId);

      return { data, error };
    } catch (error) {
      console.error('Error adding task to sprint:', error);
      return { data: null, error };
    }
  }

  async removeTaskFromSprint(sprintId: string, taskId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('sprint_tasks')
        .delete()
        .eq('sprint_id', sprintId)
        .eq('task_id', taskId);

      // Remove sprint_id from task
      await supabase
        .from('tasks')
        .update({ sprint_id: null })
        .eq('id', taskId);

      return { error };
    } catch (error) {
      console.error('Error removing task from sprint:', error);
      return { error };
    }
  }

  async getSprintTasks(sprintId: string): Promise<{ data: SprintTask[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .select('*')
        .eq('sprint_id', sprintId);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching sprint tasks:', error);
      return { data: [], error };
    }
  }

  async calculateSprintVelocity(sprintId: string): Promise<number> {
    try {
      const { data: tasks } = await supabase
        .from('sprint_tasks')
        .select('current_story_points, tasks!inner(status)')
        .eq('sprint_id', sprintId);

      if (!tasks) return 0;

      const completedPoints = tasks
        .filter((task: any) => task.tasks.status === 'done')
        .reduce((sum: number, task: any) => sum + (task.current_story_points || 0), 0);

      return completedPoints;
    } catch (error) {
      console.error('Error calculating sprint velocity:', error);
      return 0;
    }
  }
}

export const sprintService = new SprintService();
