
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Clock, 
  MessageCircle, 
  Eye,
  FileText,
  Tags,
  Users
} from 'lucide-react';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { KnowledgePage } from '@/types/knowledgenest';
import RichTextEditor from './RichTextEditor';
import PageVersionHistory from './PageVersionHistory';
import CollaborationPanel from './CollaborationPanel';

const KnowledgeNest = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [pages, setPages] = useState<KnowledgePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<KnowledgePage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (user) {
      loadPages();
    }
  }, [user]);

  const loadPages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await knowledgenestService.getPages(user.id);
      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge pages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPages();
      return;
    }

    try {
      const { data, error } = await knowledgenestService.searchPages(searchQuery);
      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error searching pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to search pages',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePage = async (title: string, content: string) => {
    if (!user) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const { data, error } = await knowledgenestService.createPage({
        title,
        slug,
        content,
        author_id: user.id,
        tags: [],
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Page created successfully',
      });

      setShowCreateDialog(false);
      loadPages();
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage || !user) return;

    try {
      const { data, error } = await knowledgenestService.updatePage(selectedPage.id, {
        content: editContent,
        last_edited_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Page saved successfully',
      });

      setIsEditing(false);
      setSelectedPage(data);
      loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Knowledge Base
          </h2>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="flex space-x-2">
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Pages List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pages.map((page) => (
            <Card 
              key={page.id}
              className={`cursor-pointer transition-colors ${
                selectedPage?.id === page.id ? 'ring-2 ring-primary' : 'hover:bg-muted'
              }`}
              onClick={() => {
                setSelectedPage(page);
                setEditContent(page.content || '');
                setIsEditing(false);
              }}
            >
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-1">{page.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>v{page.version}</span>
                  <span>{formatDate(page.updated_at)}</span>
                </div>
                {page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {page.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {page.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{page.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pages found</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          {selectedPage ? (
            <div className="space-y-4">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{selectedPage.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Version {selectedPage.version}</span>
                    <span>Updated {formatDate(selectedPage.updated_at)}</span>
                    <Badge variant="outline">
                      {selectedPage.permissions.visibility}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(true)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCollaboration(!showCollaboration)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comments
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        handleSavePage();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? 'Save' : <><Edit className="h-4 w-4 mr-1" />Edit</>}
                  </Button>
                </div>
              </div>

              {/* Page Content */}
              <RichTextEditor
                content={isEditing ? editContent : selectedPage.content || ''}
                onChange={setEditContent}
                onSave={handleSavePage}
                onViewHistory={() => setShowVersionHistory(true)}
                readOnly={!isEditing}
                showToolbar={isEditing}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Welcome to KnowledgeNest</h2>
                <p className="text-muted-foreground mb-4">
                  Select a page from the sidebar or create a new one to get started.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Collaboration Panel */}
        {showCollaboration && selectedPage && (
          <CollaborationPanel
            pageId={selectedPage.id}
            isVisible={showCollaboration}
          />
        )}
      </div>

      {/* Version History Dialog */}
      {selectedPage && (
        <PageVersionHistory
          pageId={selectedPage.id}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRevert={(version) => {
            loadPages();
            setShowVersionHistory(false);
          }}
        />
      )}

      {/* Create Page Dialog */}
      <CreatePageDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreatePage}
      />
    </div>
  );
};

// Create Page Dialog Component
const CreatePageDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title, content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Page title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your page content..."
            showToolbar={true}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeNest;
