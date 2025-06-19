
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, RotateCcw, Eye, FileText } from 'lucide-react';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { PageVersion } from '@/types/knowledgenest';
import RichTextEditor from './RichTextEditor';

interface PageVersionHistoryProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  onRevert?: (version: number) => void;
}

const PageVersionHistory: React.FC<PageVersionHistoryProps> = ({
  pageId,
  isOpen,
  onClose,
  onRevert
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && pageId) {
      loadVersions();
    }
  }, [isOpen, pageId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await knowledgenestService.getPageVersions(pageId);
      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version: number) => {
    if (!user) return;

    try {
      const { data, error } = await knowledgenestService.revertToVersion(pageId, version, user.id);
      if (error) throw error;

      toast({
        title: 'Success',
        description: `Reverted to version ${version}`,
      });

      if (onRevert) {
        onRevert(version);
      }
      onClose();
    } catch (error) {
      console.error('Error reverting version:', error);
      toast({
        title: 'Error',
        description: 'Failed to revert to selected version',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Version History
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
          {/* Version List */}
          <div>
            <h3 className="font-semibold mb-3">Versions</h3>
            <ScrollArea className="h-80">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading versions...
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No versions found
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card 
                      key={version.id}
                      className={`cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id ? 'ring-2 ring-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            Version {version.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(version.updated_at)}
                          </span>
                        </div>
                        {version.change_summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {version.change_summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            Editor ID: {version.editor_id.slice(0, 8)}...
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVersion(version);
                                setShowPreview(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevert(version.version);
                              }}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Version Preview */}
          <div>
            <h3 className="font-semibold mb-3">Preview</h3>
            {selectedVersion ? (
              <div className="border rounded-lg h-80 overflow-hidden">
                <RichTextEditor
                  content={selectedVersion.content || ''}
                  onChange={() => {}} // Read-only
                  readOnly={true}
                  showToolbar={false}
                />
              </div>
            ) : (
              <div className="border rounded-lg h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {selectedVersion && (
            <Button onClick={() => handleRevert(selectedVersion.version)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert to Version {selectedVersion.version}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageVersionHistory;
