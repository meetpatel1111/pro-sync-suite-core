
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  File, 
  Upload, 
  Search, 
  Grid3X3, 
  List,
  Star,
  Share2,
  Download,
  MoreHorizontal,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  Shield,
  Clock,
  Users
} from 'lucide-react';

const FileVault = () => {
  const files = [
    {
      id: 1,
      name: "Project Proposal.pdf",
      type: "pdf",
      size: "2.4 MB",
      modified: "2 hours ago",
      shared: true,
      starred: true,
      icon: FileText
    },
    {
      id: 2,
      name: "Design Assets",
      type: "folder",
      size: "12 items",
      modified: "1 day ago",
      shared: false,
      starred: false,
      icon: FolderOpen
    },
    {
      id: 3,
      name: "Demo Video.mp4",
      type: "video",
      size: "45.2 MB",
      modified: "3 days ago",
      shared: true,
      starred: false,
      icon: Video
    },
    {
      id: 4,
      name: "Background Music.mp3",
      type: "audio",
      size: "8.1 MB",
      modified: "1 week ago",
      shared: false,
      starred: true,
      icon: Music
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return FolderOpen;
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'audio': return Music;
      case 'image': return Image;
      case 'archive': return Archive;
      default: return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'folder': return 'text-blue-500';
      case 'pdf': return 'text-red-500';
      case 'video': return 'text-purple-500';
      case 'audio': return 'text-green-500';
      case 'image': return 'text-orange-500';
      case 'archive': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <AppLayout>
      <GradientBackground variant="purple" className="min-h-screen">
        <div className="p-6 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                FileVault
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Secure document and file management system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ColorfulButton variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </ColorfulButton>
              <ColorfulButton variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                List
              </ColorfulButton>
              <ColorfulButton variant="primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </ColorfulButton>
            </div>
          </div>

          {/* Stats and Search */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search files and folders..." 
                  className="pl-12 h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { label: 'Storage Used', value: '2.4 GB', icon: Shield, color: 'from-purple-500 to-pink-500' },
                { label: 'Shared Files', value: '127', icon: Share2, color: 'from-blue-500 to-cyan-500' },
                { label: 'Recent Activity', value: '8', icon: Clock, color: 'from-green-500 to-teal-500' }
              ].map((stat, index) => (
                <Card key={index} className="p-4 border-0 shadow-lg bg-gradient-to-br from-white/90 to-white/80 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-sm`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-orange-100/80 rounded-t-2xl">
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Upload Files', icon: Upload, color: 'primary' },
                  { label: 'Create Folder', icon: FolderOpen, color: 'secondary' },
                  { label: 'Share Files', icon: Share2, color: 'accent' },
                  { label: 'Recent Files', icon: Clock, color: 'info' }
                ].map((action, index) => (
                  <ColorfulButton 
                    key={index}
                    variant={action.color as any}
                    className="h-20 flex-col gap-2"
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm">{action.label}</span>
                  </ColorfulButton>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Files Grid */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-orange-100/80 rounded-t-2xl">
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-purple-600" />
                Recent Files & Folders
                <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {files.length} Items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file, index) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div 
                      key={file.id}
                      className="p-4 rounded-xl border-2 border-gradient-to-r from-purple-200/50 via-pink-200/50 to-orange-200/50 bg-gradient-to-br from-white via-white/95 to-white/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up group cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 ${getFileColor(file.type)}`}>
                            <FileIcon className="h-8 w-8" />
                          </div>
                          <div className="flex items-center gap-1">
                            {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            {file.shared && <Share2 className="h-4 w-4 text-blue-500" />}
                            <ColorfulButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </ColorfulButton>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                            <span>{file.size}</span>
                            <span>{file.modified}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ColorfulButton variant="outline" size="sm" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </ColorfulButton>
                          <ColorfulButton variant="primary" size="sm" className="flex-1">
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </ColorfulButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </GradientBackground>
    </AppLayout>
  );
};

export default FileVault;
