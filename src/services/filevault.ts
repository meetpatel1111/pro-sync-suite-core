
import { supabase } from "@/integrations/supabase/client";

export interface Folder {
  folder_id?: string;
  user_id: string;
  folder_name: string;
  description?: string;
  parent_folder_id?: string;
  created_at?: string;
}

export interface File {
  id: string;
  name: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  user_id: string;
  folder_id?: string;
  description?: string;
  is_public: boolean;
  is_archived: boolean;
  created_at: string;
}

export const getAllFolders = async (userId: string) => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('folder_name', { ascending: true });

  return { data, error };
};

export const createFolder = async (folder: Partial<Folder>) => {
  const { data, error } = await supabase
    .from('folders')
    .insert([folder])
    .select();

  return { data, error };
};

export const deleteFolder = async (folderId: string) => {
  const { data, error } = await supabase
    .from('folders')
    .delete()
    .eq('folder_id', folderId);

  return { data, error };
};

export const uploadFile = async (userId: string, file: File, fileName: string, description: string = '') => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}-${fileName.replace(/\s+/g, '_')}.${fileExt}`;
    
    // Upload file to storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .upload(filePath, file);
    
    if (storageError) throw storageError;
    
    // Get the public URL
    const { data: publicURL } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);
    
    // Record in database
    const fileRecord = {
      name: fileName,
      description,
      file_type: file.type,
      size_bytes: file.size,
      storage_path: filePath,
      public_url: publicURL.publicUrl,
      user_id: userId,
      is_public: false,
      is_archived: false
    };
    
    const { error: dbError } = await supabase
      .from('files')
      .insert([fileRecord]);
    
    if (dbError) throw dbError;
    
    return { success: true };
  } catch (error) {
    console.error('Error in file upload:', error);
    throw error;
  }
};

export const getFiles = async (userId: string, folderId?: string) => {
  let query = supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false);
  
  if (folderId) {
    query = query.eq('folder_id', folderId);
  }
  
  return query.order('created_at', { ascending: false });
};
