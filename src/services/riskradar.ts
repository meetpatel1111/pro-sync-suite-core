
// RiskRadar Service API
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  title: string;
  description?: string;
  status?: string;
  level?: string;
  project_id?: string;
  task_id?: string;
  created_at?: string;
}

// Risk Functions
export async function getAllRisks(userId: string) {
  try {
    // Join with projects to get only risks for projects owned by this user
    const { data, error } = await supabase
      .from('risks')
      .select(`
        *,
        projects:project_id (user_id)
      `)
      .eq('projects.user_id', userId);
    
    if (error) throw error;
    
    // Extract just the risk data
    const risks = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      level: item.level,
      project_id: item.project_id,
      task_id: item.task_id,
      created_at: item.created_at
    }));
    
    return { data: risks };
  } catch (error) {
    console.error('Error fetching risks:', error);
    throw error;
  }
}

export async function createRisk(risk: Omit<Risk, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .insert(risk)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating risk:', error);
    throw error;
  }
}

export async function getRiskById(id: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching risk:', error);
    throw error;
  }
}

export async function updateRisk(id: string, updates: Partial<Risk>) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating risk:', error);
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
