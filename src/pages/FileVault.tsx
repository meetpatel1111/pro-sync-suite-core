import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, FolderPlus, File, Upload, Search, Filter, Grid, List, 
  Download, Trash2, Share, Eye, Edit, MoreVertical, Star, 
  Clock, Tag, Users, Settings, Activity, Folder, ChevronRight,
  FileText, Image, Video, Music, Archive, Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fileVaultService, FileItem, Folder as FolderType } from '@/services/fileVaultService';
import FileGrid from '@/components/filevault/FileGrid';
import FileList from '@/components/filevault/FileList';
import UploadDialog from '@/components/filevault/UploadDialog';

const FileVault = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [storageUsage, setStorageUsage] = useState({ totalSize: 0, fileCount: 0, byContext: {} });
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: 'Home' }
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    if (user) {
      fetchData();
      fetchStorageUsage();
    }
  }, [user, currentFolderId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch files
      const { data: filesData, error: filesError } = await fileVaultService.getFiles({
        folder_id: currentFolderId || undefined,
        search: searchQuery || undefined
      });

      if (filesError) throw filesError;
      setFiles(filesData || []);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await fileVaultService.getFolders(currentFolderId || undefined);
      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Failed to load files",
        description: "An error occurred while loading your files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const { data, error } = await fileVaultService.getStorageUsage();
      if (error) throw error;
      setStorageUsage(data || { totalSize: 0, fileCount: 0, byContext: {} });
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    }
  };

  const handleFolderClick = async (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    const targetFolderId = newBreadcrumb[newBreadcrumb.length - 1].id;
    setCurrentFolderId(targetFolderId);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { data, error } = await fileVaultService.createFolder(
        newFolderName.trim(),
        currentFolderId || undefined
      );

      if (error) throw error;

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created successfully`,
      });

      setNewFolderName('');
      setCreateFolderDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Failed to create folder",
        description: "An error occurred while creating the folder",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (uploadedFiles: FileItem[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
    fetchStorageUsage();
    toast({
      title: "Files uploaded",
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    });
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const { error } = await fileVaultService.deleteFile(fileId);
      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      fetchStorageUsage();
      
      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Failed to delete file",
        description: "An error occurred while deleting the file",
        variant: "destructive",
      });
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const { data, error } = await fileVaultService.downloadFile(fileId);
      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the file",
        variant: "destructive",
      });
    }
  };

  const getFilteredFiles = () => {
    return files.filter(file => {
      const matchesSearch = !searchQuery || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));

      switch (activeTab) {
        case 'documents':
          return matchesSearch && (
            file.file_type.includes('pdf') ||
            file.file_type.includes('document') ||
            file.file_type.includes('text') ||
            file.file_type.includes('word')
          );
        case 'images':
          return matchesSearch && file.file_type.includes('image');
        case 'videos':
          return matchesSearch && file.file_type.includes('video');
        case 'audio':
          return matchesSearch && file.file_type.includes('audio');
        case 'shared':
          return matchesSearch && file.is_public;
        case 'archived':
          return matchesSearch && file.is_archived;
        case 'recent':
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return matchesSearch && new Date(file.created_at) > weekAgo;
        default:
          return matchesSearch;
      }
    });
  };

  const filteredFiles = getFilteredFiles();
  const storagePercentage = (storageUsage.totalSize / (100 * 1024 * 1024)) * 100; // 100MB limit

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-4 w-4" />;
    if (fileType.includes('video')) return <Video className="h-4 w-4" />;
    if (fileType.includes('audio')) return <Music className="h-4 w-4" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('html')) return <Code className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
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
                Secure document and file management system for your projects
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setCreateFolderDialogOpen(true)}
                className="gap-1"
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </Button>
              <Button 
                onClick={() => setUploadDialogOpen(true)}
                className="gap-1"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Storage Usage */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(storageUsage.totalSize)} / 100 MB
                </span>
              </div>
              <Progress value={Math.min(storagePercentage, 100)} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{storageUsage.fileCount} files</span>
                <span>{(100 - storagePercentage).toFixed(1)}% remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <div key={`breadcrumb-${index}`} className="flex items-center">
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </button>
                {index < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
              </div>
            ))}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search files and folders..." 
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
            </div>
          </div>
        </div>

        {/* File Browser */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Folders */}
                {folders.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
                    <div className={viewMode === 'grid' ? 
                      "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : 
                      "space-y-2"
                    }>
                      {folders.map(folder => (
                        <Card 
                          key={folder.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleFolderClick(folder.id, folder.name)}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <Folder className="h-8 w-8 text-blue-500" />
                            <div className="flex-1">
                              <h4 className="font-medium truncate">{folder.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {folder.shared ? 'Shared' : 'Private'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                {filteredFiles.length === 0 && folders.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No files or folders</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'No files match your search' : 'Upload your first file to get started'}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setUploadDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : viewMode === 'grid' ? (
                  <FileGrid 
                    files={filteredFiles}
                    onDownload={handleFileDownload}
                    onDelete={handleFileDelete}
                    formatFileSize={formatFileSize}
                    getFileIcon={getFileIcon}
                  />
                ) : (
                  <FileList
                    files={filteredFiles}
                    onDownload={handleFileDownload}
                    onDelete={handleFileDelete}
                    formatFileSize={formatFileSize}
                    getFileIcon={getFileIcon}
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Breadcrumb Navigation - Fixed */}
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumb.map((item, index) => (
            <div key={`breadcrumb-${index}`} className="flex items-center">
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </button>
              {index < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        currentFolderId={currentFolderId}
        onUploadComplete={handleFileUpload}
      />

      {/* Create Folder Dialog */}
      {createFolderDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Folder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setCreateFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default FileVault;
