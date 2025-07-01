
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
  Share2,
  BarChart3,
  Brain,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { KnowledgePage } from '@/types/knowledgenest';
import RichTextEditor from './RichTextEditor';
import PageVersionHistory from './PageVersionHistory';
import CollaborationPanel from './CollaborationPanel';
import SmartContentSuggestions from './SmartContentSuggestions';
import ContentAnalytics from './ContentAnalytics';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritePages, setFavoritePages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pages');

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
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <div className="text-muted-foreground">Loading knowledge base...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Sidebar */}
      <div className="w-80 border-r bg-white/80 backdrop-blur-sm p-6 space-y-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3 animate-pulse-glow">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            Knowledge Base
          </h2>
          <Button size="sm" onClick={() => setShowCreateDialog(true)} className="shadow-sm hover-scale">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <TabsTrigger value="pages" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Recent
            </TabsTrigger>
          </TabsList>

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
                  className="hover-scale"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="hover-scale"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="hover-scale">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="pages" className="space-y-3">
            <div className={`max-h-96 overflow-y-auto custom-scrollbar ${viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}`}>
              {filteredPages.map((page, index) => (
                <Card 
                  key={page.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md animate-fade-in ${
                    selectedPage?.id === page.id ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' : 'hover:bg-blue-50'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
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
                        className="p-1 h-6 w-6 hover-scale"
                      >
                        <Star className={`h-3 w-3 ${favoritePages.includes(page.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        v{page.version}
                      </span>
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
          </TabsContent>

          <TabsContent value="favorites" className="space-y-3">
            <div className="text-center py-8 text-muted-foreground animate-fade-in">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No favorite pages yet</p>
              <p className="text-sm">Star pages to add them here</p>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-3">
            <div className="text-center py-8 text-muted-foreground animate-fade-in">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Recent activity will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        {filteredPages.length === 0 && activeTab === 'pages' && (
          <div className="text-center py-8 text-muted-foreground animate-fade-in">
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
              <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm animate-fade-in">
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAnalytics(true)}
                    className="hover-scale"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSuggestions(true)}
                    className="hover-scale"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    AI Assist
                  </Button>
                  <Button variant="outline" size="sm" className="hover-scale">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(true)}
                    className="hover-scale"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCollaboration(!showCollaboration)}
                    className="hover-scale"
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
                    className="shadow-sm hover-scale"
                  >
                    {isEditing ? 'Save Changes' : <><Edit className="h-4 w-4 mr-1" />Edit</>}
                  </Button>
                </div>
              </div>

              {/* Enhanced Page Content */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
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
              <div className="text-center bg-white rounded-lg p-12 shadow-sm animate-scale-in">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-24 h-24 mx-auto mb-6 animate-pulse-glow">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">Welcome to KnowledgeNest</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your centralized knowledge management system. Create, organize, and share knowledge across your team with AI-powered insights.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Collaborative
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Badge>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="shadow-sm hover-scale">
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

      {/* Modals and Dialogs */}
      {selectedPage && (
        <>
          <PageVersionHistory
            pageId={selectedPage.id}
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            onRevert={(version) => {
              loadPages();
              setShowVersionHistory(false);
            }}
          />

          {/* AI Suggestions Modal */}
          <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Content Assistant
                </DialogTitle>
              </DialogHeader>
              <SmartContentSuggestions
                currentContent={selectedPage.content || ''}
                pageContext={{
                  title: selectedPage.title,
                  tags: selectedPage.tags,
                  category: selectedPage.app_context,
                }}
                onApplySuggestion={(suggestion) => {
                  if (suggestion.content) {
                    setEditContent(prev => prev + '\n\n' + suggestion.content);
                    setIsEditing(true);
                  }
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Analytics Modal */}
          <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Content Analytics
                </DialogTitle>
              </DialogHeader>
              <ContentAnalytics pageId={selectedPage.id} />
            </DialogContent>
          </Dialog>
        </>
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
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create New Page
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Page title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
          />
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your page content..."
            showToolbar={true}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} className="hover-scale">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()} className="hover-scale">
              <Target className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeNest;
