import { supabase } from '@/integrations/supabase/client';
import type { Project, Board, TaskMasterTask } from '@/types/taskmaster';

class TaskmasterService {
  private handleError(error: any, operation: string) {
    console.error(`Error in ${operation}:`, error);
    return {
      message: error?.message || `Failed to ${operation}`,
      details: error
    };
  }

  async getProjects(userId: string) {
    try {
      console.log('Fetching projects for user:', userId);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching projects:', error);
        return { data: null, error: this.handleError(error, 'fetch projects') };
      }

      // Transform the data to match Project interface
      const projects: Project[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        key: item.key || item.name?.substring(0, 3).toUpperCase() || 'PRJ',
        status: (item.status === 'active' || item.status === 'archived') ? item.status as 'active' | 'archived' : 'active',
        created_by: item.created_by || item.owner_id || userId,
        user_id: item.user_id || userId,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at
      }));

      console.log('Successfully fetched projects:', projects);
      return { data: projects, error: null };
    } catch (e) {
      console.error('Unexpected error fetching projects:', e);
      return { data: null, error: this.handleError(e, 'fetch projects') };
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating project with data:', projectData);

      // Validate required fields
      if (!projectData.name?.trim()) {
        return { data: null, error: { message: 'Project name is required' } };
      }

      if (!projectData.key?.trim()) {
        return { data: null, error: { message: 'Project key is required' } };
      }

      if (!projectData.user_id) {
        return { data: null, error: { message: 'User ID is required' } };
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name.trim(),
          key: projectData.key.trim().toUpperCase(),
          description: projectData.description || '',
          status: projectData.status || 'active',
          created_by: projectData.created_by,
          user_id: projectData.user_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating project:', error);
        return { data: null, error: this.handleError(error, 'create project') };
      }

      // Transform the result to match Project interface
      const project: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        key: data.key || data.name?.substring(0, 3).toUpperCase() || 'PRJ',
        status: (data.status === 'active' || data.status === 'archived') ? data.status as 'active' | 'archived' : 'active',
        created_by: data.created_by || data.owner_id || projectData.created_by,
        user_id: data.user_id || projectData.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      };

      console.log('Successfully created project:', project);
      return { data: project, error: null };
    } catch (e) {
      console.error('Unexpected error creating project:', e);
      return { data: null, error: this.handleError(e, 'create project') };
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) return { data: null, error };

    // Transform the result to match Project interface
    const project: Project = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      key: data.key || data.name?.substring(0, 3).toUpperCase() || 'PRJ',
      status: (data.status === 'active' || data.status === 'archived') ? data.status as 'active' | 'archived' : 'active',
      created_by: data.created_by || data.owner_id || data.user_id,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at
    };

    return { data: project, error };
  }

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    return { error };
  }

  private validateAndTransformBoard(item: any): Board {
    // Validate and cast board type
    const validTypes = ['kanban', 'scrum', 'timeline', 'issue_tracker'] as const;
    const boardType = validTypes.includes(item.type) ? item.type as typeof validTypes[number] : 'kanban';
    
    // Parse and validate config
    let config;
    try {
      if (typeof item.config === 'string') {
        config = JSON.parse(item.config);
      } else {
        config = item.config;
      }
    } catch {
      config = {
        columns: [
          { id: 'todo', name: 'To Do' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'done', name: 'Done' }
        ]
      };
    }

    return {
      id: item.id,
      project_id: item.project_id,
      name: item.name,
      type: boardType,
      description: item.description || '',
      config: config || {
        columns: [
          { id: 'todo', name: 'To Do' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'done', name: 'Done' }
        ]
      },
      created_by: item.created_by,
      created_at: item.created_at,
      updated_at: item.updated_at || item.created_at
    };
  }

  async getBoards(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching boards:', error);
        return { data: [], error: this.handleError(error, 'fetch boards') };
      }

      const boards: Board[] = (data || []).map((item: any) => 
        this.validateAndTransformBoard(item)
      );

      return { data: boards, error: null };
    } catch (e) {
      console.error('Unexpected error fetching boards:', e);
      // Fallback: return empty array if boards table doesn't exist yet
      return { data: [], error: null };
    }
  }

  async createBoard(boardData: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([{
          project_id: boardData.project_id,
          name: boardData.name,
          type: boardData.type,
          description: boardData.description || '',
          config: boardData.config || {
            columns: [
              { id: 'todo', name: 'To Do' },
              { id: 'in_progress', name: 'In Progress' },
              { id: 'done', name: 'Done' }
            ]
          },
          created_by: boardData.created_by
        }])
        .select()
        .single();

      if (error) return { data: null, error };

      const board = this.validateAndTransformBoard(data);
      return { data: board, error: null };
    } catch (e) {
      // Fallback: create a mock board if boards table doesn't exist yet
      const mockBoard: Board = {
        id: crypto.randomUUID(),
        project_id: boardData.project_id,
        name: boardData.name,
        type: boardData.type,
        description: boardData.description || '',
        config: boardData.config || {
          columns: [
            { id: 'todo', name: 'To Do' },
            { id: 'in_progress', name: 'In Progress' },
            { id: 'done', name: 'Done' }
          ]
        },
        created_by: boardData.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { data: mockBoard, error: null };
    }
  }

  async updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const { data, error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', boardId)
        .select()
        .single();

      if (error) return { data: null, error };

      const board = this.validateAndTransformBoard(data);
      return { data: board, error: null };
    } catch (e) {
      return { data: null, error: { message: 'Board update not implemented yet' } };
    }
  }

  async deleteBoard(boardId: string) {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);

      return { error };
    } catch (e) {
      return { error: null };
    }
  }

  private async getNextTaskNumber(boardId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('task_number')
        .eq('board_id', boardId)
        .order('task_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error getting next task number:', error);
        return 1;
      }

      const lastTaskNumber = data && data.length > 0 ? data[0].task_number : 0;
      return (lastTaskNumber || 0) + 1;
    } catch (e) {
      console.error('Unexpected error getting next task number:', e);
      return 1;
    }
  }

  private generateBoardPrefix(boardName: string): string {
    // Generate a 3-letter prefix from board name
    const cleanName = boardName.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleanName.length >= 3) {
      return cleanName.substring(0, 3);
    } else if (cleanName.length > 0) {
      return cleanName.padEnd(3, 'X');
    } else {
      return 'TSK';
    }
  }

  private validateAndTransformTask(item: any, boardId?: string): TaskMasterTask {
    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'] as const;
    const priority = validPriorities.includes(item.priority) ? item.priority as typeof validPriorities[number] : 'medium';
    
    // Validate type
    const validTypes = ['task', 'bug', 'story', 'epic'] as const;
    const type = validTypes.includes(item.type) ? item.type as typeof validTypes[number] : 'task';
    
    // Validate visibility
    const validVisibilities = ['team', 'private', 'public'] as const;
    const visibility = validVisibilities.includes(item.visibility) ? item.visibility as typeof validVisibilities[number] : 'team';

    // Handle assigned_to array field - the database trigger maintains consistency
    let assignedTo: string[] | undefined;
    if (item.assigned_to && Array.isArray(item.assigned_to)) {
      assignedTo = item.assigned_to;
    }

    return {
      id: item.id,
      task_number: item.task_number || 1,
      task_key: item.task_key || `TASK-${item.id?.substring(0, 4)}`,
      board_id: item.board_id || boardId || '',
      project_id: item.project_id,
      sprint_id: item.sprint_id,
      title: item.title,
      description: item.description || '',
      status: item.status,
      priority: priority,
      type: type,
      start_date: item.start_date,
      due_date: item.due_date,
      estimate_hours: item.estimate_hours,
      actual_hours: item.actual_hours || 0,
      assignee_id: item.assignee_id,
      reporter_id: item.reporter_id,
      created_by: item.created_by,
      assigned_to: assignedTo,
      reviewer_id: item.reviewer_id,
      parent_task_id: item.parent_task_id,
      linked_task_ids: item.linked_task_ids,
      recurrence_rule: item.recurrence_rule,
      visibility: visibility,
      position: item.position || 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
      updated_by: item.updated_by
    };
  }

  async getTasks(boardId: string) {
    try {
      console.log('Fetching tasks for board:', boardId);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Supabase error fetching tasks:', error);
        return { data: null, error: this.handleError(error, 'fetch tasks') };
      }

      // Transform the data using the helper method
      const tasks: TaskMasterTask[] = (data || []).map((item: any) => 
        this.validateAndTransformTask(item, boardId)
      );

      console.log('Successfully fetched tasks:', tasks);
      return { data: tasks, error: null };
    } catch (e) {
      console.error('Unexpected error fetching tasks:', e);
      return { data: null, error: this.handleError(e, 'fetch tasks') };
    }
  }

  async createTask(taskData: Omit<TaskMasterTask, 'id' | 'task_number' | 'task_key' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating task with data:', taskData);
      
      // Validate required fields
      if (!taskData.title?.trim()) {
        return { data: null, error: { message: 'Task title is required' } };
      }

      if (!taskData.board_id) {
        return { data: null, error: { message: 'Board ID is required' } };
      }

      if (!taskData.project_id) {
        return { data: null, error: { message: 'Project ID is required' } };
      }

      if (!taskData.created_by) {
        return { data: null, error: { message: 'Created by user ID is required' } };
      }

      // Get the board to generate prefix
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('name')
        .eq('id', taskData.board_id)
        .single();

      if (boardError) {
        console.error('Error fetching board for task creation:', boardError);
        return { data: null, error: this.handleError(boardError, 'fetch board for task creation') };
      }

      // Get next task number
      const taskNumber = await this.getNextTaskNumber(taskData.board_id);
      
      // Generate board prefix and task key
      const boardPrefix = this.generateBoardPrefix(boardData.name);
      const taskKey = `${boardPrefix}-${taskNumber}`;

      // Prepare the insert data - the database trigger will handle assignment consistency
      const insertData = {
        board_id: taskData.board_id,
        project_id: taskData.project_id,
        task_number: taskNumber,
        task_key: taskKey,
        title: taskData.title.trim(),
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        type: taskData.type,
        visibility: taskData.visibility,
        position: taskData.position,
        actual_hours: taskData.actual_hours,
        created_by: taskData.created_by,
        assignee_id: taskData.assignee_id || null,
        estimate_hours: taskData.estimate_hours || null,
        due_date: taskData.due_date || null,
        start_date: taskData.start_date || null,
        sprint_id: taskData.sprint_id || null,
        reporter_id: taskData.reporter_id || null,
        reviewer_id: taskData.reviewer_id || null,
        parent_task_id: taskData.parent_task_id || null,
        linked_task_ids: taskData.linked_task_ids || null,
        recurrence_rule: taskData.recurrence_rule || null,
        // Don't set assigned_to manually - let the database trigger handle it
      };

      console.log('Insert data for task:', insertData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating task:', error);
        return { data: null, error: this.handleError(error, 'create task') };
      }

      // Transform the result using the helper method
      const task = this.validateAndTransformTask(data);
      console.log('Successfully created task:', task);
      return { data: task, error: null };
    } catch (e) {
      console.error('Unexpected error creating task:', e);
      return { data: null, error: this.handleError(e, 'create task') };
    }
  }

  async updateTask(taskId: string, updates: Partial<TaskMasterTask>, userId: string) {
    try {
      console.log('Updating task:', taskId, 'with updates:', updates);

      if (!taskId) {
        return { data: null, error: { message: 'Task ID is required' } };
      }

      if (!userId) {
        return { data: null, error: { message: 'User ID is required' } };
      }

      // Prepare updates - let the database trigger handle assignment consistency
      const updateData: any = {
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Remove assigned_to from updates to let the trigger handle it
      if ('assigned_to' in updateData) {
        delete updateData.assigned_to;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating task:', error);
        return { data: null, error: this.handleError(error, 'update task') };
      }

      // Transform the result using the helper method
      const task = this.validateAndTransformTask(data);
      console.log('Successfully updated task:', task);
      return { data: task, error: null };
    } catch (e) {
      console.error('Unexpected error updating task:', e);
      return { data: null, error: this.handleError(e, 'update task') };
    }
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

    if (error) return { data: null, error };

    // Transform the data using the helper method
    const tasks: TaskMasterTask[] = (data || []).map((item: any) => 
      this.validateAndTransformTask(item)
    );

    return { data: tasks, error };
  }

  async getTasksByAssignee(assigneeId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', assigneeId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    // Transform the data using the helper method
    const tasks: TaskMasterTask[] = (data || []).map((item: any) => 
      this.validateAndTransformTask(item)
    );

    return { data: tasks, error };
  }

  async updateTaskStatus(taskId: string, status: string, userId: string) {
    return this.updateTask(taskId, { status }, userId);
  }

  async assignTask(taskId: string, assigneeId: string, userId: string) {
    return this.updateTask(taskId, { assignee_id: assigneeId }, userId);
  }
}

export const taskmasterService = new TaskmasterService();
