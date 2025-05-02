
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  availability: string;
  utilization: number;
  skills: string[];
  user_id: string;
  created_at?: string;
}

export async function getAllResources(userId: string) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data: data as Resource[] };
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

export async function createResource(resource: Omit<Resource, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Resource };
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

export async function deleteResource(id: string) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
}
