
import { supabase } from '@/integrations/supabase/client';

export interface Integration {
  id: string;
  user_id: string;
  source_app: string;
  target_app: string;
  action_type: string;
  config: any;
  enabled: boolean;
  created_at: string;
  last_executed_at?: string;
  execution_count: number;
  success_count: number;
  error_count: number;
  trigger_condition?: string;
  last_error_message?: string;
}

class IntegrationService {
  async createIntegration(integration: Omit<Integration, 'id' | 'created_at' | 'execution_count' | 'success_count' | 'error_count'>): Promise<Integration> {
    const { data, error } = await supabase
      .from('integration_actions')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIntegrations(userId: string): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integration_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const { data, error } = await supabase
      .from('integration_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integration_actions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async executeIntegration(id: string): Promise<void> {
    try {
      // Update execution count
      const { error } = await supabase
        .from('integration_actions')
        .update({
          execution_count: supabase.rpc('increment', { table_name: 'integration_actions', column_name: 'execution_count', id }),
          last_executed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update success count
      await supabase
        .from('integration_actions')
        .update({
          success_count: supabase.rpc('increment', { table_name: 'integration_actions', column_name: 'success_count', id })
        })
        .eq('id', id);

    } catch (error) {
      // Update error count
      await supabase
        .from('integration_actions')
        .update({
          error_count: supabase.rpc('increment', { table_name: 'integration_actions', column_name: 'error_count', id }),
          last_error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', id);

      throw error;
    }
  }

  async incrementExecutionCount(integrationId: string): Promise<void> {
    try {
      // Use a simple SQL update instead of RPC
      const { data: currentData, error: fetchError } = await supabase
        .from('integration_actions')
        .select('execution_count')
        .eq('id', integrationId)
        .single();

      if (fetchError) throw fetchError;

      const newCount = (currentData?.execution_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('integration_actions')
        .update({
          execution_count: newCount,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error incrementing execution count:', error);
      throw error;
    }
  }

  async getIntegrationStats(userId: string) {
    const { data, error } = await supabase
      .from('integration_actions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      enabled: data?.filter(i => i.enabled).length || 0,
      totalExecutions: data?.reduce((sum, i) => sum + (i.execution_count || 0), 0) || 0,
      successRate: 0
    };

    const totalExecutions = stats.totalExecutions;
    const totalSuccesses = data?.reduce((sum, i) => sum + (i.success_count || 0), 0) || 0;
    
    if (totalExecutions > 0) {
      stats.successRate = Math.round((totalSuccesses / totalExecutions) * 100);
    }

    return stats;
  }

  async testIntegration(integration: Integration): Promise<boolean> {
    try {
      // Simulate integration test
      console.log('Testing integration:', integration);
      
      // Mock test logic based on integration type
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return Math.random() > 0.1; // 90% success rate for testing
    } catch (error) {
      console.error('Integration test failed:', error);
      return false;
    }
  }
}

export const integrationService = new IntegrationService();
