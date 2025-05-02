
import { supabase } from '@/integrations/supabase/client';

export interface ResourceAllocation {
  id: string;
  user_id: string;
  team: string; 
  allocation: number;
  created_at?: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  user_id: string;
  availability?: string;
  utilization?: number;
  allocation?: number;
  created_at?: string;
  current_project_id?: string;
}

export interface ResourceSkill {
  id: string;
  resource_id?: string;
  user_id?: string;
  skill: string;
  created_at?: string;
}

// Get all resource allocations
export async function getAllResourceAllocations() {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .select('*');
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching resource allocations:', error);
    // Return sample data for development
    return { 
      data: [
        { id: '1', user_id: 'user1', team: 'Engineering', allocation: 80, created_at: new Date().toISOString() },
        { id: '2', user_id: 'user2', team: 'Design', allocation: 60, created_at: new Date().toISOString() },
        { id: '3', user_id: 'user3', team: 'Marketing', allocation: 100, created_at: new Date().toISOString() }
      ] 
    };
  }
}

// Create resource allocation
export async function createResourceAllocation(allocation: Omit<ResourceAllocation, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert(allocation)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating resource allocation:', error);
    // Return mock data for development
    return { 
      data: { 
        id: Math.random().toString(), 
        ...allocation, 
        created_at: new Date().toISOString() 
      } 
    };
  }
}

// Get all resources
export async function getAllResources() {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*');
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching resources:', error);
    // Return sample data for development
    return { 
      data: [
        { 
          id: '1', 
          name: 'John Doe', 
          role: 'Developer', 
          user_id: 'user1',
          availability: 'Available', 
          utilization: 75, 
          allocation: 100,
          created_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          role: 'Designer', 
          user_id: 'user2',
          availability: 'Partial', 
          utilization: 50, 
          allocation: 80,
          created_at: new Date().toISOString() 
        }
      ] 
    };
  }
}

// Create resource
export async function createResource(resource: Omit<Resource, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating resource:', error);
    // Return mock data for development
    return { 
      data: { 
        id: Math.random().toString(), 
        ...resource, 
        created_at: new Date().toISOString() 
      } 
    };
  }
}

// Update resource
export async function updateResource(id: string, updates: Partial<Resource>) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { error };
  }
}

// Get resource skills
export async function getResourceSkills(resourceId: string) {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .select('*')
      .eq('resource_id', resourceId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching resource skills:', error);
    // Return mock skills for development
    return { 
      data: [
        { id: '1', resource_id: resourceId, skill: 'React', created_at: new Date().toISOString() },
        { id: '2', resource_id: resourceId, skill: 'TypeScript', created_at: new Date().toISOString() },
        { id: '3', resource_id: resourceId, skill: 'Tailwind CSS', created_at: new Date().toISOString() }
      ] 
    };
  }
}

export default {
  getAllResourceAllocations,
  createResourceAllocation,
  getAllResources,
  createResource,
  updateResource,
  getResourceSkills
};
