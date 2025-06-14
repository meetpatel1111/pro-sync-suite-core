
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, Trash2, Share, Eye, Edit, MoreVertical, 
  Star, Clock, Tag, Users
} from 'lucide-react';
import { FileItem } from '@/services/fileVaultService';

interface FileGridProps {
  files: FileItem[];
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileType: string) => React.ReactNode;
}

const FileGrid: React.FC<FileGridProps> = ({
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
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {files.map(file => (
        <Card key={file.id} className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 space-y-3">
            {/* File Preview/Icon */}
            <div className="bg-muted rounded-md p-4 flex justify-center items-center min-h-[80px] relative">
              {file.file_type.includes('image') && file.storage_path ? (
                <img 
                  src={`/api/files/${file.id}/preview`} 
                  alt={file.name}
                  className="max-w-full max-h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`${file.file_type.includes('image') ? 'hidden' : ''} flex items-center justify-center h-16`}>
                <div className="text-muted-foreground scale-150">
                  {getFileIcon(file.file_type)}
                </div>
              </div>
              
              {/* Version badge */}
              {file.version > 1 && (
                <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                  v{file.version}
                </Badge>
              )}
            </div>

            {/* File Info */}
            <div className="space-y-2">
              <div>
                <h3 className="font-medium truncate text-sm" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
                </p>
              </div>

              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{file.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* App Context */}
              {file.app_context && (
                <Badge variant="outline" className="text-xs">
                  {file.app_context}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onDownload(file.id, file.name)}
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7"
                title="View"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7"
                title="Share"
              >
                <Share className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(file.id)}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileGrid;
