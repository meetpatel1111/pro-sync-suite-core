import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  FolderPlus, 
  Upload, 
  Grid, 
  List, 
  Filter,
  File,
  FileText,
  Image as ImageIcon,
  FileCode,
  ChevronRight,
  Download,
  Share,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Sample file data for demonstration
const fileData = [
  {
    id: 1,
    name: 'Project Requirements.docx',
    type: 'document',
    icon: FileText,
    size: '2.4 MB',
    modified: '2025-04-08',
    modifiedBy: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    shared: true,
    folder: 'Project Documentation',
  },
  {
    id: 2,
    name: 'Brand Assets.zip',
    type: 'archive',
    icon: File,
    size: '15.8 MB',
    modified: '2025-04-05',
    modifiedBy: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    shared: true,
    folder: 'Design Files',
  },
  {
    id: 3,
    name: 'Website Mockup.png',
    type: 'image',
    icon: ImageIcon,
    size: '3.2 MB',
    modified: '2025-04-10',
    modifiedBy: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    shared: false,
    folder: 'Design Files',
  },
  {
    id: 4,
    name: 'API Documentation.pdf',
    type: 'document',
    icon: FileText,
    size: '1.7 MB',
    modified: '2025-04-02',
    modifiedBy: { name: 'Jordan Smith', avatar: '/avatar-3.png', initials: 'JS' },
    shared: true,
    folder: 'Project Documentation',
  },
  {
    id: 5,
    name: 'Database Schema.sql',
    type: 'code',
    icon: FileCode,
    size: '32 KB',
    modified: '2025-04-09',
    modifiedBy: { name: 'Taylor Wong', avatar: '/avatar-4.png', initials: 'TW' },
    shared: false,
    folder: 'Development',
  },
  {
    id: 6,
    name: 'Marketing Strategy.pptx',
    type: 'presentation',
    icon: FileText,
    size: '5.1 MB',
    modified: '2025-04-07',
    modifiedBy: { name: 'Jamie Rivera', avatar: '/avatar-6.png', initials: 'JR' },
    shared: true,
    folder: 'Marketing Materials',
  },
  {
    id: 7,
    name: 'Budget Forecast.xlsx',
    type: 'spreadsheet',
    icon: FileText,
    size: '1.8 MB',
    modified: '2025-04-11',
    modifiedBy: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    shared: true,
    folder: 'Financial',
  },
  {
    id: 8,
    name: 'User Flow Diagram.svg',
    type: 'image',
    icon: ImageIcon,
    size: '245 KB',
    modified: '2025-04-03',
    modifiedBy: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    shared: false,
    folder: 'Design Files',
  },
];

// Sample folders for demonstration
const folders = [
  { id: 1, name: 'Project Documentation', fileCount: 5 },
  { id: 2, name: 'Design Files', fileCount: 12 },
  { id: 3, name: 'Development', fileCount: 8 },
  { id: 4, name: 'Marketing Materials', fileCount: 4 },
  { id: 5, name: 'Financial', fileCount: 3 },
];

const FileVault = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState('grid');
  
  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">FileVault</h1>
          <p className="text-muted-foreground">Secure document and file management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-64">
          <Card className="p-4">
            <div className="space-y-1 mb-4">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <File className="h-4 w-4 mr-2" />
                All Files
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileCode className="h-4 w-4 mr-2" />
                Code & Data
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-medium mb-3">Folders</h3>
            <div className="space-y-1">
              {folders.map(folder => (
                <Button 
                  key={folder.id} 
                  variant="ghost" 
                  className="w-full justify-start"
                  size="sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{folder.name}</span>
                    <Badge variant="outline" className="ml-2">{folder.fileCount}</Badge>
                  </div>
                </Button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Storage</h3>
                <Progress value={68} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  6.8 GB of 10 GB used
                </p>
              </div>
              
              <Button variant="outline" className="w-full" size="sm">
                Manage Storage
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search files..." 
                  className="pl-8"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <div className="border rounded-md flex">
                  <Button 
                    variant={viewMode === 'grid' ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  My Files
                </Button>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  Project Alpha
                </Button>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fileData.map(file => (
                  <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-md bg-primary/10">
                        <file.icon className="h-6 w-6 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-medium mt-3 text-sm">{file.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                      {file.shared && (
                        <Badge variant="outline" className="text-xs">Shared</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={file.modifiedBy.avatar} alt={file.modifiedBy.name} />
                        <AvatarFallback>{file.modifiedBy.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(file.modified)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted text-sm font-medium">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">Modified</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                
                {fileData.map(file => (
                  <div key={file.id} className="grid grid-cols-12 gap-4 p-3 border-t items-center">
                    <div className="col-span-5 flex items-center">
                      <file.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.folder}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{file.size}</div>
                    <div className="col-span-3 flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={file.modifiedBy.avatar} alt={file.modifiedBy.name} />
                        <AvatarFallback>{file.modifiedBy.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{formatDate(file.modified)}</p>
                        <p className="text-xs text-muted-foreground">by {file.modifiedBy.name}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Move</DropdownMenuItem>
                          <DropdownMenuItem>Copy</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default FileVault;
