
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';

export const riskRadarService = {
  async getRiskForMessage(messageId: string) {
    // Use a more compatible approach since risk_alerts might not be correctly typed
    try {
      const { data, error } = await safeQueryTable('risk_alerts', query => 
        query.select('*')
            .eq('message_id', messageId)
            .single()
      );

      return { data, error };
    } catch (error) {
      console.error("Error fetching risk alert:", error);
      return { data: null, error };
    }
  }
};
