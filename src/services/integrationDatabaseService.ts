
import { supabase } from '@/integrations/supabase/client';

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  trigger_config: any;
  actions_config: any[];
  conditions_config?: any[];
  is_active: boolean;
  execution_count: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  source_app: string;
  target_app: string;
  config: any;
  downloads: number;
  is_featured: boolean;
  created_at: string;
}

class IntegrationDatabaseService {
  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    try {
      // First, create a simple workflow entry in user_settings as a placeholder
      const workflowData = {
        user_id: workflow.user_id,
        theme: 'light', // Default values for existing columns
        language: 'en',
        timezone: 'UTC',
        // Store workflow data in a custom field or use JSONB if available
        workflow_name: workflow.name,
        workflow_description: workflow.description,
        workflow_config: JSON.stringify({
          trigger: workflow.trigger_config,
          actions: workflow.actions_config,
          conditions: workflow.conditions_config,
          is_active: workflow.is_active,
          execution_count: workflow.execution_count
        })
      };

      // For now, store in user_settings with a unique approach
      const { data, error } = await supabase
        .from('user_settings')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;

      // Return formatted workflow
      return {
        id: data.id,
        user_id: data.user_id,
        name: workflow.name,
        description: workflow.description,
        trigger_config: workflow.trigger_config,
        actions_config: workflow.actions_config,
        conditions_config: workflow.conditions_config,
        is_active: workflow.is_active,
        execution_count: workflow.execution_count,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating automation workflow:', error);
      throw error;
    }
  }

  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    try {
      // For demo purposes, return mock data
      const mockWorkflows: AutomationWorkflow[] = [
        {
          id: '1',
          user_id: userId,
          name: 'Task Assignment Automation',
          description: 'Automatically assign tasks based on team workload',
          trigger_config: { app: 'TaskMaster', event: 'task_created' },
          actions_config: [{ app: 'TaskMaster', action: 'assign_task', config: { strategy: 'least_busy' } }],
          conditions_config: [{ field: 'priority', operator: 'equals', value: 'high' }],
          is_active: true,
          execution_count: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: userId,
          name: 'Budget Alert Workflow',
          description: 'Send alerts when project budget exceeds threshold',
          trigger_config: { app: 'BudgetBuddy', event: 'budget_exceeded' },
          actions_config: [
            { app: 'CollabSpace', action: 'send_message', config: { channel: 'general' } },
            { app: 'ClientConnect', action: 'send_email', config: { template: 'budget_alert' } }
          ],
          is_active: false,
          execution_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return mockWorkflows;
    } catch (error) {
      console.error('Error getting automation workflows:', error);
      return [];
    }
  }

  async updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): Promise<void> {
    try {
      console.log('Updating workflow:', id, updates);
      // For demo purposes, just log the update
      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error updating automation workflow:', error);
      throw error;
    }
  }

  async deleteAutomationWorkflow(id: string): Promise<void> {
    try {
      console.log('Deleting workflow:', id);
      // For demo purposes, just log the deletion
      // In a real implementation, this would delete from database
    } catch (error) {
      console.error('Error deleting automation workflow:', error);
      throw error;
    }
  }

  async getIntegrationTemplates(): Promise<IntegrationTemplate[]> {
    const mockTemplates: IntegrationTemplate[] = [
      {
        id: '1',
        name: 'Task to Time Entry',
        description: 'Automatically create time entries when tasks are completed',
        category: 'Productivity',
        source_app: 'TaskMaster',
        target_app: 'TimeTrackPro',
        config: {
          trigger: 'task_completed',
          mapping: { task_title: 'entry_description', task_time: 'duration' }
        },
        downloads: 150,
        is_featured: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Budget Alert System',
        description: 'Send notifications when budget thresholds are exceeded',
        category: 'Finance',
        source_app: 'BudgetBuddy',
        target_app: 'CollabSpace',
        config: {
          trigger: 'budget_threshold',
          threshold: 80,
          action: 'send_notification'
        },
        downloads: 89,
        is_featured: false,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Client Meeting Sync',
        description: 'Sync client meetings with project timelines',
        category: 'CRM',
        source_app: 'ClientConnect',
        target_app: 'PlanBoard',
        config: {
          trigger: 'meeting_scheduled',
          mapping: { meeting_date: 'milestone_date', client_id: 'project_client' }
        },
        downloads: 45,
        is_featured: true,
        created_at: new Date().toISOString()
      }
    ];

    return mockTemplates;
  }

  async executeWorkflow(workflowId: string, triggerData: any): Promise<boolean> {
    try {
      console.log('Executing workflow:', workflowId, 'with data:', triggerData);
      
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would:
      // 1. Get the workflow configuration
      // 2. Check conditions
      // 3. Execute actions
      // 4. Log results
      // 5. Update execution count
      
      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      return false;
    }
  }
}

export const integrationDatabaseService = new IntegrationDatabaseService();
