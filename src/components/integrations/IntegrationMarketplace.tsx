
import React, { useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const templates: IntegrationTemplate[] = [
    {
      id: '1',
      name: 'Task Creation from Slack Messages',
      description: 'Automatically create tasks in TaskMaster when specific keywords are mentioned in Slack messages.',
      category: 'productivity',
      rating: 4.8,
      downloads: 1234,
      difficulty: 'beginner',
      apps: ['CollabSpace', 'TaskMaster'],
      features: ['Auto-detection', 'Keyword filtering', 'Priority assignment'],
      verified: true,
      popular: true,
      new: false
    },
    {
      id: '2',
      name: 'Time Tracking Automation',
      description: 'Start time tracking automatically when tasks move to "In Progress" status.',
      category: 'automation',
      rating: 4.6,
      downloads: 856,
      difficulty: 'intermediate',
      apps: ['TaskMaster', 'TimeTrackPro'],
      features: ['Status-based triggers', 'Auto-start/stop', 'Project mapping'],
      verified: true,
      popular: false,
      new: true
    },
    {
      id: '3',
      name: 'Budget Alert System',
      description: 'Send notifications when project budgets exceed thresholds.',
      category: 'finance',
      rating: 4.5,
      downloads: 432,
      difficulty: 'beginner',
      apps: ['BudgetBuddy', 'CollabSpace'],
      features: ['Threshold monitoring', 'Multi-channel alerts', 'Custom thresholds'],
      verified: false,
      popular: false,
      new: false
    },
    {
      id: '4',
      name: 'Resource Optimization Workflow',
      description: 'Automatically balance resource allocation based on workload and skills.',
      category: 'resource-management',
      rating: 4.9,
      downloads: 289,
      difficulty: 'advanced',
      apps: ['ResourceHub', 'TaskMaster', 'InsightIQ'],
      features: ['ML-based optimization', 'Skills matching', 'Workload balancing'],
      verified: true,
      popular: true,
      new: true
    },
    {
      id: '5',
      name: 'Client Feedback Loop',
      description: 'Automatically collect and route client feedback to relevant project teams.',
      category: 'client-management',
      rating: 4.3,
      downloads: 567,
      difficulty: 'intermediate',
      apps: ['ClientConnect', 'CollabSpace', 'TaskMaster'],
      features: ['Feedback routing', 'Sentiment analysis', 'Response tracking'],
      verified: true,
      popular: false,
      new: false
    },
    {
      id: '6',
      name: 'Risk Assessment Pipeline',
      description: 'Automated risk detection and mitigation workflow across projects.',
      category: 'risk-management',
      rating: 4.7,
      downloads: 193,
      difficulty: 'advanced',
      apps: ['RiskRadar', 'TaskMaster', 'InsightIQ'],
      features: ['Predictive analysis', 'Auto-mitigation', 'Risk scoring'],
      verified: true,
      popular: false,
      new: true
    }
  ];

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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const installTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: 'Integration Installed',
        description: `"${template.name}" has been added to your integrations`,
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

  const popularTemplates = templates.filter(t => t.popular).slice(0, 3);
  const newTemplates = templates.filter(t => t.new).slice(0, 3);
  const topRatedTemplates = templates.sort((a, b) => b.rating - a.rating).slice(0, 3);

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
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => installTemplate(template.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => installTemplate(template.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="top-rated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{template.rating}/5</span>
                    <Button onClick={() => installTemplate(template.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationMarketplace;
