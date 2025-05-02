
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  status?: string;
  level?: string;
  created_at?: string;
}

export async function getAllRisks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data: data as Risk[] };
  } catch (error) {
    console.error('Error fetching risks:', error);
    throw error;
  }
}

export async function createRisk(risk: { project_id: string, title: string }) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert({ ...risk, status: 'open', level: 'medium' })
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Risk };
  } catch (error) {
    console.error('Error creating risk:', error);
    throw error;
  }
}

export async function deleteRisk(id: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting risk:', error);
    throw error;
  }
}
