
import { supabase } from '@/integrations/supabase/client';

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

export interface File {
  id: string;
  name: string;
  folder_id: string;
  storage_path: string;
  file_type: string;
  size_bytes: number;
  user_id: string;
  created_at?: string;
}

export const getAllFolders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .is('folder_id', null); // Files with null folder_id are considered folders
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching folders:', error);
    return { error };
  }
};

export const createFolder = async (folderData: Omit<Folder, 'created_at' | 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .insert({
        ...folderData,
        is_folder: true,
        file_type: 'folder',
        size_bytes: 0,
        storage_path: ''
      })
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { error };
  }
};

export const deleteFolder = async (folderId: string) => {
  try {
    // First, delete all files in the folder
    await supabase
      .from('files')
      .delete()
      .eq('folder_id', folderId);
    
    // Then delete the folder
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', folderId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return { error };
  }
};

export const getFilesInFolder = async (folderId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', folderId);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching files in folder:', error);
    return { error };
  }
};

export const uploadFile = async (file: File, folderId: string, userId: string) => {
  try {
    const fileName = `${userId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('filevault')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage
      .from('filevault')
      .getPublicUrl(fileName);
    
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        folder_id: folderId,
        storage_path: fileName,
        file_type: file.type,
        size_bytes: file.size,
        user_id: userId,
        url: urlData.publicUrl
      })
      .select()
      .single();
    
    if (fileError) throw fileError;
    
    return { data: fileData };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error };
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    // Get the file info to find the storage path
    const { data: fileInfo, error: fetchError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    if (fileInfo.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('filevault')
        .remove([fileInfo.storage_path]);
      
      if (storageError) throw storageError;
    }
    
    // Delete from database
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    
    if (error) throw error;
    
    return { data };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
};

export default {
  getAllFolders,
  createFolder,
  deleteFolder,
  getFilesInFolder,
  uploadFile,
  deleteFile
};
