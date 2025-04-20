import React from 'react';

interface FilePreviewProps {
  fileUrl: string;
  fileType: string;
  fileName?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, fileType, fileName }) => {
  // Render preview based on common file types
  if (fileType.startsWith('image/')) {
    return <img src={fileUrl} alt={fileName || 'preview'} style={{ maxWidth: '100%', maxHeight: 300 }} />;
  }
  if (fileType === 'application/pdf') {
    return (
      <object data={fileUrl} type="application/pdf" width="100%" height="300">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open PDF</a>
      </object>
    );
  }
  if (fileType.startsWith('video/')) {
    return <video src={fileUrl} controls style={{ maxWidth: '100%', maxHeight: 300 }} />;
  }
  // Fallback for other types
  return (
    <div>
      <span role="img" aria-label="file">📄</span>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileName || 'Download file'}</a>
    </div>
  );
};
