export interface FileItem {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_archived: boolean;
  created_by: string;
  folder_path: string;
  shared_with: string[];
}

export interface FileMetadata {
  name: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  is_public: boolean;
  folder_path: string;
  created_by: string;
}

export interface FileOperationResult<T> {
  data: T | null;
  error: Error | null;
}

export interface FileOperations {
  onDownload: (file: FileItem) => Promise<void>;
  onShare: (file: FileItem) => Promise<void>;
  onDelete: (file: FileItem) => Promise<void>;
}

export interface FileUploadRequest {
  name: string;
  description?: string;
  file: File;
}

export type FileUpdateRequest = Partial<Pick<FileItem, 'name' | 'description' | 'is_public' | 'is_archived' | 'folder_path' | 'shared_with'>>;

export interface FileVaultService {
  uploadFile: (file: File, path: string) => Promise<FileOperationResult<{ path: string }>>;
  downloadFile: (path: string) => Promise<FileOperationResult<Blob>>;
  deleteFile: (path: string) => Promise<FileOperationResult<void>>;
  getFileMetadata: (fileId: string) => Promise<FileOperationResult<FileItem>>;
  updateFileMetadata: (fileId: string, updates: FileUpdateRequest) => Promise<FileOperationResult<void>>;
}
