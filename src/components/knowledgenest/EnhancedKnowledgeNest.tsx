import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  History,
  Settings,
  Download,
  Upload,
  TrendingUp,
  Activity,
  Lightbulb,
  Archive,
  Brain,
  Sparkles,
  Wand2
} from 'lucide-react';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { KnowledgePage } from '@/types/knowledgenest';
import RichTextEditor from './RichTextEditor';
import PageVersionHistory from './PageVersionHistory';
import CollaborationPanel from './CollaborationPanel';
import AIContentGenerator from './AIContentGenerator';
import ContentQualityIndicator from './ContentQualityIndicator';

const EnhancedKnowledgeNest = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [pages, setPages] = useState<KnowledgePage[]>([]);
  const [filteredPages, setFilteredPages] = useState<KnowledgePage[]>([]);
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadPages();
    }
  }, [user]);

  useEffect(() => {
    filterPages();
  }, [pages, searchQuery, selectedCategory, selectedVisibility]);

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

  const filterPages = () => {
    let filtered = [...pages];

    if (searchQuery.trim()) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(page => 
        page.app_context === selectedCategory
      );
    }

    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(page => 
        page.permissions.visibility === selectedVisibility
      );
    }

    setFilteredPages(filtered);
  };

  const handleCreatePage = async (title: string, content: string, category: string) => {
    if (!user) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const { data, error } = await knowledgenestService.createPage({
        title,
        slug,
        content,
        author_id: user.id,
        tags: [],
        app_context: category,
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

  const getUniqueCategories = () => {
    const categories = pages.map(page => page.app_context).filter(Boolean);
    return Array.from(new Set(categories));
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="h-3 w-3" />;
      case 'internal': return <Users className="h-3 w-3" />;
      case 'restricted': return <Settings className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const handleAIContentGenerated = (title: string, content: string, category: string) => {
    setShowCreateDialog(true);
    // Auto-fill the create dialog with AI generated content
    setTimeout(() => {
      const titleInput = document.getElementById('title') as HTMLInputElement;
      const contentTextarea = document.querySelector('[data-ai-content]') as HTMLTextAreaElement;
      if (titleInput) titleInput.value = title;
      if (contentTextarea) contentTextarea.value = content;
    }, 100);
  };

  const stats = {
    totalPages: pages.length,
    publishedPages: pages.filter(p => p.is_published).length,
    drafts: pages.filter(p => !p.is_published).length,
    templates: pages.filter(p => p.is_template).length,
    thisWeek: pages.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.created_at) > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with AI Features */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            KnowledgeNest
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered knowledge management and collaboration platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AIContentGenerator onContentGenerated={handleAIContentGenerated} />
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Auto-Tag
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPages}</div>
            <p className="text-xs text-muted-foreground">All knowledge pages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedPages}</div>
            <p className="text-xs text-muted-foreground">Live content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Lightbulb className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.templates}</div>
            <p className="text-xs text-muted-foreground">Reusable content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">New pages created</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="browse">Browse Pages</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pages.slice(0, 5).map((page) => (
                  <div key={page.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                       onClick={() => setSelectedPage(page)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{page.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(page.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getVisibilityIcon(page.permissions.visibility)}
                      <Badge variant="outline" className="text-xs">
                        v{page.version}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tags className="h-5 w-5 mr-2" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(pages.flatMap(page => page.tags)))
                    .slice(0, 15)
                    .map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Enhanced Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search pages, content, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>

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
              </div>
            </CardContent>
          </Card>

          {/* Pages Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <Card key={page.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                      onClick={() => {
                        setSelectedPage(page);
                        setEditContent(page.content || '');
                        setIsEditing(false);
                        setActiveTab('browse');
                      }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-2">{page.title}</CardTitle>
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
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>v{page.version}</span>
                      <span>{formatDate(page.updated_at)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {page.content?.replace(/<[^>]*>/g, '') || 'No content available'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getVisibilityIcon(page.permissions.visibility)}
                          <Badge variant="outline" className="text-xs">
                            {page.permissions.visibility}
                          </Badge>
                        </div>
                        {page.app_context && (
                          <Badge variant="secondary" className="text-xs">
                            {page.app_context}
                          </Badge>
                        )}
                      </div>
                      
                      {page.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {page.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {page.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{page.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredPages.map((page, index) => (
                    <div key={page.id}>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                           onClick={() => {
                             setSelectedPage(page);
                             setEditContent(page.content || '');
                             setIsEditing(false);
                           }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium truncate">{page.title}</h3>
                            <div className="flex items-center space-x-2">
                              {getVisibilityIcon(page.permissions.visibility)}
                              <Badge variant="outline" className="text-xs">
                                v{page.version}
                              </Badge>
                              {page.app_context && (
                                <Badge variant="secondary" className="text-xs">
                                  {page.app_context}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Updated {formatDate(page.updated_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(page.id);
                            }}
                          >
                            <Star className={`h-4 w-4 ${favoritePages.includes(page.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < filteredPages.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No pages found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first knowledge page to get started'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Favorite Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritePages.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No favorite pages yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.filter(page => favoritePages.includes(page.id)).map((page) => (
                    <Card key={page.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedPage(page)}>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{page.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDate(page.updated_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Published Pages</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stats.publishedPages / stats.totalPages) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.publishedPages}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Drafts</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(stats.drafts / stats.totalPages) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.drafts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Templates</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(stats.templates / stats.totalPages) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.templates}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.thisWeek}</div>
                    <p className="text-sm text-muted-foreground">Pages created this week</p>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((stats.publishedPages / stats.totalPages) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Content published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Quality Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Content Quality Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High Quality Pages</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.floor(pages.length * 0.7)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Needs Improvement</span>
                    <Badge variant="secondary">
                      {Math.floor(pages.length * 0.25)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Missing Tags</span>
                    <Badge variant="outline">
                      {pages.filter(p => p.tags.length === 0).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Create API Documentation</p>
                    <p className="text-xs text-muted-foreground">Based on recent development activity</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Update Onboarding Guide</p>
                    <p className="text-xs text-muted-foreground">Last updated 3 months ago</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Archive Outdated Processes</p>
                    <p className="text-xs text-muted-foreground">5 pages haven't been viewed in 6 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Page Viewer/Editor with Quality Indicator */}
      {selectedPage && (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedPage.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Version {selectedPage.version}
                      </span>
                      <span>Updated {formatDate(selectedPage.updated_at)}</span>
                      <Badge variant="outline" className="flex items-center">
                        {getVisibilityIcon(selectedPage.permissions.visibility)}
                        <span className="ml-1">{selectedPage.permissions.visibility}</span>
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
                      <History className="h-4 w-4 mr-1" />
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
                    >
                      {isEditing ? 'Save Changes' : <><Edit className="h-4 w-4 mr-1" />Edit</>}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <RichTextEditor
                  content={isEditing ? editContent : selectedPage.content || ''}
                  onChange={setEditContent}
                  onSave={handleSavePage}
                  onViewHistory={() => setShowVersionHistory(true)}
                  readOnly={!isEditing}
                  showToolbar={isEditing}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Quality Indicator Sidebar */}
          <div className="space-y-4">
            <ContentQualityIndicator 
              content={selectedPage.content || ''} 
              title={selectedPage.title} 
            />
            
            {/* AI Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  AI Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Sparkles className="h-3 w-3" />
                  Summarize
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Tags className="h-3 w-3" />
                  Suggest Tags
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Brain className="h-3 w-3" />
                  Improve Content
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
        categories={getUniqueCategories()}
      />

      {/* Collaboration Panel */}
      {showCollaboration && selectedPage && (
        <CollaborationPanel
          pageId={selectedPage.id}
          isVisible={showCollaboration}
        />
      )}
    </div>
  );
};

// Create Page Dialog Component
const CreatePageDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string, category: string) => void;
  categories: string[];
}> = ({ isOpen, onClose, onCreate, categories }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title, content, category);
      setTitle('');
      setContent('');
      setCategory('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Knowledge Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                placeholder="Enter page title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="process">Process</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your knowledge page content..."
              showToolbar={true}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedKnowledgeNest;
