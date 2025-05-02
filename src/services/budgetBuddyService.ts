
import { supabase } from '@/integrations/supabase/client';

export const budgetBuddyService = {
  async getApproval(approvalId: string) {
    // Use the 'approvals' table instead of 'expense_approvals'
    const { data, error } = await supabase.from('approvals').select('*').eq('id', approvalId).single();
    return { data, error };
  }
};

export default budgetBuddyService;
