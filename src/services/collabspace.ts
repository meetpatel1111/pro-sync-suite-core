
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  workspace_id?: string;
  name: string;
  owner_id: string;
  created_at?: string;
}

export const getAllWorkspaces = async (userId: string) => {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .order('name', { ascending: true });

  return { data, error };
};

export const createWorkspace = async (workspace: Partial<Workspace>) => {
  const { data, error } = await supabase
    .from('workspaces')
    .insert([workspace])
    .select();

  return { data, error };
};

export const deleteWorkspace = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('workspaces')
    .delete()
    .eq('workspace_id', workspaceId);

  return { data, error };
};
