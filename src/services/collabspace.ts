
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
  created_at?: string;
}

export async function getAllWorkspaces(userId: string) {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', userId);
    
    if (error) throw error;
    return { data: data as Workspace[] };
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
}

export async function createWorkspace(workspace: Omit<Workspace, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .insert(workspace)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Workspace };
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
}

export async function updateWorkspace(id: string, updates: Partial<Workspace>) {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Workspace };
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
}

export async function deleteWorkspace(id: string) {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
}
