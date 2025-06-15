
import { supabase } from '@/integrations/supabase/client';

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_config: Record<string, any>;
  actions_config: Record<string, any>[];
  conditions_config: Record<string, any>[];
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationHealthStatus {
  id: string;
  user_id: string;
  integration_id?: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  response_time: number;
  uptime_percentage: number;
  last_checked_at: string;
  error_details?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  apps: string[];
  tags: string[];
  template_config: Record<string, any>;
  is_public: boolean;
  is_verified: boolean;
  rating: number;
  downloads: number;
  execution_count: number;
  last_used_at?: string;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

class IntegrationDatabaseService {
  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching automation workflows:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        trigger_config: typeof item.trigger_config === 'string' 
          ? JSON.parse(item.trigger_config) 
          : (item.trigger_config as Record<string, any>),
        actions_config: typeof item.actions_config === 'string'
          ? JSON.parse(item.actions_config)
          : (item.actions_config as Record<string, any>[]),
        conditions_config: typeof item.conditions_config === 'string'
          ? JSON.parse(item.conditions_config)
          : (item.conditions_config as Record<string, any>[])
      }));
    } catch (error) {
      console.error('Error in getAutomationWorkflows:', error);
      throw error;
    }
  }

  async createAutomationWorkflow(workflowData: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert([workflowData])
        .select()
        .single();

      if (error) {
        console.error('Error creating automation workflow:', error);
        throw error;
      }

      return {
        ...data,
        trigger_config: typeof data.trigger_config === 'string' 
          ? JSON.parse(data.trigger_config) 
          : (data.trigger_config as Record<string, any>),
        actions_config: typeof data.actions_config === 'string'
          ? JSON.parse(data.actions_config)
          : (data.actions_config as Record<string, any>[]),
        conditions_config: typeof data.conditions_config === 'string'
          ? JSON.parse(data.conditions_config)
          : (data.conditions_config as Record<string, any>[])
      };
    } catch (error) {
      console.error('Error in createAutomationWorkflow:', error);
      throw error;
    }
  }

  async updateAutomationWorkflow(workflowId: string, updates: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .update(updates)
        .eq('id', workflowId)
        .select()
        .single();

      if (error) {
        console.error('Error updating automation workflow:', error);
        throw error;
      }

      return {
        ...data,
        trigger_config: typeof data.trigger_config === 'string' 
          ? JSON.parse(data.trigger_config) 
          : (data.trigger_config as Record<string, any>),
        actions_config: typeof data.actions_config === 'string'
          ? JSON.parse(data.actions_config)
          : (data.actions_config as Record<string, any>[]),
        conditions_config: typeof data.conditions_config === 'string'
          ? JSON.parse(data.conditions_config)
          : (data.conditions_config as Record<string, any>[])
      };
    } catch (error) {
      console.error('Error in updateAutomationWorkflow:', error);
      throw error;
    }
  }

  async deleteAutomationWorkflow(workflowId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) {
        console.error('Error deleting automation workflow:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteAutomationWorkflow:', error);
      throw error;
    }
  }

  async getWorkflowExecutionHistory(workflowId: string) {
    try {
      const { data, error } = await supabase
        .from('automation_events')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching workflow execution history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWorkflowExecutionHistory:', error);
      throw error;
    }
  }

  async triggerWorkflow(workflowId: string, payload: Record<string, any> = {}) {
    try {
      const { data, error } = await supabase
        .from('automation_events')
        .insert([{
          workflow_id: workflowId,
          event_type: 'manual_trigger',
          payload,
          status: 'triggered',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error triggering workflow:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in triggerWorkflow:', error);
      throw error;
    }
  }

  async getIntegrationHealthStatus(userId: string): Promise<IntegrationHealthStatus[]> {
    try {
      const { data, error } = await supabase
        .from('integration_health_status')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integration health status:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getIntegrationHealthStatus:', error);
      throw error;
    }
  }

  async createIntegrationHealthStatus(statusData: Omit<IntegrationHealthStatus, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationHealthStatus> {
    try {
      const { data, error } = await supabase
        .from('integration_health_status')
        .insert([statusData])
        .select()
        .single();

      if (error) {
        console.error('Error creating integration health status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createIntegrationHealthStatus:', error);
      throw error;
    }
  }

  async updateIntegrationHealthStatus(statusId: string, updates: Partial<IntegrationHealthStatus>): Promise<IntegrationHealthStatus> {
    try {
      const { data, error } = await supabase
        .from('integration_health_status')
        .update(updates)
        .eq('id', statusId)
        .select()
        .single();

      if (error) {
        console.error('Error updating integration health status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateIntegrationHealthStatus:', error);
      throw error;
    }
  }
}

export const integrationDatabaseService = new IntegrationDatabaseService();
