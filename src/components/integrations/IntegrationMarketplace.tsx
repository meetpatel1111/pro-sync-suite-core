import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ShoppingCart,
  Eye,
  AlertCircle,
  Shield,
  BarChart3,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  TestTube,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationTemplate, MarketplaceInstallation } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';
import TemplateValidator from './TemplateValidator';
import TemplateTestRunner from './TemplateTestRunner';

const IntegrationMarketplace: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingTemplate, setPreviewingTemplate] = useState<IntegrationTemplate | null>(null);
  const [validatingTemplate, setValidatingTemplate] = useState<IntegrationTemplate | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<IntegrationTemplate | null>(null);

  const categories = ['all', 'Productivity', 'Finance', 'Communication', 'Resource Management', 'Data Management', 'Project Management', 'Risk Management'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      console.log('Loading marketplace data...');
      
      const publicTemplates = await integrationDatabaseService.getPublicTemplates();
      console.log('Loaded public templates:', publicTemplates);
      setTemplates(publicTemplates || []);
      
      if (user) {
        const userInstallations = await integrationDatabaseService.getMarketplaceInstallations(user.id);
        console.log('Loaded user installations:', userInstallations);
        setInstallations(userInstallations || []);
      } else {
        setInstallations([]);
      }
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
      await integrationDatabaseService.createMarketplaceInstallation({
        user_id: user.id,
        template_id: template.id,
        is_active: true,
        configuration: template.template_config
      });

      await integrationDatabaseService.createAutomationWorkflow({
        user_id: user.id,
        name: `${template.name}`,
        description: template.description || `Auto-generated from marketplace template: ${template.name}`,
        trigger_config: template.template_config.trigger || {},
        actions_config: template.template_config.actions || {},
        conditions_config: template.template_config.conditions || {},
        is_active: true,
        execution_count: 0
      });

      await integrationDatabaseService.updateIntegrationTemplate(template.id, {
        downloads: template.downloads + 1
      });

      toast({
        title: 'Template Installed Successfully',
        description: `"${template.name}" has been installed and activated in your workflows`,
      });
      
      loadMarketplaceData();
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install template. Please try again.',
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

  const handlePreviewTemplate = (template: IntegrationTemplate) => {
    setPreviewingTemplate(template);
  };

  const handleValidateTemplate = (template: IntegrationTemplate) => {
    setValidatingTemplate(template);
  };

  const handleTestTemplate = (template: IntegrationTemplate) => {
    setTestingTemplate(template);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Productivity': return <Zap className="h-4 w-4" />;
      case 'Finance': return <DollarSign className="h-4 w-4" />;
      case 'Communication': return <MessageSquare className="h-4 w-4" />;
      case 'Resource Management': return <Users className="h-4 w-4" />;
      case 'Data Management': return <FileText className="h-4 w-4" />;
      case 'Project Management': return <Calendar className="h-4 w-4" />;
      case 'Risk Management': return <Shield className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderValidationModal = () => {
    if (!validatingTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">Validate Template: {validatingTemplate.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setValidatingTemplate(null)}
              >
                ×
              </Button>
            </div>
            
            <TemplateValidator 
              template={validatingTemplate}
              onValidationComplete={(result) => {
                console.log('Validation completed:', result);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTestModal = () => {
    if (!testingTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">Test Template: {testingTemplate.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTestingTemplate(null)}
              >
                ×
              </Button>
            </div>
            
            <TemplateTestRunner 
              template={testingTemplate}
              onTestComplete={(results) => {
                console.log('Tests completed:', results);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTemplatePreview = () => {
    if (!previewingTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {getCategoryIcon(previewingTemplate.category)}
                  {previewingTemplate.name}
                </h3>
                <p className="text-muted-foreground mt-2">{previewingTemplate.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewingTemplate(null)}
              >
                ×
              </Button>
            </div>

            {/* Template Configuration */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Configuration Overview</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Trigger */}
                    {previewingTemplate.template_config.trigger && (
                      <div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Trigger:</span>
                        <p className="text-sm">
                          When {previewingTemplate.template_config.trigger.app} fires "{previewingTemplate.template_config.trigger.event}" event
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {previewingTemplate.template_config.actions && (
                      <div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Actions:</span>
                        <ul className="text-sm space-y-1 ml-4">
                          {previewingTemplate.template_config.actions.map((action: any, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {action.app}: {action.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Conditions */}
                    {previewingTemplate.template_config.conditions && previewingTemplate.template_config.conditions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Conditions:</span>
                        <p className="text-sm ml-4">
                          {previewingTemplate.template_config.conditions.length} condition(s) configured
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apps Involved */}
              <div>
                <h4 className="font-medium mb-2">Connected Apps</h4>
                <div className="flex flex-wrap gap-2">
                  {previewingTemplate.apps.map(app => (
                    <Badge key={app} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {previewingTemplate.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewingTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              {!isInstalled(previewingTemplate.id) ? (
                <Button 
                  onClick={() => {
                    handleInstallTemplate(previewingTemplate);
                    setPreviewingTemplate(null);
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Template
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Already Installed
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setPreviewingTemplate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
            Browse, validate, and install pre-built integration templates from the community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{templates.length} Templates Available</Badge>
          <Badge variant="secondary">{installations.filter(i => i.is_active).length} Installed</Badge>
        </div>
      </div>

      {/* Installed Templates Section */}
      {installations.filter(i => i.is_active).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Installed Templates
            </CardTitle>
            <CardDescription>Templates you've installed and activated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {installations
                .filter(installation => installation.is_active)
                .map(installation => {
                  const template = templates.find(t => t.id === installation.template_id);
                  if (!template) return null;
                  
                  return (
                    <div key={installation.id} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
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
              placeholder="Search templates by name, description, or tags..."
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
            className="px-3 py-2 border rounded-md bg-background"
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
            className="px-3 py-2 border rounded-md bg-background"
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
            {templates.length === 0 
              ? 'No templates are currently available in the marketplace'
              : 'Try adjusting your search filters to find more templates'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const installed = isInstalled(template.id);
            
            return (
              <Card key={template.id} className={`hover:shadow-lg transition-all duration-200 ${installed ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        {template.name}
                        {template.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {installed && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Installed
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
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
                    {/* Category Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>

                    {/* Apps */}
                    {template.apps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Connected Apps:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.apps.slice(0, 3).map(app => (
                            <Badge key={app} variant="outline" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                          {template.apps.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.apps.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.tags.length - 3} more
                            </Badge>
                          )}
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
                    <div className="space-y-2">
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                      
                      {/* Validation and Testing Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleValidateTemplate(template)}
                          className="flex-1"
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          Validate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestTemplate(template)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {renderTemplatePreview()}
      {renderValidationModal()}
      {renderTestModal()}
    </div>
  );
};

export default IntegrationMarketplace;
