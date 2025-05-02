
import { supabase } from '@/integrations/supabase/client';

export interface Plan {
  id: string;
  plan_id?: string; // Handle both id formats
  project_id: string;
  plan_type?: string;
  start_date?: string;
  end_date?: string;
  name?: string; // Add name field to handle API expectations
}

export async function getAllPlans(userId: string) {
  try {
    // Join with projects to get only plans for user's projects
    const { data, error } = await supabase
      .from('plans')
      .select('*, projects!inner(*)')
      .eq('projects.user_id', userId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function createPlan(plan: Omit<Plan, 'id' | 'plan_id'>) {
  try {
    // Generate a UUID for the plan if none is provided
    const planWithId = {
      ...plan,
      id: crypto.randomUUID(), // Add an id field so it satisfies TypeScript
    };
    
    const { data, error } = await supabase
      .from('plans')
      .insert(planWithId)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(id: string, updates: Partial<Plan>) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function deletePlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}
