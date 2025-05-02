
// ResourceHub Service API
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  role: string;
  availability?: string;
  utilization?: number;
  user_id: string;
  allocation?: number;
  schedule?: Record<string, string>;
  created_at?: string;
}

// Resource Functions
export async function getAllResources(userId: string) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const resources = data.map(item => ({
      id: item.id,
      name: item.name,
      role: item.role,
      availability: item.availability,
      utilization: item.utilization,
      user_id: item.user_id,
      allocation: item.allocation,
      schedule: item.schedule ? JSON.parse(JSON.stringify(item.schedule)) : {},
      created_at: item.created_at
    }));
    
    return { data: resources };
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
    return { data };
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

export async function getResourceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const resource = {
      id: data.id,
      name: data.name,
      role: data.role,
      availability: data.availability,
      utilization: data.utilization,
      user_id: data.user_id,
      allocation: data.allocation,
      schedule: data.schedule ? JSON.parse(JSON.stringify(data.schedule)) : {},
      created_at: data.created_at
    };
    
    return { data: resource };
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
}

export async function updateResource(id: string, updates: Partial<Resource>) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const resource = {
      id: data.id,
      name: data.name,
      role: data.role,
      availability: data.availability,
      utilization: data.utilization,
      user_id: data.user_id,
      allocation: data.allocation,
      schedule: data.schedule ? JSON.parse(JSON.stringify(data.schedule)) : {},
      created_at: data.created_at
    };
    
    return { data: resource };
  } catch (error) {
    console.error('Error updating resource:', error);
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
