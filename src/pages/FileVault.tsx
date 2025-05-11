import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { FileGrid } from '@/components/filevault/FileGrid';
import { FileList } from '@/components/filevault/FileList';
import { UploadDialog } from '@/components/filevault/UploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Filter, Grid, List, FolderPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FileItem, FileMetadata } from '@/types/file-vault';
import { formatFileSize, generateStoragePath, getFileType } from '@/utils/file-helpers';
import { 
  uploadFileToVault, 
  getFileVaultItems, 
  updateFileVaultItem, 
  deleteFileVaultItem 
} from '@/services/fileVaultService';

const FileVault: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your files",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await getFileVaultItems(supabase, userData.user.id);
      if (error) throw error;
      
      setFiles(prevFiles => {
        // Compare with previous files to avoid unnecessary updates
        if (JSON.stringify(prevFiles) === JSON.stringify(data)) return prevFiles;
        return data || [];
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Failed to load files",
        description: "An error occurred while loading your files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = useCallback(async (name: string, description: string, file: File) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const storagePath = generateStoragePath(userData.user.id, file.name);
      const fileData: FileMetadata = {
        name: name || file.name,
        description,
        file_type: getFileType(file),
        size_bytes: file.size,
        storage_path: storagePath,
        is_public: false,
        folder_path: '/',
        created_by: userData.user.id
      };

      const { error } = await uploadFileToVault(supabase, fileData, file, storagePath);
      if (error) throw error;

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });

      await fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your file",
        variant: "destructive",
      });
    }
  }, [fetchFiles, toast]);

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('file_vault')
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading your file",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (file: FileItem) => {
    try {
      const { error } = await updateFileVaultItem(supabase, file.id, {
        is_public: !file.is_public
      });

      if (error) throw error;

      toast({
        title: file.is_public ? "File privacy set to private" : "File is now shared",
        description: file.is_public 
          ? "The file is no longer publicly accessible"
          : "The file can now be accessed by others with the link",
      });

      fetchFiles();
    } catch (error) {
      console.error('Error sharing file:', error);
      toast({
        title: "Share failed",
        description: "An error occurred while sharing your file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const { error } = await deleteFileVaultItem(supabase, file.id, file.storage_path);
      if (error) throw error;

      toast({
        title: "File deleted",
        description: "Your file has been deleted successfully",
      });

      setFiles(files.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting your file",
        variant: "destructive",
      });
    }
  };

  const getFilteredFiles = () => {
    return files.filter(file => {
      const matchesSearch = 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      switch (activeTab) {
        case 'documents':
          return matchesSearch && 
            (file.file_type.includes('document') || 
             file.file_type.includes('pdf') || 
             file.file_type.includes('text'));
        case 'images':
          return matchesSearch && file.file_type.includes('image');
        case 'shared':
          return matchesSearch && file.is_public;
        case 'archived':
          return matchesSearch && file.is_archived;
        default:
          return matchesSearch;
      }
    });
  };

  const filteredFiles = getFilteredFiles();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 gap-1" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">FileVault</h1>
            <p className="text-muted-foreground">
              Secure document and file management system
            </p>
          </div>
        </div>

        {/* Search and controls section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? "bg-muted" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              Upload File
            </Button>
          </div>
        </div>

        {/* Files section with tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <p>Loading files...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No files yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first file to get started
                    </p>
                    <Button onClick={() => setUploadDialogOpen(true)}>
                      Upload File
                    </Button>
                  </CardContent>
                </Card>
              ) : viewMode === 'grid' ? (
                <FileGrid
                  files={filteredFiles}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ) : (
                <FileList
                  files={filteredFiles}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />
    </AppLayout>
  );
};

export default FileVault;
