
import { supabase } from '@/integrations/supabase/client';
import { Task, Project, Board, BoardColumn, Sprint } from '@/types/taskmaster';

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  created_at: string;
}

export interface TaskFile {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
}

export interface TaskTag {
  id: string;
  project_id?: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'relates' | 'duplicates' | 'causes';
  created_by: string;
  created_at: string;
}

export interface TaskChecklist {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  position: number;
  created_by: string;
  created_at: string;
}

class TaskMasterService {
  // Project Management
  async getProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: [], error };
    }
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  }

  // Board Management
  async getBoards(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching boards:', error);
      return { data: [], error };
    }
  }

  async createBoard(board: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert(board)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating board:', error);
      return { data: null, error };
    }
  }

  // Task Management
  async getTasks(boardId: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
  }

  async createTask(task: any, userId: string) {
    try {
      // Generate task key if not provided
      if (!task.task_key) {
        const { data: project } = await supabase
          .from('projects')
          .select('key, name')
          .eq('id', task.project_id)
          .single();

        const projectKey = project?.key || project?.name?.substring(0, 3).toUpperCase() || 'TASK';
        
        // Get next task number for the project
        const { data: lastTask } = await supabase
          .from('tasks')
          .select('task_number')
          .eq('project_id', task.project_id)
          .order('task_number', { ascending: false })
          .limit(1)
          .single();

        const nextNumber = (lastTask?.task_number || 0) + 1;
        task.task_key = `${projectKey}-${nextNumber}`;
        task.task_number = nextNumber;
      }

      task.created_by = userId;
      if (!task.reporter_id) {
        task.reporter_id = userId;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      // Log task creation
      if (data) {
        await this.logTaskHistory(data.id, userId, 'created', '', '', `Task ${data.task_key} created`);
      }

      return { data, error };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  }

  async updateTask(taskId: string, updates: any, userId: string) {
    try {
      // Get current task for comparison
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_by: userId })
        .eq('id', taskId)
        .select()
        .single();

      // Log changes
      if (data && currentTask) {
        for (const [key, newValue] of Object.entries(updates)) {
          const oldValue = currentTask[key as keyof typeof currentTask];
          if (oldValue !== newValue) {
            await this.logTaskHistory(
              taskId, 
              userId, 
              'updated', 
              key, 
              String(oldValue), 
              String(newValue)
            );
          }
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
  }

  // Task History
  async logTaskHistory(taskId: string, userId: string, action: string, fieldName?: string, oldValue?: string, newValue?: string, description?: string) {
    try {
      const { error } = await supabase
        .from('task_history')
        .insert({
          task_id: taskId,
          user_id: userId,
          action,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          description: description || `${action} ${fieldName || ''}`
        });

      if (error) console.error('Error logging task history:', error);
    } catch (error) {
      console.error('Error in logTaskHistory:', error);
    }
  }

  async getTaskHistory(taskId: string): Promise<{ data: TaskHistory[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching task history:', error);
      return { data: [], error };
    }
  }

  // Task Files
  async uploadTaskFile(taskId: string, file: { file_url: string; file_name: string; file_type?: string; file_size?: number }, userId: string) {
    try {
      const { data, error } = await supabase
        .from('task_files')
        .insert({
          task_id: taskId,
          uploaded_by: userId,
          ...file
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error uploading task file:', error);
      return { data: null, error };
    }
  }

  async getTaskFiles(taskId: string): Promise<{ data: TaskFile[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching task files:', error);
      return { data: [], error };
    }
  }

  // Task Tags
  async createTaskTag(projectId: string, name: string, color: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('task_tags')
        .insert({
          project_id: projectId,
          name,
          color,
          created_by: userId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating task tag:', error);
      return { data: null, error };
    }
  }

  async getTaskTags(projectId: string): Promise<{ data: TaskTag[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching task tags:', error);
      return { data: [], error };
    }
  }

  async assignTagToTask(taskId: string, tagId: string) {
    try {
      const { data, error } = await supabase
        .from('task_tag_assignments')
        .insert({ task_id: taskId, tag_id: tagId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error assigning tag to task:', error);
      return { data: null, error };
    }
  }

  // Task Dependencies
  async addTaskDependency(taskId: string, dependsOnTaskId: string, dependencyType: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
          dependency_type: dependencyType as any,
          created_by: userId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error adding task dependency:', error);
      return { data: null, error };
    }
  }

  async getTaskDependencies(taskId: string): Promise<{ data: TaskDependency[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching task dependencies:', error);
      return { data: [], error };
    }
  }

  // Task Checklists
  async addChecklistItem(taskId: string, title: string, description: string, userId: string) {
    try {
      const { data: maxPosition } = await supabase
        .from('task_checklists')
        .select('position')
        .eq('task_id', taskId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = (maxPosition?.position || 0) + 1;

      const { data, error } = await supabase
        .from('task_checklists')
        .insert({
          task_id: taskId,
          title,
          description,
          position,
          created_by: userId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error adding checklist item:', error);
      return { data: null, error };
    }
  }

  async updateChecklistItem(itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) {
    try {
      const { data, error } = await supabase
        .from('task_checklists')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return { data: null, error };
    }
  }

  async getTaskChecklists(taskId: string): Promise<{ data: TaskChecklist[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', taskId)
        .order('position', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching task checklists:', error);
      return { data: [], error };
    }
  }
}

export const taskmasterService = new TaskMasterService();
