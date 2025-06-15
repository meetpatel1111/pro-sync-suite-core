
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Download, 
  ExternalLink, 
  Filter,
  Zap,
  Clock,
  Users,
  Verified,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  apps: string[];
  features: string[];
  verified: boolean;
  popular: boolean;
  new: boolean;
}

const IntegrationMarketplace: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'automation', label: 'Automation' },
    { value: 'finance', label: 'Finance' },
    { value: 'resource-management', label: 'Resource Management' },
    { value: 'client-management', label: 'Client Management' },
    { value: 'risk-management', label: 'Risk Management' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    loadMarketplaceTemplates();
  }, []);

  const loadMarketplaceTemplates = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from a marketplace API
      // For now, we'll show an empty state
      setTemplates([]);
    } catch (error) {
      console.error('Error loading marketplace templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const installTemplate = async (templateId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to install templates',
        variant: 'destructive'
      });
      return;
    }

    try {
      const success = await integrationService.createIntegrationAction(
        'Marketplace',
        'TemplateEngine',
        'install_template',
        { template_id: templateId, user_id: user.id }
      );

      if (success) {
        toast({
          title: 'Template Installed',
          description: 'Integration template has been added to your account',
        });
      }
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Error',
        description: 'Failed to install template',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Integration Marketplace</h3>
        <p className="text-muted-foreground">
          Discover and install pre-built integration templates
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {difficulties.map(diff => (
            <option key={diff.value} value={diff.value}>{diff.label}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
                <p className="text-muted-foreground mb-4">
                  The integration marketplace is being prepared. Check back soon for templates!
                </p>
                <Button onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'Integration marketplace will be available soon'
                  });
                }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Request Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.verified && (
                          <Verified className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        {template.popular && <Badge variant="secondary">Popular</Badge>}
                        {template.new && <Badge variant="outline">New</Badge>}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{template.downloads}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.apps.map((app) => (
                        <Badge key={app} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 mt-auto">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => installTemplate(template.id)}
                        disabled={!user}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Popular Templates</h3>
              <p className="text-muted-foreground">
                Popular integration templates will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">New Templates</h3>
              <p className="text-muted-foreground">
                Latest integration templates will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-rated">
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Top Rated Templates</h3>
              <p className="text-muted-foreground">
                Highest rated integration templates will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Authentication Required</p>
                <p className="text-sm text-muted-foreground">
                  Please log in to install and use integration templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationMarketplace;
