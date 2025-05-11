import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileItem } from '@/types/file-vault';
import { formatFileSize, getFileIcon } from '../../utils/file-helpers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Share, Trash2, MoreVertical } from 'lucide-react';

interface FileGridProps {
  files: FileItem[];
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  onDownload,
  onShare,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              {React.createElement(getFileIcon(file.file_type), { className: 'h-16 w-16 text-primary mb-2' })}
              <h3 className="font-medium text-sm truncate w-full text-center mb-1">{file.name}</h3>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)}</p>
              
              <div className="flex items-center justify-center mt-4 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(file)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onShare(file)}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(file)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
