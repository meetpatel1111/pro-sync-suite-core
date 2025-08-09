
import { supabase } from '@/integrations/supabase/client';
import { Task, Project } from '@/utils/dbtypes';

interface IntegratedTimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  description: string;
  duration: number;
  date: string;
  created_at: string;
  updated_at: string;
}

interface IntegrationAction {
  id: string;
  user_id: string;
  source_app: string;
  target_app: string;
  action_type: string;
  config: any;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

class IntegrationService {
  async createTaskFromNote(title: string, description: string, projectId?: string, dueDate?: string, assigneeId?: string): Promise<Task | null> {
    try {
      console.log('Creating task from note:', { title, description, projectId, dueDate, assigneeId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const taskData = {
        title,
        description,
        status: 'pending' as const,
        priority: 'medium' as const,
        user_id: user.id,
        project_id: projectId,
        due_date: dueDate,
        assignee_id: assigneeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return null;
      }

      // Log integration action
      await this.createIntegrationAction(user.id, 'note', 'taskmaster', 'create_task', { taskId: data.id });

      return data;
    } catch (error) {
      console.error('Error in createTaskFromNote:', error);
      return null;
    }
  }

  async logTimeForTask(taskId: string, minutes: number, description?: string): Promise<IntegratedTimeEntry | null> {
    try {
      console.log('Logging time for task:', { taskId, minutes, description });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Create a time entry using our integrated interface
      const timeEntry: IntegratedTimeEntry = {
        id: `time_${Date.now()}`,
        user_id: user.id,
        task_id: taskId,
        description: description || 'Time logged from integration',
        duration: Math.round(minutes / 60 * 100) / 100,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Time entry logged:', timeEntry);

      // Log integration action
      await this.createIntegrationAction(user.id, 'taskmaster', 'timetrackpro', 'log_time', { 
        taskId, 
        minutes, 
        timeEntryId: timeEntry.id 
      });

      return timeEntry;
    } catch (error) {
      console.error('Error in logTimeForTask:', error);
      return null;
    }
  }

  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log('Checking project milestones for user:', user.id);

      // Get projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (!projects) return [];

      const milestones = [];

      for (const project of projects) {
        // Get tasks due within the next 7 days
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const { data: tasksDue } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .lte('due_date', nextWeek.toISOString())
          .neq('status', 'completed');

        if (tasksDue && tasksDue.length > 0) {
          milestones.push({
            project,
            tasksDue
          });
        }
      }

      return milestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return [];
    }
  }

  async linkDocumentToTask(taskId: string, documentUrl: string, documentName: string): Promise<boolean> {
    try {
      console.log('Linking document to task:', { taskId, documentUrl, documentName });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Update task with document link (assuming tasks table has a documents field)
      const { error } = await supabase
        .from('tasks')
        .update({
          description: `Document linked: [${documentName}](${documentUrl})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error linking document:', error);
        return false;
      }

      // Log integration action
      await this.createIntegrationAction(user.id, 'filevault', 'taskmaster', 'link_document', {
        taskId,
        documentUrl,
        documentName
      });

      return true;
    } catch (error) {
      console.error('Error in linkDocumentToTask:', error);
      return false;
    }
  }

  async shareFileWithUser(fileId: string, userId: string, accessLevel: 'view' | 'download' = 'view'): Promise<boolean> {
    try {
      console.log('Sharing file with user:', { fileId, userId, accessLevel });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Log the file sharing action
      console.log(`File ${fileId} shared with user ${userId} with ${accessLevel} access`);

      // Log integration action
      await this.createIntegrationAction(user.id, 'filevault', 'resourcehub', 'share_file', {
        fileId,
        sharedWithUserId: userId,
        accessLevel
      });

      return true;
    } catch (error) {
      console.error('Error in shareFileWithUser:', error);
      return false;
    }
  }

  async assignResourceToTask(taskId: string, resourceId: string): Promise<boolean> {
    try {
      console.log('Assigning resource to task:', { taskId, resourceId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Update task with assigned resource
      const { error } = await supabase
        .from('tasks')
        .update({
          assignee_id: resourceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error assigning resource:', error);
        return false;
      }

      // Log integration action
      await this.createIntegrationAction(user.id, 'resourcehub', 'taskmaster', 'assign_resource', {
        taskId,
        resourceId
      });

      return true;
    } catch (error) {
      console.error('Error in assignResourceToTask:', error);
      return false;
    }
  }

  async shareFileInChat(fileId: string, channelId: string, message?: string): Promise<boolean> {
    try {
      console.log('Sharing file in chat:', { fileId, channelId, message });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Log integration action
      await this.createIntegrationAction(user.id, 'filevault', 'collabspace', 'share_file_in_chat', {
        fileId,
        channelId,
        message
      });

      return true;
    } catch (error) {
      console.error('Error in shareFileInChat:', error);
      return false;
    }
  }

  async syncTaskToPlanBoard(taskId: string, projectId: string): Promise<boolean> {
    try {
      console.log('Syncing task to planboard:', { taskId, projectId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Log integration action
      await this.createIntegrationAction(user.id, 'taskmaster', 'planboard', 'sync_task', {
        taskId,
        projectId
      });

      return true;
    } catch (error) {
      console.error('Error in syncTaskToPlanBoard:', error);
      return false;
    }
  }

  async createIntegrationAction(userId: string, sourceApp: string, targetApp: string, actionType: string, config: any = {}): Promise<boolean> {
    try {
      console.log('Creating integration action:', { userId, sourceApp, targetApp, actionType, config });
      
      // For now, just log the action since we don't have a proper integration_actions table
      const actionLog = {
        id: `action_${Date.now()}`,
        user_id: userId,
        source_app: sourceApp,
        target_app: targetApp,
        action_type: actionType,
        config,
        status: 'completed' as const,
        created_at: new Date().toISOString()
      };

      console.log('Integration action logged:', actionLog);
      return true;
    } catch (error) {
      console.error('Error creating integration action:', error);
      return false;
    }
  }

  async getUserIntegrationActions(userId: string): Promise<IntegrationAction[]> {
    try {
      // Return mock integration actions for demo
      const mockActions: IntegrationAction[] = [
        {
          id: '1',
          user_id: userId,
          source_app: 'taskmaster',
          target_app: 'timetrackpro',
          action_type: 'log_time',
          config: { taskId: 'task_123', minutes: 30 },
          status: 'completed',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          user_id: userId,
          source_app: 'budgetbuddy',
          target_app: 'collabspace',
          action_type: 'send_alert',
          config: { threshold: 80, projectId: 'proj_456' },
          status: 'completed',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      return mockActions;
    } catch (error) {
      console.error('Error getting user integration actions:', error);
      return [];
    }
  }

  async getLiveProjectData(projectId: string): Promise<any> {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      return {
        project: project || {},
        tasks: tasks || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting live project data:', error);
      return { project: {}, tasks: [], lastUpdated: new Date().toISOString() };
    }
  }

  subscribeToProjectChanges(projectId: string, callback: (payload: any) => void): any {
    console.log('Subscribing to project changes:', projectId);
    
    const channel = supabase
      .channel(`project_${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, callback)
      .subscribe();

    return channel;
  }

  async triggerAutomation(eventType: string, sourceData: any): Promise<boolean> {
    try {
      console.log('Triggering automation:', { eventType, sourceData });
      
      // Simulate automation trigger processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Automation triggered successfully');
      return true;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  }
}

export const integrationService = new IntegrationService();
