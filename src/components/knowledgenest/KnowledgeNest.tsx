import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
  Star,
  Filter,
  Grid,
  List,
  Bookmark,
  Share2
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritePages, setFavoritePages] = useState<string[]>([]);

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

  const toggleFavorite = (pageId: string) => {
    setFavoritePages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <div className="w-80 border-r bg-white/80 backdrop-blur-sm p-6 space-y-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
            Knowledge Base
          </h2>
          <Button size="sm" onClick={() => setShowCreateDialog(true)} className="shadow-sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pages, content, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 shadow-sm"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        {/* Pages List */}
        <div className={`space-y-3 max-h-96 overflow-y-auto ${viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}`}>
          {filteredPages.map((page) => (
            <Card 
              key={page.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPage?.id === page.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:bg-blue-50'
              }`}
              onClick={() => {
                setSelectedPage(page);
                setEditContent(page.content || '');
                setIsEditing(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{page.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(page.id);
                    }}
                    className="p-1 h-6 w-6"
                  >
                    <Star className={`h-3 w-3 ${favoritePages.includes(page.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>v{page.version}</span>
                  <span>{formatDate(page.updated_at)}</span>
                </div>
                {page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
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

        {filteredPages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pages found</p>
          </div>
        )}
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-auto">
          {selectedPage ? (
            <div className="space-y-6">
              {/* Enhanced Page Header */}
              <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedPage.title}</h1>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Version {selectedPage.version}
                    </span>
                    <span>Updated {formatDate(selectedPage.updated_at)}</span>
                    <Badge variant="outline" className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {selectedPage.permissions.visibility}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
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
                    onClick={() => {
                      if (isEditing) {
                        handleSavePage();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className="shadow-sm"
                  >
                    {isEditing ? 'Save Changes' : <><Edit className="h-4 w-4 mr-1" />Edit</>}
                  </Button>
                </div>
              </div>

              {/* Enhanced Page Content */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <RichTextEditor
                  content={isEditing ? editContent : selectedPage.content || ''}
                  onChange={setEditContent}
                  onSave={handleSavePage}
                  onViewHistory={() => setShowVersionHistory(true)}
                  readOnly={!isEditing}
                  showToolbar={isEditing}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-lg p-12 shadow-sm">
                <BookOpen className="h-20 w-20 mx-auto mb-6 text-blue-500" />
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">Welcome to KnowledgeNest</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your centralized knowledge management system. Create, organize, and share knowledge across your team.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="shadow-sm">
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
