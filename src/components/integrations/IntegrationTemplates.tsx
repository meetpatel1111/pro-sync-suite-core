
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Star, 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  Play,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationTemplate } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const IntegrationTemplates: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Productivity', 'Finance', 'Communication', 'Resource Management', 'Data Management'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTemplates = await integrationDatabaseService.getIntegrationTemplates(user.id);
      const publicTemplates = await integrationDatabaseService.getPublicTemplates();
      
      // Combine user templates and public templates, removing duplicates
      const allTemplates = [...userTemplates];
      publicTemplates.forEach(publicTemplate => {
        if (!userTemplates.find(ut => ut.id === publicTemplate.id)) {
          allTemplates.push(publicTemplate);
        }
      });
      
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleUseTemplate = async (template: IntegrationTemplate) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use templates',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create a new workflow based on the template
      await integrationDatabaseService.createAutomationWorkflow({
        user_id: user.id,
        name: `${template.name} Workflow`,
        description: `Auto-generated from template: ${template.name}`,
        trigger_config: template.template_config.trigger || {},
        actions_config: template.template_config.actions || {},
        conditions_config: template.template_config.conditions || {},
        is_active: false,
        execution_count: 0
      });

      // Update template usage count
      await integrationDatabaseService.updateIntegrationTemplate(template.id, {
        downloads: template.downloads + 1
      });

      toast({
        title: 'Template Applied',
        description: `Integration template "${template.name}" has been applied to your workflow builder`,
      });
      
      loadTemplates(); // Refresh to show updated download count
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create templates',
        variant: 'destructive'
      });
      return;
    }

    try {
      await integrationDatabaseService.createIntegrationTemplate({
        user_id: user.id,
        name: 'New Integration Template',
        description: 'A custom integration template',
        category: 'Productivity',
        difficulty: 'Beginner',
        rating: 0,
        downloads: 0,
        apps: [],
        tags: [],
        template_config: {},
        is_public: false,
        is_verified: false
      });

      toast({
        title: 'Template Created',
        description: 'New integration template has been created',
      });
      
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Integration Templates</h3>
          <p className="text-muted-foreground">
            Pre-built integration workflows to get you started quickly
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'All Levels' : difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid or Empty State */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {templates.length === 0 
              ? 'Create your first integration template to get started'
              : 'Try adjusting your search filters'
            }
          </p>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.name}
                      {template.is_verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Apps */}
                  {template.apps.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Connected Apps:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.apps.map(app => (
                          <Badge key={app} variant="outline" className="text-xs">
                            {app}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntegrationTemplates;
