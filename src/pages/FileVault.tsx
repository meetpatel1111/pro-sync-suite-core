
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/context/AuthContext';
import { FilePlus, Lock, Unlock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FileVaultApp from '@/components/FileVaultApp';
import dbService from '@/services/dbService';
import type { File as FileType } from '@/utils/dbtypes';

const FileVault = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [file, setFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await dbService.getFiles(user?.id);
      if (response && response.data) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // We need to make sure uploadFile exists in dbService
      const fileData = {
        file,
        description: fileDescription,
        isPublic: isPublic,
      };
      
      // Fix: First check if uploadFile exists in dbService
      if (!dbService.uploadFile) {
        throw new Error("The uploadFile function is not implemented in dbService");
      }
      
      const result = await dbService.uploadFile(user?.id, fileData);
      
      if (result && result.error) {
        throw new Error(result.error.message || "Upload failed");
      }
      
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully',
      });
      
      // Reset form
      setFile(null);
      setFileDescription('');
      setIsPublic(false);
      
      // Refresh files list
      fetchFiles();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (activeTab === 'public' && !file.is_public) {
      return false;
    }
    
    if (activeTab === 'private' && file.is_public) {
      return false;
    }
    
    if (activeTab === 'archived' && !file.is_archived) {
      return false;
    }
    
    if (activeTab !== 'archived' && file.is_archived) {
      return false;
    }
    
    return true;
  });

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FileVault</h1>
            <p className="text-muted-foreground">
              Securely store and manage your important files
            </p>
          </div>

          <div className="flex justify-between">
            <Input 
              className="max-w-sm" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New File</CardTitle>
                    <CardDescription>Add a new file to your vault</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <div className="flex">
                          <Input 
                            id="file" 
                            type="file" 
                            onChange={handleFileChange} 
                            disabled={uploading}
                          />
                          {file && <FilePlus className="ml-2 h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input 
                          id="description" 
                          placeholder="Describe this file..." 
                          value={fileDescription}
                          onChange={(e) => setFileDescription(e.target.value)}
                          disabled={uploading || !file}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="is-public" 
                          type="checkbox" 
                          className="w-4 h-4"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          disabled={uploading || !file}
                        />
                        <Label htmlFor="is-public" className="cursor-pointer">
                          {isPublic ? (
                            <>
                              <Unlock className="inline-block mr-1 h-4 w-4" /> Public
                            </>
                          ) : (
                            <>
                              <Lock className="inline-block mr-1 h-4 w-4" /> Private
                            </>
                          )}
                        </Label>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploading || !file} 
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : 'Upload File'}
                    </Button>
                  </CardFooter>
                </Card>
                
                {loading ? (
                  <Card className="col-span-full flex justify-center items-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </Card>
                ) : filteredFiles.length === 0 ? (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>No files found</CardTitle>
                      <CardDescription>
                        {searchQuery 
                          ? `No files match "${searchQuery}"`
                          : `Upload your first file to get started`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Start building your secure file repository today.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <FileVaultApp />
                )}
              </div>
            </TabsContent>

            <TabsContent value="public" className="space-y-4">
              <FileVaultApp />
            </TabsContent>
            
            <TabsContent value="private" className="space-y-4">
              <FileVaultApp />
            </TabsContent>
            
            <TabsContent value="archived" className="space-y-4">
              <FileVaultApp />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default FileVault;
