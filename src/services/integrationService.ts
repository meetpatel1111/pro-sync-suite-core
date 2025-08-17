import { supabase } from '@/integrations/supabase/client';

export interface IntegrationAction {
  id: string;
  user_id: string;
  source_app: string;
  target_app: string;
  action_type: string;
  trigger_condition?: string;
  config: any;
  enabled: boolean;
  created_at: string;
  last_executed_at?: string;
  execution_count: number;
  success_count: number;
  error_count: number;
  last_error_message?: string;
}

export class IntegrationService {
  async getIntegrationActions(): Promise<IntegrationAction[]> {
    try {
      const { data, error } = await supabase
        .from('integration_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integration actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getIntegrationActions:', error);
      return [];
    }
  }

  async createIntegrationAction(action: Omit<IntegrationAction, 'id' | 'created_at' | 'execution_count' | 'success_count' | 'error_count'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('integration_actions')
        .insert([{
          ...action,
          execution_count: 0,
          success_count: 0,
          error_count: 0
        }]);

      if (error) {
        console.error('Error creating integration action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception in createIntegrationAction:', error);
      return false;
    }
  }

  async syncTimeEntryToTask(timeEntryId: string, taskId: string): Promise<boolean> {
    try {
      console.log(`Syncing time entry ${timeEntryId} to task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error syncing time entry to task:', error);
      return false;
    }
  }

  async syncExpenseToProject(expenseId: string, projectId: string): Promise<boolean> {
    try {
      console.log(`Syncing expense ${expenseId} to project ${projectId}`);
      return true;
    } catch (error) {
      console.error('Error syncing expense to project:', error);
      return false;
    }
  }

  async generateTimeEntryFromTask(taskId: string): Promise<any | null> {
    try {
      const newTimeEntry = {
        id: crypto.randomUUID(),
        user_id: 'mock-user-id',
        project_id: 'mock-project-id',
        task_id: taskId,
        description: `Time entry for task ${taskId}`,
        start_time: new Date().toISOString(),
        end_time: null,
        duration: 0,
        created_at: new Date().toISOString()
      };

      return newTimeEntry;
    } catch (error) {
      console.error('Error generating time entry from task:', error);
      return null;
    }
  }

  async executeIntegrationAction(actionId: string): Promise<boolean> {
    try {
      console.log(`Executing integration action ${actionId}`);
      
      // Update execution count using regular update since RPC might not exist
      const { error } = await supabase
        .from('integration_actions')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: supabase.raw('execution_count + 1')
        })
        .eq('id', actionId);

      if (error) {
        console.error('Error updating integration action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error executing integration action:', error);
      return false;
    }
  }
}

export const integrationService = new IntegrationService();
