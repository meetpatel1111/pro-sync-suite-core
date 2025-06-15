
import { supabase } from '@/integrations/supabase/client';
import { Task, TimeEntry, Project } from '@/utils/dbtypes';
import { v4 as uuidv4 } from 'uuid';

// Enhanced integration service to handle workflows between all ProSync Suite apps
export const integrationService = {
  // TaskMaster integrations
  async createTaskFromNote(
    title: string, 
    description: string, 
    projectId?: string,
    dueDate?: string,
    assigneeId?: string
  ): Promise<Task | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          status: 'todo',
          priority: 'medium',
          project_id: projectId,
          due_date: dueDate,
          assigned_to: assigneeId ? [assigneeId] : null,
          created_by: userData.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Trigger integrations
        await this.triggerTaskCreatedIntegrations(data);
        
        return {
          id: data.id,
          title: data.title,
          description: data.description || '',
          status: data.status as 'todo' | 'inProgress' | 'review' | 'done',
          priority: data.priority as 'low' | 'medium' | 'high',
          start_date: data.start_date,
          due_date: data.due_date,
          assigned_to: data.assigned_to || [],
          project_id: data.project_id,
          created_by: data.created_by,
          parent_task_id: data.parent_task_id,
          reviewer_id: data.reviewer_id,
          recurrence_rule: data.recurrence_rule,
          visibility: data.visibility,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task from note:', error);
      return null;
    }
  },

  // TimeTrackPro integrations
  async logTimeForTask(
    taskId: string, 
    minutes: number, 
    description?: string
  ): Promise<TimeEntry | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
        
      if (taskError) throw taskError;
      if (!taskData) return null;
      
      const projectId = taskData.project_id;
      if (!projectId) {
        console.error('Task has no associated project');
        return null;
      }
      
      const currentDate = new Date().toISOString();
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          description: description || `Work on task: ${taskData.title}`,
          project: projectId,
          time_spent: minutes,
          date: currentDate,
          user_id: userData.user.id,
          manual: true,
          task_id: taskId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Trigger integrations
        await this.triggerTimeLoggedIntegrations(data, taskData);
        
        return {
          id: data.id,
          description: data.description,
          project: data.project,
          time_spent: data.time_spent,
          date: data.date,
          user_id: data.user_id,
          manual: data.manual,
          task_id: data.task_id,
          start_time: data.date,
          created_at: data.date
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error logging time for task:', error);
      return null;
    }
  },

  // CollabSpace integrations
  async createTaskFromChatMessage(
    messageContent: string,
    channelId: string,
    projectId?: string
  ): Promise<Task | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // Extract task info from message
      const taskTitle = messageContent.split('\n')[0].replace(/^(task:|todo:|create:)/i, '').trim();
      const taskDescription = messageContent.split('\n').slice(1).join('\n').trim();

      const task = await this.createTaskFromNote(
        taskTitle || 'Task from chat',
        taskDescription || messageContent,
        projectId
      );

      if (task) {
        // Notify CollabSpace about new task
        await this.notifyCollabSpaceTaskCreated(task, channelId);
      }

      return task;
    } catch (error) {
      console.error('Error creating task from chat:', error);
      return null;
    }
  },

  async shareFileInChat(
    fileId: string,
    channelId: string,
    message?: string
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Get file info
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError || !fileData) return false;

      // Send message with file attachment
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: userData.user.id,
          content: message || `Shared file: ${fileData.name}`,
          type: 'file',
          file_url: fileData.storage_path
        });

      return !messageError;
    } catch (error) {
      console.error('Error sharing file in chat:', error);
      return false;
    }
  },

  async notifyCollabSpaceTaskCreated(task: Task, channelId: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: userData.user.id,
          content: `📋 New task created: **${task.title}**\n${task.description || 'No description'}`,
          type: 'system',
          is_system_message: true
        });

      return !error;
    } catch (error) {
      console.error('Error notifying CollabSpace:', error);
      return false;
    }
  },

  // FileVault integrations
  async shareFileWithUser(
    fileId: string,
    userId: string,
    accessLevel: 'view' | 'download' = 'view'
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('file_shares')
        .insert({
          file_id: fileId,
          shared_with: userId,
          shared_by: userData.user.id,
          access_level: accessLevel
        });

      return !error;
    } catch (error) {
      console.error('Error sharing file with user:', error);
      return false;
    }
  },

  async linkFileToTask(
    fileId: string,
    taskId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('files')
        .update({ task_id: taskId })
        .eq('id', fileId);

      if (!error) {
        await this.triggerAutomation('file_linked', {
          file_id: fileId,
          task_id: taskId
        });
      }

      return !error;
    } catch (error) {
      console.error('Error linking file to task:', error);
      return false;
    }
  },

  // ResourceHub integrations
  async assignResourceToTask(
    taskId: string,
    resourceId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_resources')
        .insert({
          task_id: taskId,
          resource_id: resourceId
        });

      if (!error) {
        await this.checkResourceUtilization(resourceId);
        // Update task assignment
        await this.updateTaskAssignment(taskId, resourceId);
      }

      return !error;
    } catch (error) {
      console.error('Error assigning resource to task:', error);
      return false;
    }
  },

  async updateTaskAssignment(taskId: string, resourceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: [resourceId] })
        .eq('id', taskId);

      return !error;
    } catch (error) {
      console.error('Error updating task assignment:', error);
      return false;
    }
  },

  async checkResourceUtilization(resourceId: string): Promise<void> {
    try {
      const { data: allocations } = await supabase
        .from('allocations')
        .select('*')
        .eq('resource_id', resourceId);

      if (allocations) {
        const totalAllocation = allocations.reduce((sum, alloc) => sum + (alloc.percent || 0), 0);
        
        if (totalAllocation > 100) {
          await this.triggerAutomation('resource_overallocated', {
            resource_id: resourceId,
            allocation_percent: totalAllocation
          });
        }
      }
    } catch (error) {
      console.error('Error checking resource utilization:', error);
    }
  },

  // PlanBoard integrations
  async syncTaskToPlanBoard(taskId: string): Promise<boolean> {
    try {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*, projects(*)')
        .eq('id', taskId)
        .single();

      if (taskData && taskData.project_id) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return false;

        // Update project view preferences to reflect changes
        await supabase
          .from('project_views')
          .upsert({
            project_id: taskData.project_id,
            user_id: userData.user.id,
            updated_at: new Date().toISOString()
          });

        // Trigger PlanBoard refresh
        await this.triggerAutomation('task_updated', {
          task_id: taskId,
          project_id: taskData.project_id,
          action: 'sync_planboard'
        });
      }

      return true;
    } catch (error) {
      console.error('Error syncing task to PlanBoard:', error);
      return false;
    }
  },

  // Enhanced automation system
  async triggerAutomation(eventType: string, sourceData: any): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Log automation event
      const { error } = await supabase
        .from('automation_events')
        .insert({
          event_type: eventType,
          source_module: 'integration_service',
          target_module: 'auto_action',
          source_id: sourceData.id || sourceData.task_id || sourceData.file_id,
          payload: sourceData,
          status: 'triggered'
        });

      return !error;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  },

  // Real-time method to get live project data
  async getLiveProjectData(projectId: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // Get project with tasks, time entries, and expenses
      const [projectResponse, tasksResponse, timeEntriesResponse, expensesResponse] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('*').eq('project_id', projectId),
        supabase.from('time_entries').select('*').eq('project_id', projectId).eq('user_id', userData.user.id),
        supabase.from('expenses').select('*').eq('project_id', projectId).eq('user_id', userData.user.id)
      ]);

      if (projectResponse.error) throw projectResponse.error;

      return {
        project: projectResponse.data,
        tasks: tasksResponse.data || [],
        timeEntries: timeEntriesResponse.data || [],
        expenses: expensesResponse.data || []
      };
    } catch (error) {
      console.error('Error getting live project data:', error);
      return null;
    }
  },

  subscribeToProjectChanges(projectId: string, callback: (data: any) => void) {
    const channel = supabase
      .channel(`project_${projectId}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe();

    return channel;
  },

  async getUserIntegrationActions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user integration actions:', error);
      return [];
    }
  },

  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) throw projectsError;
      if (!projectsData || projectsData.length === 0) return [];
      
      const projects = projectsData as Project[];
      const result: { project: Project, tasksDue: Task[] }[] = [];
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      for (const project of projects) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .lte('due_date', sevenDaysFromNow.toISOString())
          .neq('status', 'done');
          
        if (tasksError) {
          console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
          continue;
        }
        
        if (tasksData && tasksData.length > 0) {
          const mappedTasks: Task[] = tasksData.map((task): Task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            start_date: task.start_date,
            due_date: task.due_date,
            assigned_to: task.assigned_to || [],
            project_id: task.project_id,
            created_by: task.created_by,
            parent_task_id: task.parent_task_id,
            reviewer_id: task.reviewer_id,
            recurrence_rule: task.recurrence_rule,
            visibility: task.visibility,
            created_at: task.created_at,
            updated_at: task.updated_at,
          }));
          
          result.push({
            project,
            tasksDue: mappedTasks
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error checking project milestones:', error);
      return [];
    }
  },

  async linkDocumentToTask(
    taskId: string, 
    documentUrl: string, 
    documentName: string
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('files')
        .insert({
          name: documentName,
          storage_path: documentUrl,
          file_type: 'link',
          size_bytes: 0,
          is_public: false,
          is_archived: false,
          task_id: taskId,
          user_id: userData.user.id
        });
        
      if (error) throw error;
      
      // Notify other integrations
      await this.triggerAutomation('document_linked', {
        task_id: taskId,
        document_name: documentName,
        document_url: documentUrl
      });
      
      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  },

  async createIntegrationAction(
    sourceApp: string, 
    targetApp: string, 
    actionType: string, 
    config: any = {}
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      
      const { error } = await supabase
        .from('integration_actions')
        .insert({
          source_app: sourceApp,
          target_app: targetApp,
          action_type: actionType,
          config,
          user_id: userData.user.id
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating integration action:', error);
      return false;
    }
  },

  // Integration event handlers
  async triggerTaskCreatedIntegrations(task: any): Promise<void> {
    try {
      // Sync to PlanBoard
      await this.syncTaskToPlanBoard(task.id);
      
      // Create CollabSpace notification if assigned
      if (task.assigned_to && task.assigned_to.length > 0) {
        await this.triggerAutomation('task_assigned', task);
      }
    } catch (error) {
      console.error('Error triggering task created integrations:', error);
    }
  },

  async triggerTimeLoggedIntegrations(timeEntry: any, task: any): Promise<void> {
    try {
      // Sync to PlanBoard for timeline updates
      await this.syncTaskToPlanBoard(task.id);

      // Check resource utilization
      await this.checkResourceUtilization(timeEntry.user_id);
    } catch (error) {
      console.error('Error triggering time logged integrations:', error);
    }
  }
};
