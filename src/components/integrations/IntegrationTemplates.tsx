import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Star, 
  Search, 
  Filter,
  Zap,
  Clock,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  Workflow,
  Settings,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  FileBox
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationTemplate } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const IntegrationTemplates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<IntegrationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Workflow className="h-4 w-4" /> },
    { id: 'task-management', name: 'Task Management', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'communication', name: 'Communication', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'file-management', name: 'File Management', icon: <FileBox className="h-4 w-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'automation', name: 'Automation', icon: <Zap className="h-4 w-4" /> },
    { id: 'productivity', name: 'Productivity', icon: <Clock className="h-4 w-4" /> },
    { id: 'collaboration', name: 'Collaboration', icon: <Users className="h-4 w-4" /> },
    { id: 'security', name: 'Security', icon: <Shield className="h-4 w-4" /> }
  ];

  const predefinedTemplates: IntegrationTemplate[] = [
    {
      id: 'task-to-slack',
      name: 'Task to Slack Notifications',
      description: 'Automatically send Slack notifications when tasks are created, updated, or completed',
      category: 'communication',
      difficulty: 'Beginner',
      apps: ['TaskMaster', 'CollabSpace'],
      tags: ['notifications', 'slack', 'real-time'],
      template_config: {
        trigger: { app: 'TaskMaster', event: 'task_updated' },
        actions: [{ app: 'CollabSpace', action: 'send_notification' }]
      },
      rating: 4.8,
      downloads: 1240,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'time-budget-sync',
      name: 'Time Tracking to Budget Sync',
      description: 'Automatically update project budgets when time is logged',
      category: 'task-management',
      difficulty: 'Intermediate',
      apps: ['TimeTrackPro', 'BudgetBuddy'],
      tags: ['budget', 'time-tracking', 'automation'],
      template_config: {
        trigger: { app: 'TimeTrackPro', event: 'time_logged' },
        actions: [{ app: 'BudgetBuddy', action: 'update_expenses' }]
      },
      rating: 4.6,
      downloads: 890,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'file-share-notification',
      name: 'File Share Notifications',
      description: 'Notify team members when files are shared or updated',
      category: 'file-management',
      difficulty: 'Beginner',
      apps: ['FileVault', 'CollabSpace'],
      tags: ['files', 'sharing', 'notifications'],
      template_config: {
        trigger: { app: 'FileVault', event: 'file_shared' },
        actions: [{ app: 'CollabSpace', action: 'notify_team' }]
      },
      rating: 4.7,
      downloads: 650,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'project-milestone-alert',
      name: 'Project Milestone Alerts',
      description: 'Send alerts when project milestones are reached or approaching',
      category: 'analytics',
      difficulty: 'Advanced',
      apps: ['PlanBoard', 'InsightIQ', 'CollabSpace'],
      tags: ['milestones', 'alerts', 'project-management'],
      template_config: {
        trigger: { app: 'PlanBoard', event: 'milestone_approaching' },
        actions: [
          { app: 'InsightIQ', action: 'generate_report' },
          { app: 'CollabSpace', action: 'send_alert' }
        ]
      },
      rating: 4.9,
      downloads: 420,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'resource-overallocation',
      name: 'Resource Overallocation Warning',
      description: 'Alert when team members are overallocated across projects',
      category: 'productivity',
      difficulty: 'Intermediate',
      apps: ['ResourceHub', 'CollabSpace', 'InsightIQ'],
      tags: ['resources', 'capacity', 'warnings'],
      template_config: {
        trigger: { app: 'ResourceHub', event: 'capacity_exceeded' },
        actions: [
          { app: 'CollabSpace', action: 'notify_managers' },
          { app: 'InsightIQ', action: 'create_dashboard_alert' }
        ]
      },
      rating: 4.5,
      downloads: 320,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'client-update-automation',
      name: 'Automated Client Updates',
      description: 'Send weekly project updates to clients automatically',
      category: 'collaboration',
      difficulty: 'Advanced',
      apps: ['ClientConnect', 'InsightIQ', 'PlanBoard'],
      tags: ['client-communication', 'reporting', 'automation'],
      template_config: {
        trigger: { app: 'PlanBoard', event: 'weekly_schedule', cron: '0 9 * * 1' },
        actions: [
          { app: 'InsightIQ', action: 'generate_client_report' },
          { app: 'ClientConnect', action: 'send_update_email' }
        ]
      },
      rating: 4.8,
      downloads: 580,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'risk-assessment-workflow',
      name: 'Automated Risk Assessment',
      description: 'Automatically assess and track project risks',
      category: 'security',
      difficulty: 'Advanced',
      apps: ['RiskRadar', 'TaskMaster', 'CollabSpace'],
      tags: ['risk-management', 'assessment', 'monitoring'],
      template_config: {
        trigger: { app: 'TaskMaster', event: 'task_overdue' },
        actions: [
          { app: 'RiskRadar', action: 'create_risk_assessment' },
          { app: 'CollabSpace', action: 'notify_stakeholders' }
        ]
      },
      rating: 4.6,
      downloads: 280,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'productivity-analytics',
      name: 'Daily Productivity Reports',
      description: 'Generate daily productivity reports combining time and task data',
      category: 'analytics',
      difficulty: 'Intermediate',
      apps: ['TimeTrackPro', 'TaskMaster', 'InsightIQ'],
      tags: ['productivity', 'analytics', 'reporting'],
      template_config: {
        trigger: { app: 'TimeTrackPro', event: 'daily_schedule', cron: '0 18 * * *' },
        actions: [
          { app: 'InsightIQ', action: 'generate_productivity_report' },
          { app: 'CollabSpace', action: 'share_daily_summary' }
        ]
      },
      rating: 4.7,
      downloads: 760,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, selectedDifficulty]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Combine predefined templates with database templates
      const dbTemplates = await integrationDatabaseService.getIntegrationTemplates();
      const allTemplates = [...predefinedTemplates, ...dbTemplates];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(predefinedTemplates); // Fallback to predefined
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => 
        template.difficulty && template.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    setFilteredTemplates(filtered);
  };

  const installTemplate = async (template: IntegrationTemplate) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to install templates',
        variant: 'destructive'
      });
      return;
    }

    try {
      await integrationDatabaseService.installTemplate(template.id, user.id);
      toast({
        title: 'Template Installed',
        description: `${template.name} has been installed successfully`
      });
      
      // Update local state to reflect download count
      setTemplates(prev => 
        prev.map(t => 
          t.id === template.id 
            ? { ...t, downloads: t.downloads + 1 }
            : t
        )
      );
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install template. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(c => c.id === category);
    return categoryObj?.icon || <Workflow className="h-4 w-4" />;
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
          <h2 className="text-2xl font-bold">Integration Templates</h2>
          <p className="text-muted-foreground">
            Pre-built automation templates to jumpstart your workflows
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty || 'Beginner'}
                  </Badge>
                </div>
                {template.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.apps && template.apps.slice(0, 3).map((app) => (
                  <Badge key={app} variant="outline" className="text-xs">
                    {app}
                  </Badge>
                ))}
                {template.apps && template.apps.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.apps.length - 3}
                  </Badge>
                )}
              </div>
              
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{template.downloads}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => installTemplate(template)}
              >
                <Download className="mr-2 h-4 w-4" />
                Install Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or create a new template
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTemplates;
