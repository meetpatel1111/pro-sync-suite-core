
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  project_id?: string;
  task_id?: string;
  description: string;
  level: string;
  status: string;
  created_at?: string;
}

export async function getRisks() {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*');
    
    return { data: data as Risk[], error };
  } catch (error) {
    console.error("Error getting risks:", error);
    return { data: null, error };
  }
}

export async function createRisk(risk: Omit<Risk, "id">) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert(risk)
      .select()
      .single();
    
    return { data: data as Risk, error };
  } catch (error) {
    console.error("Error creating risk:", error);
    return { data: null, error };
  }
}

export async function updateRisk(id: string, risk: Partial<Omit<Risk, "id">>) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .update(risk)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as Risk, error };
  } catch (error) {
    console.error("Error updating risk:", error);
    return { data: null, error };
  }
}

export async function deleteRisk(id: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .delete()
      .eq('id', id);
    
    return { data, error };
  } catch (error) {
    console.error("Error deleting risk:", error);
    return { data: null, error };
  }
}
