
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

export const isVideoFile = (fileType: string): boolean => {
  return fileType.startsWith('video/');
};

export const isAudioFile = (fileType: string): boolean => {
  return fileType.startsWith('audio/');
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};

export const isDocumentFile = (fileType: string): boolean => {
  return fileType.includes('document') || 
         fileType.includes('word') || 
         fileType.includes('excel') || 
         fileType.includes('powerpoint') ||
         fileType.includes('text');
};

export const getFileTypeCategory = (fileType: string): string => {
  if (isImageFile(fileType)) return 'image';
  if (isVideoFile(fileType)) return 'video';
  if (isAudioFile(fileType)) return 'audio';
  if (isPdfFile(fileType) || isDocumentFile(fileType)) return 'document';
  return 'other';
};

export const generateFilePath = (userId: string, fileName: string, folderId?: string): string => {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (folderId) {
    return `${userId}/${folderId}/${timestamp}_${sanitizedName}`;
  }
  
  return `${userId}/${timestamp}_${sanitizedName}`;
};
