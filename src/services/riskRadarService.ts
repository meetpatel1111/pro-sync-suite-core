import { supabase } from '@/integrations/supabase/client';

export const riskRadarService = {
  async getRiskForMessage(messageId: string) {
    // Example: join risk_alerts with messages
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('message_id', messageId)
      .single();
    return { data, error };
  }
};
