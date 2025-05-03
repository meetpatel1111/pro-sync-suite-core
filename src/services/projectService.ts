
import { supabase } from '@/integrations/supabase/client';

// Projects functions
const getProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching projects:', error);
    return { data: null, error };
  }
};

const createProject = async (projectData: any) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating project:', error);
    return { data: null, error };
  }
};

const updateProject = async (projectId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating project:', error);
    return { data: null, error };
  }
};

const deleteProject = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting project:', error);
    return { data: null, error };
  }
};

// Export all functions
export const projectService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};

export default projectService;
