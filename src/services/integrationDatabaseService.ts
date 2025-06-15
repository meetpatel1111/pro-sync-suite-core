
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  trigger_config: any;
  actions_config: any[];
  conditions_config: any[];
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
  difficulty: string;
  apps: string[];
  tags: string[];
  template_config: any;
  rating: number;
  downloads: number;
  is_public: boolean;
  is_verified: boolean;
  user_id?: string;
}

export interface IntegrationMarketplaceItem {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  features: string[];
  screenshots: string[];
  documentation_url: string;
  is_verified: boolean;
}

export interface ApiEndpoint {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  auth_config: any;
  timeout_seconds: number;
  rate_limit: number;
  is_active: boolean;
  test_status: string;
  last_tested_at: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationHealthStatus {
  id: string;
  user_id: string;
  service_name: string;
  status: string;
  response_time: number;
  uptime_percentage: number;
  error_details: any;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

export const integrationDatabaseService = {
  // Automation Workflows
  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        ...workflow,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the database response to match our interface
    return {
      ...data,
      trigger_config: typeof data.trigger_config === 'string' ? JSON.parse(data.trigger_config) : data.trigger_config,
      actions_config: typeof data.actions_config === 'string' ? JSON.parse(data.actions_config) : data.actions_config,
      conditions_config: typeof data.conditions_config === 'string' ? JSON.parse(data.conditions_config) : data.conditions_config,
    };
  },

  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      trigger_config: typeof item.trigger_config === 'string' ? JSON.parse(item.trigger_config) : item.trigger_config,
      actions_config: typeof item.actions_config === 'string' ? JSON.parse(item.actions_config) : item.actions_config,
      conditions_config: typeof item.conditions_config === 'string' ? JSON.parse(item.conditions_config) : item.conditions_config,
    }));
  },

  async updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAutomationWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Integration Templates
  async getIntegrationTemplates(): Promise<IntegrationTemplate[]> {
    const { data, error } = await supabase
      .from('integration_templates')
      .select('*')
      .eq('is_public', true)
      .order('downloads', { ascending: false });

    if (error) throw error;
    
    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      apps: typeof item.apps === 'string' ? JSON.parse(item.apps) : item.apps,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
      template_config: typeof item.template_config === 'string' ? JSON.parse(item.template_config) : item.template_config,
    }));
  },

  async createIntegrationTemplate(template: Omit<IntegrationTemplate, 'id'>): Promise<IntegrationTemplate> {
    const { data, error } = await supabase
      .from('integration_templates')
      .insert({
        ...template,
        id: uuidv4()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the database response to match our interface
    return {
      ...data,
      apps: typeof data.apps === 'string' ? JSON.parse(data.apps) : data.apps,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
      template_config: typeof data.template_config === 'string' ? JSON.parse(data.template_config) : data.template_config,
    };
  },

  async installTemplate(templateId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_installations')
      .insert({
        template_id: templateId,
        user_id: userId,
        installed_at: new Date().toISOString(),
        is_active: true
      });

    if (error) throw error;

    // Increment download count using the custom function
    const { error: incrementError } = await supabase.rpc('increment_template_downloads', { 
      template_id: templateId 
    });
    
    if (incrementError) {
      console.error('Error incrementing download count:', incrementError);
    }
  },

  // Marketplace - now gets from integration_templates (all free)
  async getMarketplaceItems(): Promise<IntegrationMarketplaceItem[]> {
    const { data, error } = await supabase
      .from('integration_templates')
      .select('*')
      .eq('is_public', true)
      .order('downloads', { ascending: false });

    if (error) throw error;
    
    // Transform integration templates to marketplace items (all free)
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      provider: 'ProSync Community',
      category: template.category,
      price: 0, // All integrations are free
      rating: template.rating,
      downloads: template.downloads,
      features: typeof template.tags === 'string' ? JSON.parse(template.tags) : template.tags,
      screenshots: [],
      documentation_url: `https://docs.prosync.com/templates/${template.id}`,
      is_verified: template.is_verified
    }));
  },

  // API Management
  async getApiEndpoints(userId: string): Promise<ApiEndpoint[]> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      headers: typeof item.headers === 'string' ? JSON.parse(item.headers) : (item.headers as Record<string, string>) || {},
      auth_config: typeof item.auth_config === 'string' ? JSON.parse(item.auth_config) : item.auth_config,
    }));
  },

  async createApiEndpoint(endpoint: Omit<ApiEndpoint, 'id' | 'created_at' | 'updated_at'>): Promise<ApiEndpoint> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .insert({
        ...endpoint,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the database response to match our interface
    return {
      ...data,
      headers: typeof data.headers === 'string' ? JSON.parse(data.headers) : (data.headers as Record<string, string>) || {},
      auth_config: typeof data.auth_config === 'string' ? JSON.parse(data.auth_config) : data.auth_config,
    };
  },

  async updateApiEndpoint(id: string, updates: Partial<ApiEndpoint>): Promise<void> {
    const { error } = await supabase
      .from('api_endpoints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteApiEndpoint(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_endpoints')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async testApiEndpoint(endpointId: string): Promise<any> {
    const { data: endpoint, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('id', endpointId)
      .single();

    if (error) throw error;

    try {
      const headers = typeof endpoint.headers === 'string' ? JSON.parse(endpoint.headers) : endpoint.headers || {};
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: headers as HeadersInit,
        signal: AbortSignal.timeout(endpoint.timeout_seconds * 1000)
      });

      const testResult = {
        status: response.status,
        success: response.ok,
        response_time: Date.now(), // Simplified
        tested_at: new Date().toISOString()
      };

      await supabase
        .from('api_endpoints')
        .update({
          test_status: testResult.success ? 'success' : 'failed',
          last_tested_at: testResult.tested_at
        })
        .eq('id', endpointId);

      return testResult;
    } catch (error) {
      await supabase
        .from('api_endpoints')
        .update({
          test_status: 'failed',
          last_tested_at: new Date().toISOString()
        })
        .eq('id', endpointId);

      throw error;
    }
  },

  // Integration Health Monitoring
  async getIntegrationHealth(userId: string): Promise<IntegrationHealthStatus[]> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .select('*')
      .eq('user_id', userId)
      .order('last_checked_at', { ascending: false });

    if (error) throw error;
    
    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      error_details: typeof item.error_details === 'string' ? JSON.parse(item.error_details) : item.error_details,
    }));
  },

  async getIntegrationHealthStatus(userId: string): Promise<IntegrationHealthStatus[]> {
    return this.getIntegrationHealth(userId);
  },

  async createIntegrationHealthStatus(status: Omit<IntegrationHealthStatus, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationHealthStatus> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .insert({
        ...status,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the database response to match our interface
    return {
      ...data,
      error_details: typeof data.error_details === 'string' ? JSON.parse(data.error_details) : data.error_details,
    };
  },

  async updateIntegrationHealthStatus(id: string, updates: Partial<IntegrationHealthStatus>): Promise<void> {
    const { error } = await supabase
      .from('integration_health_status')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async updateIntegrationHealth(serviceName: string, status: any): Promise<void> {
    const { error } = await supabase
      .from('integration_health_status')
      .upsert({
        service_name: serviceName,
        status: status.status,
        response_time: status.response_time,
        uptime_percentage: status.uptime_percentage,
        error_details: status.error_details,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Automation Workflows
  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        ...workflow,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the database response to match our interface
    return {
      ...data,
      trigger_config: typeof data.trigger_config === 'string' ? JSON.parse(data.trigger_config) : data.trigger_config,
      actions_config: typeof data.actions_config === 'string' ? JSON.parse(data.actions_config) : data.actions_config,
      conditions_config: typeof data.conditions_config === 'string' ? JSON.parse(data.conditions_config) : data.conditions_config,
    };
  },

  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      trigger_config: typeof item.trigger_config === 'string' ? JSON.parse(item.trigger_config) : item.trigger_config,
      actions_config: typeof item.actions_config === 'string' ? JSON.parse(item.actions_config) : item.actions_config,
      conditions_config: typeof item.conditions_config === 'string' ? JSON.parse(item.conditions_config) : item.conditions_config,
    }));
  },

  async updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAutomationWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
