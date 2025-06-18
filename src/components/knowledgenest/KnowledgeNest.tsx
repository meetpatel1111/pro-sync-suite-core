
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Tag, 
  FileText, 
  MessageCircle, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  User
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useToast } from '@/hooks/use-toast';
import type { KnowledgePage } from '@/types/knowledgenest';

const KnowledgeNest: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [pages, setPages] = useState<KnowledgePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [pageForm, setPageForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (user) {
      fetchPages();
    }
  }, [user]);

  const fetchPages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await knowledgenestService.getPages(user.id);
      
      if (error) {
        console.error('Error fetching pages:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch knowledge pages',
          variant: 'destructive',
        });
        return;
      }

      // Convert the database response to our KnowledgePage type
      const typedPages: KnowledgePage[] = (data || []).map(page => ({
        ...page,
        permissions: typeof page.permissions === 'string' 
          ? JSON.parse(page.permissions) 
          : page.permissions || {
              visibility: 'internal' as const,
              editors: [],
              viewers: [],
              commenters: []
            }
      }));

      setPages(typedPages);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const slug = pageForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { data, error } = await knowledgenestService.createPage({
        title: pageForm.title,
        slug,
        content: pageForm.content,
        author_id: user.id,
        tags: pageForm.tags,
        permissions: {
          visibility: 'internal',
          editors: [],
          viewers: [],
          commenters: []
        }
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create page',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const newPage: KnowledgePage = {
          ...data,
          permissions: typeof data.permissions === 'string' 
            ? JSON.parse(data.permissions) 
            : data.permissions || {
                visibility: 'internal' as const,
                editors: [],
                viewers: [],
                commenters: []
              }
        };
        
        setPages(prev => [newPage, ...prev]);
        setCreatePageOpen(false);
        setPageForm({
          title: '',
          content: '',
          tags: [],
          tagInput: ''
        });
        
        toast({
          title: 'Success',
          description: 'Knowledge page created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const handleAddTag = () => {
    if (pageForm.tagInput.trim() && !pageForm.tags.includes(pageForm.tagInput.trim())) {
      setPageForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPageForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">KnowledgeNest</h1>
          <p className="text-muted-foreground">Centralized knowledge base and documentation</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search knowledge pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={createPageOpen} onOpenChange={setCreatePageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Knowledge Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={pageForm.title}
                  onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={pageForm.content}
                  onChange={(e) => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  placeholder="Write your content in Markdown..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={pageForm.tagInput}
                    onChange={(e) => setPageForm(prev => ({ ...prev, tagInput: e.target.value }))}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pageForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setCreatePageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Page</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages">All Pages</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          {filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No pages found' : 'No knowledge pages yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'Create your first knowledge page to get started'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreatePageOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Page
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{page.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Author</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{new Date(page.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {page.permissions.visibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {page.content && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {page.content.substring(0, 150)}...
                      </p>
                    )}
                    
                    {page.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {page.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {page.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{page.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>v{page.version}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Recent Pages</h3>
            <p className="text-muted-foreground">Recently viewed and edited pages will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Page Templates</h3>
            <p className="text-muted-foreground">Reusable page templates will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeNest;
