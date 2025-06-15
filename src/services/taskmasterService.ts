
import { supabase } from '@/integrations/supabase/client';
import type { Project, Board, TaskMasterTask } from '@/types/taskmaster';

class TaskmasterService {
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Project[] | null, error };
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        key: projectData.key,
        description: projectData.description || '',
        status: projectData.status || 'active',
        created_by: projectData.created_by,
        user_id: projectData.user_id
      }])
      .select()
      .single();

    return { data: data as Project | null, error };
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    return { data: data as Project | null, error };
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

    return { data: data as Board[] | null, error };
  }

  async createBoard(boardData: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('boards')
      .insert([{
        project_id: boardData.project_id,
        name: boardData.name,
        type: boardData.type,
        description: boardData.description || '',
        config: boardData.config,
        created_by: boardData.created_by
      }])
      .select()
      .single();

    return { data: data as Board | null, error };
  }

  async updateBoard(boardId: string, updates: Partial<Board>) {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single();

    return { data: data as Board | null, error };
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

    return { data: data as TaskMasterTask[] | null, error };
  }

  async createTask(taskData: Omit<TaskMasterTask, 'id' | 'task_number' | 'task_key' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        board_id: taskData.board_id,
        project_id: taskData.project_id,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        type: taskData.type,
        visibility: taskData.visibility,
        position: taskData.position,
        actual_hours: taskData.actual_hours,
        created_by: taskData.created_by,
        assignee_id: taskData.assignee_id,
        estimate_hours: taskData.estimate_hours,
        due_date: taskData.due_date,
        start_date: taskData.start_date
      }])
      .select()
      .single();

    return { data: data as TaskMasterTask | null, error };
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

    return { data: data as TaskMasterTask | null, error };
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

    return { data: data as TaskMasterTask[] | null, error };
  }

  async getTasksByAssignee(assigneeId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', assigneeId)
      .order('created_at', { ascending: false });

    return { data: data as TaskMasterTask[] | null, error };
  }

  async updateTaskStatus(taskId: string, status: string, userId: string) {
    return this.updateTask(taskId, { status }, userId);
  }

  async assignTask(taskId: string, assigneeId: string, userId: string) {
    return this.updateTask(taskId, { assignee_id: assigneeId }, userId);
  }
}

export const taskmasterService = new TaskmasterService();
