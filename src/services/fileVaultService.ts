import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FileItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  file_type: string;
  mime_type?: string;
  size_bytes: number;
  storage_path: string;
  is_public: boolean;
  is_archived: boolean;
  project_id?: string;
  task_id?: string;
  folder_id?: string;
  version: number;
  app_context?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  created_by: string;
  project_id?: string;
  shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version: number;
  storage_path: string;
  uploaded_at: string;
  uploaded_by: string;
  notes?: string;
  size_bytes: number;
}

export interface FilePermission {
  id: string;
  file_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
  expires_at?: string;
  created_at: string;
}

export interface FileShare {
  id: string;
  file_id: string;
  shared_with: string;
  shared_by: string;
  shared_at: string;
  access_level: 'view' | 'edit';
  link?: string;
  expires_at?: string;
}

export const fileVaultService = {
  // File operations
  async getFiles(filters?: {
    folder_id?: string;
    project_id?: string;
    app_context?: string;
    tags?: string[];
    search?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('files')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (filters?.folder_id) {
        query = query.eq('folder_id', filters.folder_id);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.app_context) {
        query = query.eq('app_context', filters.app_context);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching files:', error);
      return { data: null, error };
    }
  },

  async uploadFile(file: File, metadata: {
    name?: string;
    description?: string;
    folder_id?: string;
    project_id?: string;
    task_id?: string;
    app_context?: string;
    tags?: string[];
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Starting file upload for:', file.name, 'Size:', file.size);

      // Create file path: user_id/folder_id?/filename
      const fileExt = file.name.split('.').pop();
      const fileName = metadata.name || file.name;
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      
      // Simple file path structure
      const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

      console.log('Uploading to path:', filePath);

      // First, let's try to create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const filesBucket = buckets?.find(bucket => bucket.name === 'files');
      
      if (!filesBucket) {
        console.log('Files bucket not found, attempting to create...');
        const { error: bucketError } = await supabase.storage.createBucket('files', {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        });
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
          throw new Error('Storage bucket setup failed');
        }
      }

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Save metadata to database
      const fileData = {
        name: fileName,
        description: metadata.description,
        file_type: file.type,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: filePath,
        is_public: false,
        is_archived: false,
        user_id: user.id,
        folder_id: metadata.folder_id,
        project_id: metadata.project_id,
        task_id: metadata.task_id,
        app_context: metadata.app_context,
        tags: metadata.tags,
        version: 1
      };

      console.log('Saving file metadata:', fileData);

      const { data, error: dbError } = await supabase
        .from('files')
        .insert(fileData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('files').remove([filePath]);
        throw dbError;
      }

      console.log('File metadata saved successfully:', data);

      // Log activity
      await this.logActivity('upload', 'file', data.id, { fileName: fileName });

      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  },

  async downloadFile(fileId: string) {
    try {
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      const { data, error } = await supabase.storage
        .from('files')
        .download(file.storage_path);

      if (error) throw error;

      // Log activity
      await this.logActivity('download', 'file', fileId, { fileName: file.name });

      return { data, error: null };
    } catch (error) {
      console.error('Error downloading file:', error);
      return { data: null, error };
    }
  },

  async deleteFile(fileId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Log activity
      await this.logActivity('delete', 'file', fileId, { fileName: file.name });

      return { error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { error };
    }
  },

  // Folder operations
  async getFolders(parentId?: string, projectId?: string) {
    try {
      let query = supabase
        .from('folders')
        .select('*')
        .order('name');

      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching folders:', error);
      return { data: null, error };
    }
  },

  async createFolder(name: string, parentId?: string, projectId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          parent_id: parentId,
          project_id: projectId,
          created_by: user.id,
          shared: false
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity('create', 'folder', data.id, { folderName: name });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating folder:', error);
      return { data: null, error };
    }
  },

  async deleteFolder(folderId: string) {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      // Log activity
      await this.logActivity('delete', 'folder', folderId, {});

      return { error: null };
    } catch (error) {
      console.error('Error deleting folder:', error);
      return { error };
    }
  },

  // Permission operations
  async getFilePermissions(fileId: string) {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('file_id', fileId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching file permissions:', error);
      return { data: null, error };
    }
  },

  async setFilePermission(fileId: string, userId: string, permission: 'read' | 'write' | 'admin', expiresAt?: string) {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .upsert({
          file_id: fileId,
          user_id: userId,
          permission,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity('permission_set', 'file', fileId, { userId, permission });

      return { data, error: null };
    } catch (error) {
      console.error('Error setting file permission:', error);
      return { data: null, error };
    }
  },

  async removeFilePermission(fileId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('file_permissions')
        .delete()
        .eq('file_id', fileId)
        .eq('user_id', userId);

      if (error) throw error;

      // Log activity
      await this.logActivity('permission_removed', 'file', fileId, { userId });

      return { error: null };
    } catch (error) {
      console.error('Error removing file permission:', error);
      return { error };
    }
  },

  // File sharing
  async shareFile(fileId: string, sharedWithUserId: string, accessLevel: 'view' | 'edit', expiresAt?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('file_shares')
        .insert({
          file_id: fileId,
          shared_with: sharedWithUserId,
          shared_by: user.id,
          access_level: accessLevel,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity('share', 'file', fileId, { sharedWith: sharedWithUserId, accessLevel });

      return { data, error: null };
    } catch (error) {
      console.error('Error sharing file:', error);
      return { data: null, error };
    }
  },

  async getFileShares(fileId: string) {
    try {
      const { data, error } = await supabase
        .from('file_shares')
        .select(`
          *,
          profiles:shared_with (
            full_name
          )
        `)
        .eq('file_id', fileId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching file shares:', error);
      return { data: null, error };
    }
  },

  // File versions
  async getFileVersions(fileId: string) {
    try {
      const { data, error } = await supabase
        .from('file_versions')
        .select(`
          *,
          profiles:uploaded_by (
            full_name
          )
        `)
        .eq('file_id', fileId)
        .order('version', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching file versions:', error);
      return { data: null, error };
    }
  },

  async createFileVersion(fileId: string, file: File, notes?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current file info
      const { data: currentFile, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      // Create new version path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const versionPath = `${user.id}/versions/${fileId}/${timestamp}_v${currentFile.version + 1}.${fileExt}`;

      // Upload new version
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(versionPath, file);

      if (uploadError) throw uploadError;

      // Save version metadata
      const { data: versionData, error: versionError } = await supabase
        .from('file_versions')
        .insert({
          file_id: fileId,
          version: currentFile.version + 1,
          storage_path: versionPath,
          uploaded_by: user.id,
          notes,
          size_bytes: file.size
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update main file version
      const { error: updateError } = await supabase
        .from('files')
        .update({
          version: currentFile.version + 1,
          storage_path: versionPath,
          size_bytes: file.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (updateError) throw updateError;

      // Log activity
      await this.logActivity('version_created', 'file', fileId, { version: currentFile.version + 1, notes });

      return { data: versionData, error: null };
    } catch (error) {
      console.error('Error creating file version:', error);
      return { data: null, error };
    }
  },

  // Activity logging
  async logActivity(action: string, resourceType: string, resourceId: string, metadata: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  // Get activity logs
  async getActivityLogs(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return { data: null, error };
    }
  },

  // Search files
  async searchFiles(query: string, filters?: {
    fileType?: string;
    tags?: string[];
    dateRange?: { start: string; end: string };
    sizeRange?: { min: number; max: number };
  }) {
    try {
      let dbQuery = supabase
        .from('files')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (filters?.fileType) {
        dbQuery = dbQuery.like('file_type', `${filters.fileType}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', filters.tags);
      }

      if (filters?.dateRange) {
        dbQuery = dbQuery
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      if (filters?.sizeRange) {
        dbQuery = dbQuery
          .gte('size_bytes', filters.sizeRange.min)
          .lte('size_bytes', filters.sizeRange.max);
      }

      const { data, error } = await dbQuery;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error searching files:', error);
      return { data: null, error };
    }
  },

  // Get storage usage
  async getStorageUsage() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('files')
        .select('size_bytes, app_context')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (error) throw error;

      const totalSize = data.reduce((sum, file) => sum + file.size_bytes, 0);
      const byContext = data.reduce((acc, file) => {
        const context = file.app_context || 'general';
        acc[context] = (acc[context] || 0) + file.size_bytes;
        return acc;
      }, {} as Record<string, number>);

      return {
        data: {
          totalSize,
          fileCount: data.length,
          byContext
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { data: null, error };
    }
  }
};
