
import { supabase } from '@/integrations/supabase/client';
import type { Project, Board, TaskMasterTask } from '@/types/taskmaster';

class TaskmasterService {
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    return { data, error };
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    return { data, error };
  }

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    return { error };
  }

  async getBoards(projectId: string) {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async createBoard(boardData: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('boards')
      .insert([boardData])
      .select()
      .single();

    return { data, error };
  }

  async updateBoard(boardId: string, updates: Partial<Board>) {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single();

    return { data, error };
  }

  async deleteBoard(boardId: string) {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);

    return { error };
  }

  async getTasks(boardId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    return { data, error };
  }

  async createTask(taskData: Omit<TaskMasterTask, 'id' | 'task_number' | 'task_key' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    return { data, error };
  }

  async updateTask(taskId: string, updates: Partial<TaskMasterTask>, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  }

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    return { error };
  }

  async getTasksByProject(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async getTasksByAssignee(assigneeId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', assigneeId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async updateTaskStatus(taskId: string, status: string, userId: string) {
    return this.updateTask(taskId, { status }, userId);
  }

  async assignTask(taskId: string, assigneeId: string, userId: string) {
    return this.updateTask(taskId, { assignee_id: assigneeId }, userId);
  }
}

export const taskmasterService = new TaskmasterService();
