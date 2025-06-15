
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

  // PlanBoard integrations
  async syncTaskToPlanBoard(taskId: string): Promise<boolean> {
    try {
      // Update project views when task is modified
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*, projects(*)')
        .eq('id', taskId)
        .single();

      if (taskData && taskData.project_id) {
        // Update project view preferences to reflect changes
        await supabase
          .from('project_views')
          .upsert({
            project_id: taskData.project_id,
            user_id: taskData.created_by,
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

  async updateProjectTimeline(projectId: string, timeEntries: TimeEntry[]): Promise<boolean> {
    try {
      // Calculate actual vs estimated times for timeline updates
      const totalActualTime = timeEntries.reduce((sum, entry) => sum + entry.time_spent, 0);
      
      // Update project insights
      await supabase
        .from('insights')
        .upsert({
          id: uuidv4(),
          project_id: projectId,
          type: 'timeline_update',
          data: {
            total_actual_time: totalActualTime,
            last_updated: new Date().toISOString(),
            entries_count: timeEntries.length
          }
        });

      return true;
    } catch (error) {
      console.error('Error updating project timeline:', error);
      return false;
    }
  },

  // FileVault integrations
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

  async shareFileWithClient(
    fileId: string,
    clientId: string,
    accessLevel: 'view' | 'download' = 'view'
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('file_shares')
        .insert({
          file_id: fileId,
          shared_with: clientId,
          shared_by: userData.user.id,
          access_level: accessLevel
        });

      if (!error) {
        // Notify ClientConnect
        await this.notifyClientFileShared(clientId, fileId);
      }

      return !error;
    } catch (error) {
      console.error('Error sharing file with client:', error);
      return false;
    }
  },

  // BudgetBuddy integrations
  async createExpenseFromTimeEntry(
    timeEntryId: string,
    hourlyRate: number
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { data: timeEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', timeEntryId)
        .single();

      if (!timeEntry) return false;

      const amount = (timeEntry.time_spent / 60) * hourlyRate;

      const { error } = await supabase
        .from('expenses')
        .insert({
          amount,
          description: `Time entry: ${timeEntry.description}`,
          project_id: timeEntry.project_id,
          user_id: userData.user.id,
          category_id: 'labor',
          date: timeEntry.date
        });

      if (!error) {
        // Check for budget alerts
        await this.checkBudgetAlert(timeEntry.project_id);
      }

      return !error;
    } catch (error) {
      console.error('Error creating expense from time entry:', error);
      return false;
    }
  },

  async checkBudgetAlert(projectId: string): Promise<boolean> {
    try {
      const { data: budget } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (!budget) return false;

      const utilizationPercent = (budget.spent / budget.total) * 100;

      if (utilizationPercent > 80) {
        await this.triggerAutomation('budget_alert', {
          project_id: projectId,
          utilization: utilizationPercent,
          severity: utilizationPercent > 95 ? 'critical' : 'warning'
        });

        // Notify RiskRadar about budget risk
        await this.flagBudgetRisk(projectId, utilizationPercent);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking budget alert:', error);
      return false;
    }
  },

  // InsightIQ integrations (data aggregation)
  async aggregateTaskPerformance(projectId?: string): Promise<any> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      let query = supabase.from('tasks').select('*').eq('created_by', userData.user.id);
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: tasks } = await query;
      if (!tasks) return null;

      const performance = {
        total_tasks: tasks.length,
        completed_tasks: tasks.filter(t => t.status === 'done').length,
        overdue_tasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
        completion_rate: 0,
        avg_completion_time: 0
      };

      performance.completion_rate = performance.total_tasks > 0 
        ? (performance.completed_tasks / performance.total_tasks) * 100 
        : 0;

      // Store insights
      await supabase.from('insights').insert({
        id: uuidv4(),
        project_id: projectId || null,
        type: 'task_performance',
        data: performance
      });

      return performance;
    } catch (error) {
      console.error('Error aggregating task performance:', error);
      return null;
    }
  },

  async generateProductivityReport(userId: string, period: { start: string; end: string }): Promise<any> {
    try {
      const [timeEntries, tasks] = await Promise.all([
        supabase.from('time_entries').select('*').eq('user_id', userId)
          .gte('date', period.start).lte('date', period.end),
        supabase.from('tasks').select('*').eq('created_by', userId)
          .gte('created_at', period.start).lte('created_at', period.end)
      ]);

      const report = {
        period,
        total_hours: timeEntries.data?.reduce((sum, entry) => sum + entry.time_spent, 0) || 0,
        tasks_completed: tasks.data?.filter(t => t.status === 'done').length || 0,
        avg_daily_hours: 0,
        productivity_score: 0
      };

      const daysDiff = Math.ceil((new Date(period.end).getTime() - new Date(period.start).getTime()) / (1000 * 60 * 60 * 24));
      report.avg_daily_hours = daysDiff > 0 ? (report.total_hours / 60) / daysDiff : 0;
      report.productivity_score = Math.min(100, (report.tasks_completed * 10) + (report.avg_daily_hours * 5));

      return report;
    } catch (error) {
      console.error('Error generating productivity report:', error);
      return null;
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

          // Flag risk in RiskRadar
          await this.flagResourceRisk(resourceId, totalAllocation);
        }
      }
    } catch (error) {
      console.error('Error checking resource utilization:', error);
    }
  },

  // ClientConnect integrations
  async createClientNotification(
    clientId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' = 'info'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: clientId,
          title,
          message,
          type
        });

      return !error;
    } catch (error) {
      console.error('Error creating client notification:', error);
      return false;
    }
  },

  async notifyClientFileShared(clientId: string, fileId: string): Promise<boolean> {
    try {
      const { data: fileData } = await supabase
        .from('files')
        .select('name')
        .eq('id', fileId)
        .single();

      if (fileData) {
        return await this.createClientNotification(
          clientId,
          'New File Shared',
          `A new file "${fileData.name}" has been shared with you.`,
          'info'
        );
      }

      return false;
    } catch (error) {
      console.error('Error notifying client of shared file:', error);
      return false;
    }
  },

  async generateClientReport(
    clientId: string,
    projectId: string,
    period: { start: string; end: string }
  ): Promise<any> {
    try {
      // Get project data for client
      const [tasks, timeEntries, expenses] = await Promise.all([
        supabase.from('tasks').select('*').eq('project_id', projectId),
        supabase.from('time_entries').select('*').eq('project_id', projectId)
          .gte('date', period.start).lte('date', period.end),
        supabase.from('expenses').select('*').eq('project_id', projectId)
          .gte('date', period.start).lte('date', period.end)
      ]);

      const report = {
        period,
        tasks: tasks.data || [],
        timeEntries: timeEntries.data || [],
        expenses: expenses.data || [],
        summary: {
          totalTasks: tasks.data?.length || 0,
          completedTasks: tasks.data?.filter(t => t.status === 'done').length || 0,
          totalHours: timeEntries.data?.reduce((sum, te) => sum + te.time_spent, 0) || 0,
          totalExpenses: expenses.data?.reduce((sum, exp) => sum + exp.amount, 0) || 0
        }
      };

      // Store report for InsightIQ
      await supabase.from('insights').insert({
        id: uuidv4(),
        project_id: projectId,
        type: 'client_report',
        data: report
      });

      return report;
    } catch (error) {
      console.error('Error generating client report:', error);
      return null;
    }
  },

  // RiskRadar integrations
  async detectProjectRisks(projectId: string): Promise<any[]> {
    try {
      const risks = [];

      // Check overdue tasks
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'done');

      if (overdueTasks && overdueTasks.length > 0) {
        risks.push({
          type: 'overdue_tasks',
          severity: 'high',
          description: `${overdueTasks.length} tasks are overdue`,
          data: overdueTasks
        });
      }

      // Check budget risks
      const budgetRisk = await this.checkBudgetAlert(projectId);
      if (budgetRisk) {
        risks.push({
          type: 'budget_risk',
          severity: 'medium',
          description: 'Project budget utilization is high'
        });
      }

      // Check for missing time logs
      const { data: tasksWithoutTime } = await supabase
        .from('tasks')
        .select(`
          *,
          time_entries(*)
        `)
        .eq('project_id', projectId)
        .eq('status', 'in-progress');

      const tasksWithoutTimeEntries = tasksWithoutTime?.filter(task => 
        !task.time_entries || task.time_entries.length === 0
      ) || [];

      if (tasksWithoutTimeEntries.length > 0) {
        risks.push({
          type: 'missing_time_logs',
          severity: 'medium',
          description: `${tasksWithoutTimeEntries.length} active tasks have no time logs`,
          data: tasksWithoutTimeEntries
        });
      }

      // Store risks for tracking
      for (const risk of risks) {
        await supabase.from('insights').insert({
          id: uuidv4(),
          project_id: projectId,
          type: 'risk_detection',
          data: risk
        });
      }

      return risks;
    } catch (error) {
      console.error('Error detecting project risks:', error);
      return [];
    }
  },

  async flagBudgetRisk(projectId: string, utilizationPercent: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('insights')
        .insert({
          id: uuidv4(),
          project_id: projectId,
          type: 'budget_risk',
          data: {
            utilization_percent: utilizationPercent,
            severity: utilizationPercent > 95 ? 'critical' : 'warning',
            detected_at: new Date().toISOString()
          }
        });

      return !error;
    } catch (error) {
      console.error('Error flagging budget risk:', error);
      return false;
    }
  },

  async flagResourceRisk(resourceId: string, allocationPercent: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('insights')
        .insert({
          id: uuidv4(),
          type: 'resource_risk',
          data: {
            resource_id: resourceId,
            allocation_percent: allocationPercent,
            severity: 'warning',
            detected_at: new Date().toISOString()
          }
        });

      return !error;
    } catch (error) {
      console.error('Error flagging resource risk:', error);
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
      
      // Check if this affects project risks
      if (task.project_id) {
        await this.detectProjectRisks(task.project_id);
      }

      // Update InsightIQ metrics
      await this.aggregateTaskPerformance(task.project_id);
    } catch (error) {
      console.error('Error triggering task created integrations:', error);
    }
  },

  async triggerTimeLoggedIntegrations(timeEntry: any, task: any): Promise<void> {
    try {
      // Update BudgetBuddy if billing rate is available
      const { data: billingRate } = await supabase
        .from('billing_rates')
        .select('*')
        .eq('user_id', timeEntry.user_id)
        .eq('project_id', timeEntry.project_id)
        .single();

      if (billingRate) {
        await this.createExpenseFromTimeEntry(timeEntry.id, billingRate.rate_amount);
      }

      // Sync to PlanBoard for timeline updates
      await this.syncTaskToPlanBoard(task.id);

      // Update project timeline in PlanBoard
      if (timeEntry.project_id) {
        const { data: projectTimeEntries } = await supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', timeEntry.project_id);

        if (projectTimeEntries) {
          await this.updateProjectTimeline(timeEntry.project_id, projectTimeEntries);
        }
      }

      // Check resource utilization
      await this.checkResourceUtilization(timeEntry.user_id);
    } catch (error) {
      console.error('Error triggering time logged integrations:', error);
    }
  },

  // Enhanced automation system
  triggerAutomation: async (eventType: string, sourceData: any): Promise<boolean> => {
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
        // Log automation event
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
            await integrationService.createTaskFromNote(
              sourceData.title || 'Automated Task',
              sourceData.description || 'Task created automatically',
              sourceData.project_id
            );
            break;
          case 'log_time':
            if (sourceData.task_id && sourceData.duration) {
              await integrationService.logTimeForTask(
                sourceData.task_id,
                sourceData.duration,
                'Time logged automatically'
              );
            }
            break;
          case 'send_notification':
            if (sourceData.user_id) {
              const actionPayload = rule.action_payload as any;
              await integrationService.createClientNotification(
                sourceData.user_id,
                actionPayload?.title || 'Notification',
                actionPayload?.message || 'Automated notification'
              );
            }
            break;
          case 'create_risk':
            await integrationService.detectProjectRisks(sourceData.project_id);
            break;
        }
      }

      return true;
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
        .select('*')
        .eq('user_id', userData.user.id);
        
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
  }
};
