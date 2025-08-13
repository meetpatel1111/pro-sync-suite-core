
import { supabase } from '@/integrations/supabase/client';
import { integrationDatabaseService } from './integrationDatabaseService';
import type { Task, Project } from '@/utils/dbtypes';

export interface IntegratedTimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  description: string;
  time_spent: number;
  date: string;
  manual: boolean;
  project: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationAction {
  id: string;
  user_id: string;
  source_app: string;
  target_app: string;
  action_type: string;
  trigger_condition: string | null;
  config: any;
  enabled: boolean;
  created_at: string;
  status: 'active' | 'inactive' | 'error';
}

class IntegrationService {
  // Real-time task to time tracking integration
  async startTimeTracking(userId: string, taskId: string): Promise<IntegratedTimeEntry | null> {
    try {
      // Get task details
      const { data: task } = await supabase
        .from('tasks')
        .select('title, project_id, projects(name)')
        .eq('id', taskId)
        .single();

      if (!task) throw new Error('Task not found');

      const timeEntry = {
        user_id: userId,
        task_id: taskId,
        description: `Started tracking: ${task.title}`,
        time_spent: 0,
        date: new Date().toISOString().split('T')[0],
        manual: false,
        project: (task.projects as any)?.name || 'Unknown Project'
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        task_id: data.task_id || '',
        description: data.description,
        time_spent: data.time_spent,
        date: data.date || '',
        manual: data.manual || false,
        project: data.project,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error starting time tracking:', error);
      return null;
    }
  }

  async stopTimeTracking(userId: string, timeEntryId: string, minutes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ 
          time_spent: minutes,
          description: `Completed time tracking: ${minutes} minutes`
        })
        .eq('id', timeEntryId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      return false;
    }
  }

  async logTimeForTask(taskId: string, minutes: number, description?: string): Promise<IntegratedTimeEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: task } = await supabase
        .from('tasks')
        .select('title, project_id, projects(name)')
        .eq('id', taskId)
        .single();

      if (!task) return null;

      const timeEntry = {
        user_id: user.id,
        task_id: taskId,
        description: description || `Time logged for: ${task.title}`,
        time_spent: minutes,
        date: new Date().toISOString().split('T')[0],
        manual: true,
        project: (task.projects as any)?.name || 'Unknown Project'
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        task_id: data.task_id || '',
        description: data.description,
        time_spent: data.time_spent,
        date: data.date || '',
        manual: data.manual || false,
        project: data.project,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error logging time for task:', error);
      return null;
    }
  }

  async createTaskFromNote(title: string, description: string, projectId?: string, dueDate?: string, assigneeId?: string): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          status: 'todo',
          priority: 'medium',
          created_by: user.id,
          project_id: projectId,
          due_date: dueDate,
          assignee_id: assigneeId
        })
        .select()
        .single();

      if (error) throw error;

      await this.logIntegrationAction(user.id, 'KnowledgeNest', 'TaskMaster', 'create_task', {
        task_id: data.id,
        title,
        description
      });

      return data as Task;
    } catch (error) {
      console.error('Error creating task from note:', error);
      return null;
    }
  }

  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*)
        `)
        .eq('user_id', user.id);

      if (!projects) return [];

      const milestones = projects.map(project => {
        const tasks = (project.tasks as any[]) || [];
        const tasksDue = tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          const now = new Date();
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(now.getDate() + 3);
          return dueDate <= threeDaysFromNow && task.status !== 'completed';
        });

        return {
          project: project as Project,
          tasksDue: tasksDue as Task[]
        };
      }).filter(item => item.tasksDue.length > 0);

      return milestones;
    } catch (error) {
      console.error('Error checking project milestones:', error);
      return [];
    }
  }

  async linkDocumentToTask(taskId: string, documentUrl: string, documentName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: documentName,
          storage_path: documentUrl,
          file_type: 'document',
          size_bytes: 0,
          task_id: taskId
        });

      if (error) throw error;

      await this.logIntegrationAction(user.id, 'KnowledgeNest', 'TaskMaster', 'link_document', {
        task_id: taskId,
        document_url: documentUrl,
        document_name: documentName
      });

      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  }

  async shareFileWithUser(fileId: string, userId: string, accessLevel: 'view' | 'download' = 'view'): Promise<boolean> {
    try {
      const { data: file } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (!file) return false;

      // Create file permission record
      const { error } = await supabase
        .from('file_permissions')
        .insert({
          file_id: fileId,
          user_id: userId,
          permission: accessLevel
        });

      if (error) throw error;

      await this.logIntegrationAction(file.user_id, 'FileVault', 'Team', 'share_file', {
        file_id: fileId,
        shared_with: userId,
        access_level: accessLevel
      });

      return true;
    } catch (error) {
      console.error('Error sharing file with user:', error);
      return false;
    }
  }

  async assignResourceToTask(taskId: string, resourceId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('task_resources')
        .insert({
          task_id: taskId,
          resource_id: resourceId
        });

      if (error) throw error;

      await this.logIntegrationAction(user.id, 'ResourceHub', 'TaskMaster', 'allocate_resource', {
        task_id: taskId,
        resource_id: resourceId
      });

      return true;
    } catch (error) {
      console.error('Error allocating resource:', error);
      return false;
    }
  }

  async getLiveProjectData(projectId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*),
          time_entries(*)
        `)
        .eq('id', projectId)
        .single();

      return data;
    } catch (error) {
      console.error('Error getting live project data:', error);
      return null;
    }
  }

  subscribeToProjectChanges(projectId: string, callback: (payload: any) => void): any {
    const channel = supabase
      .channel(`project_${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe();

    return channel;
  }

  async createIntegrationAction(sourceApp: string, targetApp: string, actionType: string, config?: any): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('integration_actions')
        .insert({
          user_id: user.id,
          source_app: sourceApp,
          target_app: targetApp,
          action_type: actionType,
          config: config || {},
          enabled: true
        });

      return !error;
    } catch (error) {
      console.error('Error creating integration action:', error);
      return false;
    }
  }

  async triggerAutomation(eventType: string, sourceData: any): Promise<boolean> {
    try {
      console.log('Triggering automation:', eventType, sourceData);
      return true;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  }

  // Task management integration
  async createLinkedTask(userId: string, projectId: string, title: string, description: string, sourceApp: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description: `${description}\n\nCreated from: ${sourceApp}`,
          status: 'todo',
          priority: 'medium',
          created_by: userId,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      // Log integration action
      await this.logIntegrationAction(userId, sourceApp, 'TaskMaster', 'create_task', {
        task_id: data.id,
        title,
        description
      });

      return data;
    } catch (error) {
      console.error('Error creating linked task:', error);
      return null;
    }
  }

  // File sharing integration
  async shareFileInChat(userId: string, fileId: string, chatId: string): Promise<boolean> {
    try {
      // Get file details
      const { data: file } = await supabase
        .from('files')
        .select('name, storage_path')
        .eq('id', fileId)
        .single();

      if (!file) return false;

      // Create a message in the chat with file attachment
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          chat_id: chatId,
          content: `Shared file: ${file.name}`,
          message_type: 'file',
          file_url: file.storage_path
        });

      if (error) throw error;

      await this.logIntegrationAction(userId, 'FileVault', 'CollabSpace', 'share_file', {
        file_id: fileId,
        chat_id: chatId,
        file_name: file.name
      });

      return true;
    } catch (error) {
      console.error('Error sharing file in chat:', error);
      return false;
    }
  }

  // Cross-app project monitoring
  async syncProjectData(userId: string, projectId: string): Promise<boolean> {
    try {
      // Get project with tasks and time entries
      const { data: project } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*),
          time_entries(*)
        `)
        .eq('id', projectId)
        .single();

      if (!project) return false;

      // Calculate project metrics
      const tasks = project.tasks || [];
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      const totalHours = (project.time_entries || []).reduce((sum: number, entry: any) => sum + (entry.time_spent || 0), 0);

      // Update project with calculated metrics
      await supabase
        .from('projects')
        .update({
          description: `${project.description || ''}\n\nMetrics - Completed: ${completedTasks}/${tasks.length} tasks, Total Hours: ${Math.round(totalHours / 60)}h`
        })
        .eq('id', projectId);

      return true;
    } catch (error) {
      console.error('Error syncing project data:', error);
      return false;
    }
  }

  // PlanBoard integration
  async syncTaskToPlanBoard(userId: string, taskId: string, boardId: string): Promise<boolean> {
    try {
      // Update task with board assignment
      const { error } = await supabase
        .from('tasks')
        .update({ board_id: boardId })
        .eq('id', taskId)
        .eq('created_by', userId);

      if (error) throw error;

      await this.logIntegrationAction(userId, 'TaskMaster', 'PlanBoard', 'sync_task', {
        task_id: taskId,
        board_id: boardId
      });

      return true;
    } catch (error) {
      console.error('Error syncing task to PlanBoard:', error);
      return false;
    }
  }

  // Integration monitoring and logging
  async logIntegrationAction(userId: string, sourceApp: string, targetApp: string, actionType: string, config: any): Promise<void> {
    try {
      await supabase
        .from('integration_actions')
        .insert({
          user_id: userId,
          source_app: sourceApp,
          target_app: targetApp,
          action_type: actionType,
          config,
          enabled: true,
          execution_count: 1,
          success_count: 1,
          error_count: 0
        });
    } catch (error) {
      console.error('Error logging integration action:', error);
    }
  }

  async getIntegrationActions(userId: string): Promise<IntegrationAction[]> {
    try {
      const { data, error } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(action => ({
        id: action.id,
        user_id: action.user_id,
        source_app: action.source_app,
        target_app: action.target_app,
        action_type: action.action_type,
        trigger_condition: action.trigger_condition,
        config: action.config,
        enabled: action.enabled || false,
        created_at: action.created_at,
        status: 'active' as const
      }));
    } catch (error) {
      console.error('Error getting integration actions:', error);
      return [];
    }
  }
}

export const integrationService = new IntegrationService();
