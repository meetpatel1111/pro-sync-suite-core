
// PlanBoard Service API
import { supabase } from '@/integrations/supabase/client';

export interface Plan {
  id: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  plan_type?: string;
}

// Plan Functions
export async function getAllPlans(userId: string) {
  try {
    // Join with projects to get only plans for projects owned by this user
    const { data, error } = await supabase
      .from('plans')
      .select(`
        *,
        projects:project_id (user_id)
      `)
      .eq('projects.user_id', userId);
    
    if (error) throw error;
    
    // Extract just the plan data
    const plans = data.map(item => ({
      id: item.id,
      project_id: item.project_id,
      start_date: item.start_date,
      end_date: item.end_date,
      plan_type: item.plan_type
    }));
    
    return { data: plans };
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function createPlan(plan: Omit<Plan, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert(plan)
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
