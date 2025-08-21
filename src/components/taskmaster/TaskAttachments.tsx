
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Paperclip, Upload, Download, Eye, Trash2, 
  FileText, FileImage, FileVideo, FileAudio, File
} from 'lucide-react';
import { taskmasterService, TaskFile } from '@/services/taskmasterService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TaskAttachmentsProps {
  taskId: string;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTaskFiles();
  }, [taskId]);

  const fetchTaskFiles = async () => {
    try {
      const { data } = await taskmasterService.getTaskFiles(taskId);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching task files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || !user) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(selectedFiles)) {
        // In a real implementation, you would upload to your storage service
        // For now, we'll simulate with a data URL
        const fileUrl = URL.createObjectURL(file);
        
        const { data, error } = await taskmasterService.uploadTaskFile(
          taskId,
          {
            file_url: fileUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size
          },
          user.id
        );

        if (error) {
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'File Uploaded',
            description: `${file.name} uploaded successfully`,
          });
        }
      }
      
      fetchTaskFiles(); // Refresh the list
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload Error',
        description: 'An error occurred while uploading files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-5 w-5" />;
    
    if (fileType.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-600" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-600" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-green-600" />;
    if (fileType.includes('text/') || fileType.includes('document')) return <FileText className="h-5 w-5 text-orange-600" />;
    
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({files.length})
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {file.file_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
                  {file.file_type && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {files.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No attachments yet</p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload files
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskAttachments;
