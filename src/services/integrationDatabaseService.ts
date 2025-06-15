
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  downloads: number;
  apps: string[];
  tags: string[];
  template_config: any;
  is_public: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_config: any;
  actions_config: any;
  conditions_config: any;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationHealthStatus {
  id: string;
  user_id: string;
  integration_id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  response_time: number;
  uptime_percentage: number;
  last_checked_at: string;
  error_details?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  id: string;
  user_id: string;
  source_app: string;
  target_app: string;
  sync_type: string;
  status: 'synced' | 'syncing' | 'error' | 'paused';
  last_sync_at?: string;
  next_sync_at?: string;
  records_synced: number;
  error_message?: string;
  sync_config: any;
  created_at: string;
  updated_at: string;
}

export interface APIEndpoint {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: any;
  auth_config: any;
  rate_limit?: number;
  timeout_seconds: number;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: 'success' | 'failed' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  user_id: string;
  integration_id: string;
  log_level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details: any;
  created_at: string;
}

export interface MarketplaceInstallation {
  id: string;
  user_id: string;
  template_id: string;
  installed_at: string;
  is_active: boolean;
  configuration: any;
}

export const integrationDatabaseService = {
  // Integration Templates
  async getIntegrationTemplates(userId: string): Promise<IntegrationTemplate[]> {
    const { data, error } = await supabase
      .from('integration_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integration templates:', error);
      throw error;
    }

    return data || [];
  },

  async getPublicTemplates(): Promise<IntegrationTemplate[]> {
    const { data, error } = await supabase
      .from('integration_templates')
      .select('*')
      .eq('is_public', true)
      .order('downloads', { ascending: false });

    if (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }

    return data || [];
  },

  async createIntegrationTemplate(template: Omit<IntegrationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationTemplate> {
    const { data, error } = await supabase
      .from('integration_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating integration template:', error);
      throw error;
    }

    return data;
  },

  async updateIntegrationTemplate(id: string, updates: Partial<IntegrationTemplate>): Promise<IntegrationTemplate> {
    const { data, error } = await supabase
      .from('integration_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration template:', error);
      throw error;
    }

    return data;
  },

  async deleteIntegrationTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('integration_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting integration template:', error);
      throw error;
    }
  },

  // Automation Workflows
  async getAutomationWorkflows(userId: string): Promise<AutomationWorkflow[]> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automation workflows:', error);
      throw error;
    }

    return data || [];
  },

  async createAutomationWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) {
      console.error('Error creating automation workflow:', error);
      throw error;
    }

    return data;
  },

  async updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
    const { data, error } = await supabase
      .from('automation_workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating automation workflow:', error);
      throw error;
    }

    return data;
  },

  async deleteAutomationWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting automation workflow:', error);
      throw error;
    }
  },

  // Integration Health Status
  async getIntegrationHealthStatus(userId: string): Promise<IntegrationHealthStatus[]> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .select('*')
      .eq('user_id', userId)
      .order('last_checked_at', { ascending: false });

    if (error) {
      console.error('Error fetching integration health status:', error);
      throw error;
    }

    return data || [];
  },

  async createIntegrationHealthStatus(health: Omit<IntegrationHealthStatus, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationHealthStatus> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .insert(health)
      .select()
      .single();

    if (error) {
      console.error('Error creating integration health status:', error);
      throw error;
    }

    return data;
  },

  async updateIntegrationHealthStatus(id: string, updates: Partial<IntegrationHealthStatus>): Promise<IntegrationHealthStatus> {
    const { data, error } = await supabase
      .from('integration_health_status')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration health status:', error);
      throw error;
    }

    return data;
  },

  // Sync Status
  async getSyncStatus(userId: string): Promise<SyncStatus[]> {
    const { data, error } = await supabase
      .from('sync_status')
      .select('*')
      .eq('user_id', userId)
      .order('last_sync_at', { ascending: false });

    if (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }

    return data || [];
  },

  async createSyncStatus(sync: Omit<SyncStatus, 'id' | 'created_at' | 'updated_at'>): Promise<SyncStatus> {
    const { data, error } = await supabase
      .from('sync_status')
      .insert(sync)
      .select()
      .single();

    if (error) {
      console.error('Error creating sync status:', error);
      throw error;
    }

    return data;
  },

  async updateSyncStatus(id: string, updates: Partial<SyncStatus>): Promise<SyncStatus> {
    const { data, error } = await supabase
      .from('sync_status')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }

    return data;
  },

  // API Endpoints
  async getAPIEndpoints(userId: string): Promise<APIEndpoint[]> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API endpoints:', error);
      throw error;
    }

    return data || [];
  },

  async createAPIEndpoint(endpoint: Omit<APIEndpoint, 'id' | 'created_at' | 'updated_at'>): Promise<APIEndpoint> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .insert(endpoint)
      .select()
      .single();

    if (error) {
      console.error('Error creating API endpoint:', error);
      throw error;
    }

    return data;
  },

  async updateAPIEndpoint(id: string, updates: Partial<APIEndpoint>): Promise<APIEndpoint> {
    const { data, error } = await supabase
      .from('api_endpoints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating API endpoint:', error);
      throw error;
    }

    return data;
  },

  async deleteAPIEndpoint(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_endpoints')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API endpoint:', error);
      throw error;
    }
  },

  // Integration Logs
  async getIntegrationLogs(userId: string, limit: number = 100): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching integration logs:', error);
      throw error;
    }

    return data || [];
  },

  async createIntegrationLog(log: Omit<IntegrationLog, 'id' | 'created_at'>): Promise<IntegrationLog> {
    const { data, error } = await supabase
      .from('integration_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      console.error('Error creating integration log:', error);
      throw error;
    }

    return data;
  },

  // Marketplace Installations
  async getMarketplaceInstallations(userId: string): Promise<MarketplaceInstallation[]> {
    const { data, error } = await supabase
      .from('marketplace_installations')
      .select('*')
      .eq('user_id', userId)
      .order('installed_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace installations:', error);
      throw error;
    }

    return data || [];
  },

  async createMarketplaceInstallation(installation: Omit<MarketplaceInstallation, 'id' | 'installed_at'>): Promise<MarketplaceInstallation> {
    const { data, error } = await supabase
      .from('marketplace_installations')
      .insert(installation)
      .select()
      .single();

    if (error) {
      console.error('Error creating marketplace installation:', error);
      throw error;
    }

    return data;
  },

  async updateMarketplaceInstallation(id: string, updates: Partial<MarketplaceInstallation>): Promise<MarketplaceInstallation> {
    const { data, error } = await supabase
      .from('marketplace_installations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating marketplace installation:', error);
      throw error;
    }

    return data;
  },

  async deleteMarketplaceInstallation(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_installations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting marketplace installation:', error);
      throw error;
    }
  }
};
