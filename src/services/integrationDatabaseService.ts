
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
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  source_app?: string;
  target_app?: string;
  config?: any;
  template_config?: any;
  downloads: number;
  is_featured?: boolean;
  is_public?: boolean;
  is_verified?: boolean;
  difficulty?: string;
  apps?: string[];
  tags?: string[];
  rating?: number;
  created_at: string;
}

export interface IntegrationHealthStatus {
  id: string;
  user_id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'error';
  response_time: number;
  uptime_percentage: number;
  error_details?: any;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

class IntegrationDatabaseService {
  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert({
          user_id: workflow.user_id,
          name: workflow.name,
          description: workflow.description,
          trigger_config: workflow.trigger_config,
          actions_config: workflow.actions_config,
          conditions_config: workflow.conditions_config || [],
          is_active: workflow.is_active,
          execution_count: workflow.execution_count,
          last_executed_at: workflow.last_executed_at
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating automation workflow:', error);
      throw error;
    }
  }

  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting automation workflows:', error);
      return [];
    }
  }

  async updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating automation workflow:', error);
      throw error;
    }
  }

  async deleteAutomationWorkflow(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting automation workflow:', error);
      throw error;
    }
  }

  async getIntegrationTemplates(): Promise<IntegrationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('integration_templates')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting integration templates:', error);
      return [];
    }
  }

  async getIntegrationHealth(userId: string): Promise<IntegrationHealthStatus[]> {
    try {
      const { data, error } = await supabase
        .from('integration_health_status')
        .select('*')
        .eq('user_id', userId)
        .order('last_checked_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting integration health:', error);
      return [];
    }
  }

  async createIntegrationHealthStatus(status: Omit<IntegrationHealthStatus, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationHealthStatus> {
    try {
      const { data, error } = await supabase
        .from('integration_health_status')
        .insert(status)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating integration health status:', error);
      throw error;
    }
  }

  async updateIntegrationHealthStatus(id: string, updates: Partial<IntegrationHealthStatus>): Promise<void> {
    try {
      const { error } = await supabase
        .from('integration_health_status')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating integration health status:', error);
      throw error;
    }
  }

  async installTemplate(templateId: string, userId: string): Promise<void> {
    try {
      // Check if already installed
      const { data: existing } = await supabase
        .from('marketplace_installations')
        .select('id')
        .eq('template_id', templateId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        console.log('Template already installed');
        return;
      }

      // Install template
      const { error } = await supabase
        .from('marketplace_installations')
        .insert({
          user_id: userId,
          template_id: templateId,
          is_active: true,
          configuration: {}
        });

      if (error) throw error;

      // Increment download count
      await supabase
        .from('integration_templates')
        .update({ downloads: supabase.sql`downloads + 1` })
        .eq('id', templateId);

    } catch (error) {
      console.error('Error installing template:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, triggerData: any): Promise<boolean> {
    try {
      console.log('Executing workflow:', workflowId, 'with data:', triggerData);
      
      // Get workflow from database
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error || !workflow) {
        console.error('Workflow not found:', error);
        return false;
      }

      // Check if workflow is active
      if (!workflow.is_active) {
        console.log('Workflow is not active');
        return false;
      }

      // Execute workflow actions
      const actions = workflow.actions_config as any[];
      for (const action of actions) {
        await this.executeAction(action, triggerData);
      }

      // Update execution count
      await supabase
        .from('automation_workflows')
        .update({ 
          execution_count: workflow.execution_count + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      return false;
    }
  }

  private async executeAction(action: any, triggerData: any): Promise<void> {
    console.log('Executing action:', action, 'with trigger data:', triggerData);
    
    // Execute different types of actions based on app and action type
    const { app, action: actionType, config } = action;

    switch (app) {
      case 'TaskMaster':
        if (actionType === 'create_task') {
          await supabase.from('tasks').insert({
            title: config.title || 'Automated Task',
            description: config.description || 'Task created by automation',
            status: 'todo',
            priority: config.priority || 'medium',
            created_by: triggerData.user_id
          });
        }
        break;

      case 'CollabSpace':
        if (actionType === 'send_notification') {
          await supabase.from('notifications').insert({
            user_id: triggerData.user_id,
            title: config.title || 'Automation Notification',
            message: config.message || 'Workflow executed successfully',
            type: 'info'
          });
        }
        break;

      case 'TimeTrackPro':
        if (actionType === 'log_time') {
          await supabase.from('time_entries').insert({
            user_id: triggerData.user_id,
            task_id: triggerData.task_id,
            description: config.description || 'Automated time entry',
            time_spent: config.hours || 1,
            date: new Date().toISOString().split('T')[0],
            start_time: new Date().toISOString(),
            manual: false
          });
        }
        break;

      default:
        console.log('Unknown app for action:', app);
    }
  }
}

export const integrationDatabaseService = new IntegrationDatabaseService();
