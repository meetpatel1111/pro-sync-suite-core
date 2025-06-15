
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
    return data;
  },

  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
    return data || [];
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
    return data;
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

    // Increment download count
    await supabase
      .from('integration_templates')
      .update({ downloads: supabase.sql`downloads + 1` })
      .eq('id', templateId);
  },

  // Marketplace
  async getMarketplaceItems(): Promise<IntegrationMarketplaceItem[]> {
    // Mock data for marketplace items - in real app this would come from database
    return [
      {
        id: '1',
        name: 'Slack Integration Pro',
        description: 'Advanced Slack integration with custom workflows and notifications',
        provider: 'ProSync Team',
        category: 'Communication',
        price: 29.99,
        rating: 4.8,
        downloads: 1250,
        features: ['Custom Notifications', 'Workflow Automation', 'File Sharing', 'Team Analytics'],
        screenshots: [],
        documentation_url: 'https://docs.prosync.com/slack-pro',
        is_verified: true
      },
      {
        id: '2',
        name: 'Jira Sync Master',
        description: 'Seamlessly sync tasks between ProSync and Jira with advanced mapping',
        provider: 'Community',
        category: 'Project Management',
        price: 0,
        rating: 4.5,
        downloads: 890,
        features: ['Bi-directional Sync', 'Custom Field Mapping', 'Real-time Updates'],
        screenshots: [],
        documentation_url: 'https://docs.prosync.com/jira-sync',
        is_verified: false
      }
    ];
  },

  // API Management
  async getApiEndpoints(userId: string) {
    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createApiEndpoint(endpoint: any) {
    const { data, error } = await supabase
      .from('api_endpoints')
      .insert(endpoint)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async testApiEndpoint(endpointId: string) {
    const { data: endpoint, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('id', endpointId)
      .single();

    if (error) throw error;

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: endpoint.headers || {},
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
  async getIntegrationHealth(userId: string) {
    const { data, error } = await supabase
      .from('integration_health_status')
      .select('*')
      .eq('user_id', userId)
      .order('last_checked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateIntegrationHealth(serviceName: string, status: any) {
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
  }
};
