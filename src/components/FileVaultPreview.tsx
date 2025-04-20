import React, { useEffect, useState } from 'react';
import { fileVaultService } from '../services/fileVaultService';

interface FileVaultPreviewProps {
  fileId: string;
}

// Placeholder for FileVault integration
export const FileVaultPreview: React.FC<FileVaultPreviewProps> = ({ fileId }) => {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Real FileVault API/service call
    fileVaultService.getFile(fileId).then(res => {
      if (res.error) setError(res.error.message);
      else setFile(res.data);
      setLoading(false);
    });
  }, [fileId]);

  if (loading) return <div>Loading file preview...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!file) return <div>No file found.</div>;

  return (
    <div className="filevault-preview" style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
      <strong>{file.name}</strong>
      <div>Uploaded by: {file.uploadedBy}</div>
      <div>
        <a href={file.url} target="_blank" rel="noopener noreferrer">Open File</a>
      </div>
      {/* Optionally, render inline preview for supported types */}
      {file.type.startsWith('image/') && <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: 200 }} />}
      {file.type === 'application/pdf' && (
        <object data={file.url} type="application/pdf" width="100%" height="200">
          <a href={file.url} target="_blank" rel="noopener noreferrer">Open PDF</a>
        </object>
      )}
    </div>
  );
};
