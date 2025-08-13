
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  trigger_config: any;
  actions_config: any[];
  conditions_config: any;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationHealthStatus {
  id: string;
  user_id: string;
  integration_id: string | null;
  service_name: string;
  status: 'healthy' | 'warning' | 'error';
  response_time: number;
  uptime_percentage: number;
  error_details: string | null;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  apps: string[];
  tags: string[];
  rating: number | null;
  downloads: number | null;
  template_config: any;
  is_public: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  execution_count: number | null;
  last_used_at: string | null;
  success_rate: number | null;
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
  last_executed_at: string | null;
  execution_count: number | null;
  success_count: number | null;
  error_count: number | null;
  last_error_message: string | null;
  status: 'active' | 'inactive' | 'error';
}

class IntegrationDatabaseService {
  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        user_id: workflow.user_id,
        name: workflow.name,
        description: workflow.description,
        trigger_config: workflow.trigger_config,
        actions_config: workflow.actions_config,
        conditions_config: workflow.conditions_config,
        is_active: workflow.is_active,
        execution_count: workflow.execution_count,
        last_executed_at: workflow.last_executed_at
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      trigger_config: data.trigger_config,
      actions_config: Array.isArray(data.actions_config) ? data.actions_config : [],
      conditions_config: data.conditions_config,
      is_active: data.is_active,
      execution_count: data.execution_count,
      last_executed_at: data.last_executed_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async getUserAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(workflow => ({
      id: workflow.id,
      user_id: workflow.user_id,
      name: workflow.name,
      description: workflow.description,
      trigger_config: workflow.trigger_config,
      actions_config: Array.isArray(workflow.actions_config) ? workflow.actions_config : [],
      conditions_config: workflow.conditions_config,
      is_active: workflow.is_active,
      execution_count: workflow.execution_count,
      last_executed_at: workflow.last_executed_at,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at
    }));
  }

  async updateAutomationWorkflow(workflowId: string, updates: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      trigger_config: data.trigger_config,
      actions_config: Array.isArray(data.actions_config) ? data.actions_config : [],
      conditions_config: data.conditions_config,
      is_active: data.is_active,
      execution_count: data.execution_count,
      last_executed_at: data.last_executed_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async deleteAutomationWorkflow(workflowId: string): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', workflowId);

    if (error) throw error;
  }

  async executeWorkflow(workflowId: string): Promise<boolean> {
    try {
      // Update execution count
      const { error } = await supabase
        .from('automation_workflows')
        .update({ 
          execution_count: 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error executing workflow:', error);
      return false;
    }
  }

  async getIntegrationHealth(userId: string): Promise<IntegrationHealthStatus[]> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id || '',
      integration_id: item.integration_id,
      service_name: item.service_name,
      status: (item.status as 'healthy' | 'warning' | 'error') || 'healthy',
      response_time: item.response_time || 0,
      uptime_percentage: item.uptime_percentage || 100,
      error_details: item.error_details,
      last_checked_at: item.last_checked_at || new Date().toISOString(),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }));
  }

  async createIntegrationHealthStatus(status: Omit<IntegrationHealthStatus, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationHealthStatus> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .insert(status)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id || '',
      integration_id: data.integration_id,
      service_name: data.service_name,
      status: (data.status as 'healthy' | 'warning' | 'error') || 'healthy',
      response_time: data.response_time || 0,
      uptime_percentage: data.uptime_percentage || 100,
      error_details: data.error_details,
      last_checked_at: data.last_checked_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  async updateIntegrationHealthStatus(id: string, updates: Partial<IntegrationHealthStatus>): Promise<IntegrationHealthStatus> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id || '',
      integration_id: data.integration_id,
      service_name: data.service_name,
      status: (data.status as 'healthy' | 'warning' | 'error') || 'healthy',
      response_time: data.response_time || 0,
      uptime_percentage: data.uptime_percentage || 100,
      error_details: data.error_details,
      last_checked_at: data.last_checked_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  async getIntegrationTemplates(userId: string): Promise<IntegrationTemplate[]> {
    const { data, error } = await supabase
      .from('integration_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`);

    if (error) throw error;

    return (data || []).map(template => ({
      id: template.id,
      user_id: template.user_id,
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      apps: template.apps || [],
      tags: template.tags || [],
      rating: template.rating,
      downloads: template.downloads,
      template_config: template.template_config,
      is_public: template.is_public,
      is_verified: template.is_verified,
      created_at: template.created_at,
      updated_at: template.updated_at,
      execution_count: template.execution_count,
      last_used_at: template.last_used_at,
      success_rate: template.success_rate
    }));
  }

  async installTemplate(templateId: string, userId: string): Promise<boolean> {
    try {
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
      await supabase.rpc('increment_template_downloads', { template_id: templateId });

      return true;
    } catch (error) {
      console.error('Error installing template:', error);
      return false;
    }
  }

  async logTimeEntry(userId: string, taskId: string, minutes: number, description: string = ''): Promise<any> {
    try {
      // Get task details for project info
      const { data: task } = await supabase
        .from('tasks')
        .select('title, project_id, projects(name)')
        .eq('id', taskId)
        .single();

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: userId,
          task_id: taskId,
          description: description || `Time logged for: ${task?.title || 'Task'}`,
          time_spent: minutes,
          date: new Date().toISOString().split('T')[0],
          manual: true,
          project: (task?.projects as any)?.name || 'Unknown Project'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging time entry:', error);
      throw error;
    }
  }
}

export const integrationDatabaseService = new IntegrationDatabaseService();
