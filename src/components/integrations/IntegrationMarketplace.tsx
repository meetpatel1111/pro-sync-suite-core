
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download, 
  Star, 
  Filter, 
  Zap, 
  Globe, 
  Clock,
  Users,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IntegrationMarketplace = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter, difficultyFilter]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_templates')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
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

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.apps.some(app => app.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(template => template.difficulty === difficultyFilter);
    }

    setFilteredTemplates(filtered);
  };

  const installTemplate = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to install templates',
          variant: 'destructive'
        });
        return;
      }

      // Check if already installed
      const { data: existing } = await supabase
        .from('marketplace_installations')
        .select('id')
        .eq('user_id', user.id)
        .eq('template_id', templateId)
        .single();

      if (existing) {
        toast({
          title: 'Already Installed',
          description: 'This template is already installed',
          variant: 'destructive'
        });
        return;
      }

      // Install template
      const { error: installError } = await supabase
        .from('marketplace_installations')
        .insert({
          user_id: user.id,
          template_id: templateId,
          is_active: true
        });

      if (installError) throw installError;

      // Increment download count
      const { error: updateError } = await supabase.rpc('increment_template_downloads', {
        template_id: templateId
      });

      if (updateError) console.error('Error updating download count:', updateError);

      await loadTemplates();

      toast({
        title: 'Template Installed',
        description: 'Integration template has been installed successfully'
      });
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install template',
        variant: 'destructive'
      });
    }
  };

  const categories = [...new Set(templates.map(t => t.category))];
  const difficulties = [...new Set(templates.map(t => t.difficulty))];

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
          <h2 className="text-2xl font-bold">Integration Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install pre-built integration templates
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredTemplates.length} templates available
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficulties.map(difficulty => (
              <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
                {template.is_verified && (
                  <Badge className="bg-blue-100 text-blue-700 ml-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Apps */}
              <div>
                <div className="text-sm font-medium mb-2">Connected Apps:</div>
                <div className="flex flex-wrap gap-1">
                  {template.apps.map((app, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>{template.downloads}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{template.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{template.success_rate?.toFixed(0) || 100}%</span>
                </div>
              </div>

              {/* Category and Difficulty */}
              <div className="flex justify-between items-center">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant={
                  template.difficulty === 'Beginner' ? 'default' :
                  template.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                }>
                  {template.difficulty}
                </Badge>
              </div>

              {/* Install Button */}
              <Button 
                className="w-full" 
                onClick={() => installTemplate(template.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Install Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new templates
          </p>
        </Card>
      )}
    </div>
  );
};

export default IntegrationMarketplace;
