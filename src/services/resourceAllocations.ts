import { supabase } from '@/integrations/supabase/client';

export interface ResourceAllocation {
  id?: string;
  user_id?: string;
  team: string;
  allocation: number;
  created_at?: string;
}

// CREATE
export async function createResourceAllocation(input: Omit<ResourceAllocation, 'id' | 'created_at' | 'user_id'>, user_id: string) {
  const { data, error } = await supabase
    .from('resource_allocations')
    .insert([{ ...input, user_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// READ (fetch all for user)
export async function getResourceAllocations(user_id: string) {
  const { data, error } = await supabase
    .from('resource_allocations')
    .select('*')
    .eq('user_id', user_id);
  if (error) throw error;
  return data as ResourceAllocation[];
}

// UPDATE
export async function updateResourceAllocation(id: string, updates: Partial<ResourceAllocation>) {
  const { data, error } = await supabase
    .from('resource_allocations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// DELETE
export async function deleteResourceAllocation(id: string) {
  const { error } = await supabase
    .from('resource_allocations')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
