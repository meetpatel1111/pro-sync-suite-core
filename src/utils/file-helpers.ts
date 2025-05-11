import { File, FileText, Image, Music, Video, Package, FileCode, Archive } from 'lucide-react';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

export const getFileIcon = (fileType: string, className = 'h-4 w-4') => {
  const type = fileType.toLowerCase();
  
  if (type.includes('image')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('audio')) return Music;
  if (type.includes('pdf') || type.includes('text')) return FileText;
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return Archive;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return FileCode;
  if (type.includes('application')) return Package;
  
  return File;
};

export const getFileType = (file: File): string => {
  return file.type || 'application/octet-stream';
};

export const generateStoragePath = (userId: string, fileName: string): string => {
  const ext = fileName.split('.').pop() || '';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${userId}/${timestamp}-${randomString}.${ext}`;
};
