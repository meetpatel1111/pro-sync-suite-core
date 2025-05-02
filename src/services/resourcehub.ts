
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id?: string;
  name: string;
  role: string;
  user_id: string;
  availability?: string;
  utilization?: number;
  allocation?: number;
  current_project_id?: string;
  created_at?: string;
  schedule?: any;
}

export interface ResourceSkill {
  id?: string;
  resource_id: string;
  skill: string;
  user_id: string;
  created_at?: string;
}

export const getAllResources = async () => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*');
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { error };
  }
};

export const getResourceById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching resource:', error);
    return { error };
  }
};

export const createResource = async (resourceData: Omit<Resource, 'created_at' | 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert(resourceData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { error };
  }
};

export const updateResource = async (id: string, updates: Partial<Resource>) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { error };
  }
};

export const deleteResource = async (id: string) => {
  try {
    // First delete any skills associated with this resource
    await supabase
      .from('resource_skills')
      .delete()
      .eq('resource_id', id);
    
    // Then delete the resource
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { error };
  }
};

export const getResourceSkills = async (resourceId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .select('*')
      .eq('resource_id', resourceId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching resource skills:', error);
    return { error };
  }
};

export const addResourceSkill = async (skillData: Omit<ResourceSkill, 'created_at' | 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .insert(skillData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error adding resource skill:', error);
    return { error };
  }
};

export const removeResourceSkill = async (skillId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .delete()
      .eq('id', skillId);
    
    return { data, error };
  } catch (error) {
    console.error('Error removing resource skill:', error);
    return { error };
  }
};

export default {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourceSkills,
  addResourceSkill,
  removeResourceSkill
};
