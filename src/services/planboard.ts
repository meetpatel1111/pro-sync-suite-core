
import { supabase } from '@/integrations/supabase/client';

export interface Plan {
  plan_id?: string;
  title: string;
  description?: string;
  user_id: string;
  status: string;
  created_at?: string;
}

export const getAllPlans = async (userId: string) => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createPlan = async (plan: Partial<Plan>) => {
  const { data, error } = await supabase
    .from('plans')
    .insert([plan])
    .select();

  return { data, error };
};

export const deletePlan = async (planId: string) => {
  const { data, error } = await supabase
    .from('plans')
    .delete()
    .eq('plan_id', planId);

  return { data, error };
};
