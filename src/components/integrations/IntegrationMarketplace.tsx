
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
  Plus,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationTemplate, MarketplaceInstallation } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const IntegrationMarketplace: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Productivity', 'Finance', 'Communication', 'Resource Management', 'Data Management'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    if (user) {
      loadMarketplaceData();
    }
  }, [user]);

  const loadMarketplaceData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [publicTemplates, userInstallations] = await Promise.all([
        integrationDatabaseService.getPublicTemplates(),
        integrationDatabaseService.getMarketplaceInstallations(user.id)
      ]);
      
      setTemplates(publicTemplates);
      setInstallations(userInstallations);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace data',
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

  const isInstalled = (templateId: string) => {
    return installations.some(installation => 
      installation.template_id === templateId && installation.is_active
    );
  };

  const handleInstallTemplate = async (template: IntegrationTemplate) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to install templates',
        variant: 'destructive'
      });
      return;
    }

    if (isInstalled(template.id)) {
      toast({
        title: 'Already Installed',
        description: 'This template is already installed',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create marketplace installation record
      await integrationDatabaseService.createMarketplaceInstallation({
        user_id: user.id,
        template_id: template.id,
        is_active: true,
        configuration: template.template_config
      });

      // Create a new workflow based on the template
      await integrationDatabaseService.createAutomationWorkflow({
        user_id: user.id,
        name: `${template.name} (Installed)`,
        description: `Auto-generated from marketplace template: ${template.name}`,
        trigger_config: template.template_config.trigger || {},
        actions_config: template.template_config.actions || {},
        conditions_config: template.template_config.conditions || {},
        is_active: true,
        execution_count: 0
      });

      // Update template download count
      await integrationDatabaseService.updateIntegrationTemplate(template.id, {
        downloads: template.downloads + 1
      });

      toast({
        title: 'Template Installed',
        description: `"${template.name}" has been installed and activated`,
      });
      
      loadMarketplaceData(); // Refresh data
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install template',
        variant: 'destructive'
      });
    }
  };

  const handleUninstallTemplate = async (templateId: string) => {
    if (!user) return;

    try {
      const installation = installations.find(inst => 
        inst.template_id === templateId && inst.is_active
      );

      if (installation) {
        await integrationDatabaseService.updateMarketplaceInstallation(installation.id, {
          is_active: false
        });

        toast({
          title: 'Template Uninstalled',
          description: 'Template has been uninstalled successfully',
        });
        
        loadMarketplaceData();
      }
    } catch (error) {
      console.error('Error uninstalling template:', error);
      toast({
        title: 'Error',
        description: 'Failed to uninstall template',
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
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Integration Marketplace
          </h3>
          <p className="text-muted-foreground">
            Browse and install pre-built integration templates from the community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{templates.length} Templates</Badge>
          <Badge variant="secondary">{installations.filter(i => i.is_active).length} Installed</Badge>
        </div>
      </div>

      {/* Installed Templates */}
      {installations.filter(i => i.is_active).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Installed Templates</CardTitle>
            <CardDescription>Templates you've installed from the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {installations
                .filter(installation => installation.is_active)
                .map(installation => {
                  const template = templates.find(t => t.id === installation.template_id);
                  if (!template) return null;
                  
                  return (
                    <div key={installation.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{template.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUninstallTemplate(template.id)}
                        className="h-6 w-6 p-0 text-green-700 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })
              }
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search filters to find more templates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const installed = isInstalled(template.id);
            
            return (
              <Card key={template.id} className={`hover:shadow-lg transition-shadow ${installed ? 'border-green-200 bg-green-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {installed && (
                          <Badge className="bg-green-100 text-green-800">Installed</Badge>
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
                      {installed ? (
                        <Button 
                          onClick={() => handleUninstallTemplate(template.id)}
                          className="flex-1"
                          size="sm"
                          variant="outline"
                        >
                          Uninstall
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleInstallTemplate(template)}
                          className="flex-1"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IntegrationMarketplace;
