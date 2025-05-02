import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, FilePlus, Lock, Unlock } from 'lucide-react';

interface FileRecord {
  id: string;
  name: string;
  storage_path: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  is_public: boolean;
  created_at: string;
}

const FileVault = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await dbService.getFiles(user.id);
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Failed to load files",
        description: "An error occurred while loading your files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = (filePath: string) => {
    const { data } = supabase.storage.from('files').getPublicUrl(filePath);
    setFileUrl(data.publicUrl);
    window.open(data.publicUrl, '_blank');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    setUploading(true);
    
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage.from('files').getPublicUrl(filePath);
      
      const fileData = {
        name: file.name,
        storage_path: filePath,
        description: fileDescription,
        file_type: file.type,
        size_bytes: file.size,
        is_public: isPublic
      };
      
      await dbService.createFileRecord(user.id, fileData);
      
      setFileDescription('');
      setIsPublic(false);
      setUploading(false);
      setUploadSuccess(true);
      
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      setUploadError(true);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">File Vault</h1>
          <p className="text-muted-foreground">
            Securely store and manage your files
          </p>
        </div>
        
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">My Files</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Storage</CardTitle>
                <CardDescription>
                  Upload, manage, and share your files securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input 
                    type="file" 
                    id="upload" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e.target.files)} 
                  />
                  <Label htmlFor="upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <label htmlFor="upload" className="flex items-center space-x-2">
                        <FilePlus className="h-4 w-4" />
                        <span>Upload File</span>
                      </label>
                    </Button>
                  </Label>
                  {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {uploadSuccess && <span className="text-green-500">Upload successful!</span>}
                  {uploadError && <span className="text-red-500">Upload failed. Please try again.</span>}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <div className="col-span-3 text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                      Loading files...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="col-span-3 text-center py-8">
                      No files found. Upload your first file!
                    </div>
                  ) : (
                    files.map((file) => (
                      <Card key={file.id} className="bg-muted">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">{file.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          <p>Type: {file.file_type}</p>
                          <p>Size: {(file.size_bytes / 1024).toFixed(2)} KB</p>
                          <p>Uploaded: {new Date(file.created_at).toLocaleDateString()}</p>
                          {file.description && <p>Description: {file.description}</p>}
                        </CardContent>
                        <CardFooter className="justify-between">
                          <Button size="sm" onClick={() => handleFileDownload(file.storage_path)}>
                            <File className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {file.is_public ? (
                            <Button variant="ghost" size="sm">
                              <Unlock className="h-4 w-4 mr-2" />
                              Public
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <Lock className="h-4 w-4 mr-2" />
                              Private
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add File Description</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add File Description</DialogTitle>
                      <DialogDescription>
                        Add a description to your file for better organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input id="description" value={fileDescription} className="col-span-3" onChange={(e) => setFileDescription(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="public" className="text-right">
                          Public
                        </Label>
                        <input type="checkbox" id="public" className="col-span-3" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Vault Settings</CardTitle>
                <CardDescription>
                  Manage your file vault settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Settings will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FileVault;
