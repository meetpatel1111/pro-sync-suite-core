
import { supabase } from '@/integrations/supabase/client';

// Better-typed interfaces
interface FileRecord {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  storage_path: string;
  size_bytes: number;
  is_public: boolean;
  is_archived: boolean;
  user_id: string;
  project_id?: string;
  task_id?: string;
  channel_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface FileUploadParams {
  file: File;
  userId: string;
  isPublic?: boolean;
  description?: string;
  projectId?: string;
  taskId?: string;
  channelId?: string;
}

// Helper for error handling
const handleError = (error: any) => {
  console.error('FileVault service error:', error);
  return { error, data: null };
};

// Get all files
const getFiles = async (userId: string, filter = '') => {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false);
    
    if (filter === 'public') {
      query = query.eq('is_public', true);
    } else if (filter === 'private') {
      query = query.eq('is_public', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Get files by project
const getFilesByProject = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Get files by task
const getFilesByTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('task_id', taskId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Upload file to storage
const uploadFileToStorage = async (fileParams: FileUploadParams) => {
  try {
    const { file, userId } = fileParams;
    
    // Generate path for the file
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `${userId}/${fileName}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file as any);
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);
    
    // Create a record in the database
    const fileRecord: Omit<FileRecord, 'id'> = {
      name: file.name, 
      file_type: file.type || fileExt || 'application/octet-stream',
      size_bytes: file.size || 0,
      storage_path: filePath,
      is_public: fileParams.isPublic || false,
      is_archived: false,
      user_id: userId,
      project_id: fileParams.projectId,
      task_id: fileParams.taskId,
      channel_id: fileParams.channelId,
      description: fileParams.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single();
    
    if (fileError) throw fileError;
    
    return { data: { ...fileData, publicUrl } };
  } catch (error) {
    return handleError(error);
  }
};

// Update file metadata
const updateFile = async (fileId: string, updates: Partial<FileRecord>) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Archive a file (soft delete)
const archiveFile = async (fileId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .update({
        is_archived: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Hard delete a file
const deleteFile = async (fileId: string) => {
  try {
    // First get the file to know the storage path
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    if (file?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.storage_path]);
      
      if (storageError) {
        console.error('Failed to remove file from storage:', storageError);
        // Continue to delete the record even if storage delete fails
      }
    }
    
    // Delete the database record
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Get a single file by ID
const getFileById = async (fileId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (error) throw error;
    
    // Get the URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(data.storage_path);
    
    return { data: { ...data, publicUrl } };
  } catch (error) {
    return handleError(error);
  }
};

const fileVaultService = {
  getFiles,
  getFilesByProject,
  getFilesByTask,
  uploadFileToStorage,
  updateFile,
  archiveFile,
  deleteFile,
  getFileById
};

export default fileVaultService;
