// CollabSpace Service API
// Provides frontend CRUD functions for CollabSpace entities using backend endpoints
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];
type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update'];

export async function getAllWorkspaces(userId: string) {
  return supabase.from('workspaces').select('*').eq('owner_id', userId);
}

export async function createWorkspace(workspace: WorkspaceInsert) {
  return supabase.from('workspaces').insert([workspace]).select('*').single();
}

export async function getWorkspaceById(id: string) {
  return supabase.from('workspaces').select('*').eq('id', id).single();
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate) {
  return supabase.from('workspaces').update(updates).eq('id', id).select('*').single();
}

export async function deleteWorkspace(id: string) {
  return supabase.from('workspaces').delete().eq('id', id);
}
// Repeat for channels, messages, etc.
