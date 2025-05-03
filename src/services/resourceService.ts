
import { supabase } from '@/integrations/supabase/client';

// Resource functions
const getResources = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resources:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resources:', error);
    return { data: null, error };
  }
};

const getResourceAllocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resource allocations:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resource allocations:', error);
    return { data: null, error };
  }
};

const getResourceSkills = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('resource_skills')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching resource skills:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching resource skills:', error);
    return { data: null, error };
  }
};

const getTeamMembers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching team members:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching team members:', error);
    return { data: null, error };
  }
};

const createResourceAllocation = async (allocationData: any) => {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert({
        ...allocationData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating resource allocation:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating resource allocation:', error);
    return { data: null, error };
  }
};

// Export all functions
export const resourceService = {
  getResources,
  getResourceAllocations,
  getResourceSkills,
  getTeamMembers,
  createResourceAllocation
};

export default resourceService;
