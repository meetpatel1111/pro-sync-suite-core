import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, Download, Trash2, Share, Eye, Search, Filter, Grid, List,
  Folder, FolderPlus, File, Image, Video, Music, Archive, FileText,
  Cloud, HardDrive, Activity, Settings, BarChart3, Lock, Globe,
  ChevronRight, Star, Calendar, Tag, User, MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { s3Service } from '@/services/s3Service';

interface FileItem {
  id: string;
  name: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  is_public: boolean;
  is_archived: boolean;
  folder_id?: string;
  project_id?: string;
  task_id?: string;
  app_context?: string;
  tags?: string[];
  description?: string;
  version?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface FolderItem {
  id: string;
  name: string;
  parent_id?: string;
  project_id?: string;
  shared: boolean;
  created_at: string;
  created_by: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  recentActivity: Array<{
    action: string;
    fileName: string;
    timestamp: string;
  }>;
}

const EnhancedFileVault: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalFiles: 0,
    totalSize: 0,
    byType: {},
    recentActivity: []
  });
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: 'Home' }
  ]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
      loadStorageStats();
    }
  }, [user, currentFolderId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .eq('folder_id', currentFolderId || '')
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);

      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('created_by', user?.id)
        .eq('parent_id', currentFolderId || '')
        .order('name');

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Failed to load files",
        description: "An error occurred while loading your files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const { data: allFiles, error } = await supabase
        .from('files')
        .select('file_type, size_bytes, created_at, name')
        .eq('user_id', user?.id);

      if (error) throw error;

      const stats: StorageStats = {
        totalFiles: allFiles?.length || 0,
        totalSize: allFiles?.reduce((sum, file) => sum + file.size_bytes, 0) || 0,
        byType: {},
        recentActivity: []
      };

      // Group by file type
      allFiles?.forEach(file => {
        const type = file.file_type.split('/')[0] || 'other';
        if (!stats.byType[type]) {
          stats.byType[type] = { count: 0, size: 0 };
        }
        stats.byType[type].count++;
        stats.byType[type].size += file.size_bytes;
      });

      // Recent activity (last 10 files)
      stats.recentActivity = allFiles
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(file => ({
          action: 'uploaded',
          fileName: file.name,
          timestamp: file.created_at
        })) || [];

      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || !user) return;

    const uploadPromises = Array.from(selectedFiles).map(async (file) => {
      try {
        // Generate unique file path
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const filePath = `${user.id}/${currentFolderId || 'root'}/${fileName}`;

        // Upload to S3/Supabase storage
        const { success, error } = await s3Service.uploadFile(file, filePath);
        
        if (!success || error) {
          throw new Error(error || 'Upload failed');
        }

        // Save file metadata to database
        const { data: fileData, error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: user.id,
            name: file.name,
            file_type: file.type,
            size_bytes: file.size,
            storage_path: filePath,
            folder_id: currentFolderId,
            is_public: false,
            is_archived: false,
            version: 1
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return fileData;
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        return null;
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const successfulUploads = uploadedFiles.filter(Boolean);

    if (successfulUploads.length > 0) {
      toast({
        title: "Upload successful",
        description: `${successfulUploads.length} file(s) uploaded successfully`,
      });
      loadData();
      loadStorageStats();
    }

    setUploadDialogOpen(false);
  };

  const handleFileDownload = async (file: FileItem) => {
    try {
      const { data, error } = await s3Service.downloadFile(file.storage_path);
      
      if (error || !data) {
        throw new Error(error || 'Download failed');
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Downloading ${file.name}`,
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

  const handleFileDelete = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      // Delete from storage
      await s3Service.deleteFile(file.storage_path);

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      loadStorageStats();

      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the file",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: newFolderName.trim(),
          parent_id: currentFolderId,
          created_by: user.id,
          shared: false
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, data]);
      setNewFolderName('');
      setCreateFolderDialogOpen(false);

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created`,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Failed to create folder",
        description: "An error occurred while creating the folder",
        variant: "destructive",
      });
    }
  };

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
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
            file.file_type.includes('text')
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
        default:
          return matchesSearch;
      }
    });
  };

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
    return <File className="h-4 w-4" />;
  };

  const filteredFiles = getFilteredFiles();

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Storage</p>
                <p className="text-2xl font-bold">{formatFileSize(storageStats.totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">{storageStats.totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Folders</p>
                <p className="text-2xl font-bold">{folders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Recent Activity</p>
                <p className="text-2xl font-bold">{storageStats.recentActivity.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-sm hover:text-primary transition-colors"
              >
                {item.name}
              </button>
              {index < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and View Controls */}
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

      {/* File Browser */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Files</TabsTrigger>
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
                        onClick={() => handleFolderClick(folder)}
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
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : 
                  "space-y-2"
                }>
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="group hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="bg-muted rounded-md p-4 flex justify-center items-center min-h-[80px]">
                          <div className="text-muted-foreground scale-150">
                            {getFileIcon(file.file_type)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium truncate text-sm" title={file.name}>
                            {file.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleFileDownload(file)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleFileDelete(file.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFileVault;