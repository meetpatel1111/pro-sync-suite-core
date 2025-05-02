
import { supabase } from '@/integrations/supabase/client';
import * as dbService from '@/services/dbService';

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
}

export async function getFiles(userId: string) {
  try {
    const { data, error } = await dbService.getFiles(userId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching files:', error);
    return { error };
  }
}

export async function uploadFile(
  userId: string,
  file: File,
  bucketName: string = 'files'
) {
  try {
    // First, upload the file to storage
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data: fileData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the file
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    // Now save the file metadata to the database
    const { data: metaData, error: dbError } = await dbService.saveFile({
      user_id: userId,
      name: file.name,
      file_type: file.type,
      size_bytes: file.size,
      storage_path: fileName,
      is_public: true
    });
    
    if (dbError) throw dbError;
    
    return { data: { ...metaData, url: urlData.publicUrl } };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error };
  }
}

export async function deleteFile(
  fileId: string,
  bucketName: string = 'files'
) {
  try {
    // Get file details first to get storage path
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    if (fileData.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([fileData.storage_path]);
      
      if (storageError) throw storageError;
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) throw dbError;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
}

export default {
  getFiles,
  uploadFile,
  deleteFile
};
