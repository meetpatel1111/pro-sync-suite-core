
import { supabase } from '@/integrations/supabase/client';

// FileVault functions
const getFiles = async (userId: string, filters?: any) => {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.type) {
        query = query.eq('file_type', filters.type);
      }
      if (filters.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching files:', error);
    return { data: null, error };
  }
};

const uploadFile = async (fileData: any) => {
  try {
    // In a real implementation, we would upload to storage and then record in the database
    // This is a mock implementation for now
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: fileData.name,
        file_type: fileData.type,
        size_bytes: fileData.size,
        user_id: fileData.userId,
        storage_path: `files/${fileData.userId}/${fileData.name}`,
        project_id: fileData.projectId,
        is_public: fileData.isPublic || false,
        description: fileData.description || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while uploading file:', error);
    return { data: null, error };
  }
};

// Export all functions
export const fileService = {
  getFiles,
  uploadFile
};

export default fileService;
