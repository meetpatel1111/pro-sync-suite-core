import { supabase } from '@/integrations/supabase/client';

export const budgetBuddyService = {
  async getApproval(approvalId: string) {
    // Try expense_approvals, file_approvals, etc. as needed
    const { data, error } = await supabase.from('expense_approvals').select('*').eq('id', approvalId).single();
    return { data, error };
  }
};
