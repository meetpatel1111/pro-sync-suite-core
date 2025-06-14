
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

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StorageUsage {
  totalSize: number;
  fileCount: number;
  byContext: Record<string, number>;
}

export type FileFilterType = 'all' | 'recent' | 'documents' | 'images' | 'videos' | 'audio' | 'shared' | 'archived';

export interface FileSearchFilters {
  fileType?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
}
