
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, Trash2, Share, Eye, Edit, MoreVertical,
  Star, Clock, Tag, Users
} from 'lucide-react';
import { FileItem } from '@/services/fileVaultService';

interface FileListProps {
  files: FileItem[];
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileType: string) => React.ReactNode;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onDelete,
  formatFileSize,
  getFileIcon
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-1">
          <Checkbox />
        </div>
        <div className="col-span-4">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Modified</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* File Rows */}
      {files.map(file => (
        <Card key={file.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <Checkbox />
              </div>

              {/* File Name and Icon */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex-shrink-0 text-muted-foreground">
                  {getFileIcon(file.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate text-sm" title={file.name}>
                      {file.name}
                    </h4>
                    {file.version > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        v{file.version}
                      </Badge>
                    )}
                  </div>
                  {file.description && (
                    <p className="text-xs text-muted-foreground truncate" title={file.description}>
                      {file.description}
                    </p>
                  )}
                  {/* Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {file.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{file.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Size */}
              <div className="col-span-2 text-sm text-muted-foreground">
                {formatFileSize(file.size_bytes)}
              </div>

              {/* Modified Date */}
              <div className="col-span-2 text-sm text-muted-foreground">
                {formatDate(file.updated_at)}
              </div>

              {/* Type and Context */}
              <div className="col-span-2 space-y-1">
                <div className="text-sm text-muted-foreground">
                  {file.file_type.split('/')[1] || file.file_type}
                </div>
                {file.app_context && (
                  <Badge variant="outline" className="text-xs">
                    {file.app_context}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onDownload(file.id, file.name)}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  title="Share"
                >
                  <Share className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => onDelete(file.id)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileList;
