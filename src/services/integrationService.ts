
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
        status: 'todo' as const,
        priority: 'medium' as const,
        created_by: user.id,
        project_id: projectId,
        due_date: dueDate,
        assignee_id: assigneeId,
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

      // Log integration action in database
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

      // Create actual time entry in the database
      const timeEntryData = {
        user_id: user.id,
        task_id: taskId,
        description: description || 'Time logged from integration',
        time_spent: Math.round(minutes / 60 * 100) / 100, // Convert minutes to hours
        date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        manual: true,
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating time entry:', error);
        return null;
      }

      // Log integration action
      await this.createIntegrationAction(user.id, 'taskmaster', 'timetrackpro', 'log_time', { 
        taskId, 
        minutes, 
        timeEntryId: data.id 
      });

      // Return in IntegratedTimeEntry format
      return {
        id: data.id,
        user_id: data.user_id,
        task_id: data.task_id || taskId,
        description: data.description,
        duration: data.time_spent,
        date: data.date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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

      // Get actual projects from database
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return [];
      }

      if (!projects) return [];

      const milestones = [];

      for (const project of projects) {
        // Get tasks due within the next 7 days
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const { data: tasksDue, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .lte('due_date', nextWeek.toISOString())
          .neq('status', 'done');

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          continue;
        }

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

      // Update task with document link in database
      const { error } = await supabase
        .from('tasks')
        .update({
          description: `Document linked: [${documentName}](${documentUrl})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('created_by', user.id);

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

      // Create actual file permission in database
      const { error } = await supabase
        .from('file_permissions')
        .insert({
          file_id: fileId,
          user_id: userId,
          permission: accessLevel,
          granted_by: user.id
        });

      if (error) {
        console.error('Error sharing file:', error);
        return false;
      }

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

      // Update task with assigned resource in database
      const { error } = await supabase
        .from('tasks')
        .update({
          assignee_id: resourceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

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

      // Create actual chat message with file attachment
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          content: message || `File shared: ${fileId}`,
          channel_id: channelId,
          file_url: fileId, // Assuming fileId contains file reference
          message_type: 'file'
        });

      if (error) {
        console.error('Error sharing file in chat:', error);
        return false;
      }

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

      // Get task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        console.error('Error fetching task:', taskError);
        return false;
      }

      // Create milestone or update project timeline
      const { error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          task_id: taskId,
          created_by: user.id
        });

      if (error) {
        console.error('Error creating milestone:', error);
        return false;
      }

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
      
      // Store actual integration action in database
      const { error } = await supabase
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
          last_executed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating integration action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating integration action:', error);
      return false;
    }
  }

  async getUserIntegrationActions(userId: string): Promise<IntegrationAction[]> {
    try {
      // Get real integration actions from database
      const { data, error } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integration actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user integration actions:', error);
      return [];
    }
  }

  async getLiveProjectData(projectId: string): Promise<any> {
    try {
      // Get real project data from database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        return { project: {}, tasks: [], lastUpdated: new Date().toISOString() };
      }

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get matching automation workflows from database
      const { data: workflows, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching workflows:', error);
        return false;
      }

      let executed = false;
      
      // Execute matching workflows
      for (const workflow of workflows || []) {
        try {
          // Check if workflow trigger matches
          const triggerConfig = workflow.trigger_config as any;
          if (triggerConfig && triggerConfig.event === eventType) {
            // Execute workflow actions
            const actionsConfig = workflow.actions_config as any[];
            
            for (const action of actionsConfig || []) {
              await this.executeWorkflowAction(action, sourceData);
            }
            
            // Update execution count
            await supabase
              .from('automation_workflows')
              .update({ 
                execution_count: workflow.execution_count + 1,
                last_executed_at: new Date().toISOString()
              })
              .eq('id', workflow.id);
              
            executed = true;
          }
        } catch (actionError) {
          console.error('Error executing workflow action:', actionError);
        }
      }

      return executed;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  }

  private async executeWorkflowAction(action: any, sourceData: any): Promise<void> {
    const { app, action: actionType, config } = action;
    
    console.log('Executing workflow action:', { app, actionType, config, sourceData });

    switch (app) {
      case 'TimeTrackPro':
        if (actionType === 'log_time' && sourceData.task_id) {
          await this.logTimeForTask(sourceData.task_id, config.minutes || 30);
        }
        break;
      case 'CollabSpace':
        if (actionType === 'send_notification') {
          // Create notification in database
          await supabase.from('notifications').insert({
            user_id: sourceData.user_id,
            title: config.title || 'Automation Triggered',
            message: config.message || 'An automation workflow has been executed',
            type: 'info'
          });
        }
        break;
      case 'PlanBoard':
        if (actionType === 'sync_task' && sourceData.task_id) {
          await this.syncTaskToPlanBoard(sourceData.task_id, sourceData.project_id);
        }
        break;
      default:
        console.log('Unknown app for workflow action:', app);
    }
  }
}

export const integrationService = new IntegrationService();
