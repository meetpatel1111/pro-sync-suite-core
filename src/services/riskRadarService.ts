
import { supabase } from '@/integrations/supabase/client';

export const riskRadarService = {
  async getRiskForMessage(messageId: string) {
    // Use a more compatible approach since risk_alerts might not be correctly typed
    try {
      const { data, error } = await supabase
        .from('risk_alerts') // This needs to exist in the DB
        .select('*')
        .eq('message_id', messageId)
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error fetching risk alert:", error);
      return { data: null, error };
    }
  }
};
