
// InsightIQ Service API
import axios from 'axios';

export interface Folder {
  folder_id?: string;
  name: string;
  user_id: string;
  parent_folder_id?: string;
  created_at?: string;
}

export interface File {
  file_id?: string;
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
  return axios.get<{ data: Folder[] }>(`/api/filevault/folders?userId=${userId}`);
}

export async function createFolder(folder: Omit<Folder, 'folder_id' | 'created_at'>) {
  return axios.post<{ data: Folder }>(`/api/filevault/folders`, folder);
}

export async function deleteFolder(folder_id: string) {
  return axios.delete<{ data: Folder }>(`/api/filevault/folders/${folder_id}`);
}

// File Functions
export async function getAllFiles(userId: string, folder_id?: string) {
  let url = `/api/filevault/files?userId=${userId}`;
  if (folder_id) {
    url += `&folderId=${folder_id}`;
  }
  return axios.get<{ data: File[] }>(url);
}

export async function uploadFile(file: File, fileData: Blob) {
  const formData = new FormData();
  formData.append('file', fileData);
  formData.append('metadata', JSON.stringify(file));
  
  return axios.post<{ data: File }>('/api/filevault/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export async function deleteFile(file_id: string) {
  return axios.delete<{ data: File }>(`/api/filevault/files/${file_id}`);
}

export async function getFileDownloadUrl(file_id: string) {
  return axios.get<{ url: string }>(`/api/filevault/files/${file_id}/url`);
}
