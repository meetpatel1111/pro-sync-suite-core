import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuthContext } from '@/context/AuthContext';
import fileService from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';

const FileVault = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    projectId: '',
    type: '',
    isArchived: false
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await fileService.getFiles(user.id);
        if (response && response.data) {
          setFiles(response.data);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch files',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user?.id, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || !user?.id) return;
    
    const file = fileList[0];
    
    try {
      const fileData = {
        userId: user.id,
        name: file.name,
        type: file.type,
        size: file.size,
        projectId: filter.projectId || undefined,
        description: '',
        isPublic: false
      };
      
      const response = await fileService.uploadFile(fileData);
      
      if (response && response.data) {
        setFiles(prev => [response.data, ...prev]);
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
      } else if (response && response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">FileVault</h1>
        {/* FileVault components would go here */}
        <p>This is the file management component.</p>
      </div>
    </AppLayout>
  );
};

export default FileVault;
