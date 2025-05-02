
import { supabase } from '@/integrations/supabase/client';

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

export async function getAllFolders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
}

export async function createFolder(folder: Omit<Folder, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert(folder)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

export async function deleteFolder(id: string) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
}
