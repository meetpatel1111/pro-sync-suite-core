
import { supabase } from '@/integrations/supabase/client';

// Risks functions
const getRisks = async (userId: string, projectId?: string) => {
  try {
    let query = supabase.from('risks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risks:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching risks:', error);
    return { data: null, error };
  }
};

const createRisk = async (riskData: any) => {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert(riskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating risk:', error);
    return { data: null, error };
  }
};

const updateRisk = async (riskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', riskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating risk:', error);
    return { data: null, error };
  }
};

// Export all functions
export const riskService = {
  getRisks,
  createRisk,
  updateRisk
};

export default riskService;
