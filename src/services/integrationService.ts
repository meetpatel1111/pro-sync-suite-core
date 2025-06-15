import { supabase } from '@/integrations/supabase/client';
import { Task, TimeEntry, Project } from '@/utils/dbtypes';
import { v4 as uuidv4 } from 'uuid';

// Integration service to handle workflows between different apps
export const integrationService = {
  // Method to create a task from a meeting note or chat message
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
  
  // Method to log time against a task
  async logTimeForTask(
    taskId: string, 
    minutes: number, 
    description?: string
  ): Promise<TimeEntry | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      // Get task details to link the time entry to the correct project
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
      
      // Create time entry
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
  
  // Method to check project milestones and send notifications
  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      
      // Get all projects for the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userData.user.id);
        
      if (projectsError) throw projectsError;
      
      if (!projectsData || projectsData.length === 0) return [];
      
      const projects = projectsData as Project[];
      const result: { project: Project, tasksDue: Task[] }[] = [];
      
      // For each project, check for tasks due soon (within 7 days)
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
  
  // Method to link documents to tasks
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
      
      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  },
  
  // Method to create integration actions
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

  // Real-time method to get live project data
  async getLiveProjectData(projectId: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // Get project with tasks, time entries, and expenses
      const [projectResponse, tasksResponse, timeEntriesResponse, expensesResponse] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).eq('user_id', userData.user.id).single(),
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

  // Real-time method to subscribe to project changes
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

  // Real-time method to get integration actions for a user
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

  // Real-time method to trigger automation based on events
  async triggerAutomation(eventType: string, sourceData: any) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Get applicable automation rules
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_event', eventType)
        .eq('enabled', true);

      if (error) throw error;

      // Process each rule
      for (const rule of rules || []) {
        // Log automation event with correct field names that match the database schema
        await supabase.from('automation_events').insert({
          event_type: eventType,
          source_module: rule.source_module,
          target_module: rule.action_module,
          source_id: sourceData.id,
          payload: sourceData,
          status: 'triggered'
        });

        // Execute the automation based on action type
        switch (rule.action_type) {
          case 'create_task':
            await this.createTaskFromNote(
              sourceData.title || 'Automated Task',
              sourceData.description || 'Task created automatically',
              sourceData.project_id
            );
            break;
          case 'log_time':
            if (sourceData.task_id && sourceData.duration) {
              await this.logTimeForTask(
                sourceData.task_id,
                sourceData.duration,
                'Time logged automatically'
              );
            }
            break;
          // Add more automation actions as needed
        }
      }

      return true;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  }
};
