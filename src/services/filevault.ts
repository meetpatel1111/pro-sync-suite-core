
// InsightIQ Service API
import { supabase } from '@/integrations/supabase/client';

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_id?: string;
  created_at?: string;
}

export interface File {
  id: string;
  name: string;
  user_id: string;
  folder_id?: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  created_at?: string;
}

// Folder Functions
export async function getAllFolders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);
    
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

// File Functions
export async function getAllFiles(userId: string, folder_id?: string) {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
    
    if (folder_id) {
      query = query.eq('folder_id', folder_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

export async function uploadFile(file: Omit<File, 'id' | 'created_at'>, fileData: Blob) {
  try {
    // Upload file to storage
    const filePath = `${file.user_id}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage
      .from('files')
      .upload(filePath, fileData);
    
    if (storageError) throw storageError;
    
    // Create file record in database
    const fileRecord = {
      ...file,
      storage_path: filePath
    };
    
    const { data, error } = await supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(id: string) {
  try {
    // Get file record
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileData.storage_path]);
    
    if (storageError) throw storageError;
    
    // Delete file record
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileDownloadUrl(id: string) {
  try {
    // Get file record
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Get download URL
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(fileData.storage_path, 60 * 60); // 1 hour expiry
    
    if (error) throw error;
    return { url: data.signedUrl };
  } catch (error) {
    console.error('Error getting file download URL:', error);
    throw error;
  }
}
