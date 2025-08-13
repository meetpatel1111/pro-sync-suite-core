
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Search, 
  Star, 
  Play, 
  Filter,
  CheckCircle,
  Clock,
  Zap,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationTemplate } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const IntegrationTemplates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Predefined templates with all required properties
  const predefinedTemplates: IntegrationTemplate[] = [
    {
      id: 'template-1',
      user_id: null,
      name: 'Task-to-Time Tracking',
      description: 'Automatically start time tracking when a task status changes to "In Progress"',
      category: 'Productivity',
      difficulty: 'Beginner',
      apps: ['TaskMaster', 'TimeTrackPro'],
      tags: ['automation', 'time-tracking', 'productivity'],
      template_config: {
        trigger: {
          app: 'TaskMaster',
          event: 'task_status_changed'
        },
        actions: [{
          app: 'TimeTrackPro',
          action: 'start_timer'
        }]
      },
      rating: 4.8,
      downloads: 1250,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 98.5
    },
    {
      id: 'template-2',
      user_id: null,
      name: 'Smart File Organization',
      description: 'Automatically organize uploaded files based on project and file type',
      category: 'File Management',
      difficulty: 'Intermediate',
      apps: ['FileVault', 'TaskMaster'],
      tags: ['files', 'organization', 'automation'],
      template_config: {
        trigger: {
          app: 'FileVault',
          event: 'file_uploaded'
        },
        actions: [{
          app: 'FileVault',
          action: 'organize_by_project'
        }]
      },
      rating: 4.6,
      downloads: 890,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 95.2
    },
    {
      id: 'template-3',
      user_id: null,
      name: 'Team Notification Hub',
      description: 'Send team notifications when important project milestones are reached',
      category: 'Communication',
      difficulty: 'Beginner',
      apps: ['PlanBoard', 'CollabSpace'],
      tags: ['notifications', 'milestones', 'team'],
      template_config: {
        trigger: {
          app: 'PlanBoard',
          event: 'milestone_reached'
        },
        actions: [{
          app: 'CollabSpace',
          action: 'send_team_notification'
        }]
      },
      rating: 4.9,
      downloads: 1560,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 99.1
    },
    {
      id: 'template-4',
      user_id: null,
      name: 'Budget Alert System',
      description: 'Get notified when project budgets exceed thresholds',
      category: 'Finance',
      difficulty: 'Intermediate',
      apps: ['BudgetBuddy', 'CollabSpace'],
      tags: ['budget', 'alerts', 'finance'],
      template_config: {
        trigger: {
          app: 'BudgetBuddy',
          event: 'budget_threshold_exceeded'
        },
        actions: [{
          app: 'CollabSpace',
          action: 'send_alert'
        }]
      },
      rating: 4.7,
      downloads: 670,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 97.3
    },
    {
      id: 'template-5',
      user_id: null,
      name: 'Client Follow-up Automation',
      description: 'Automatically schedule follow-up tasks after client meetings',
      category: 'CRM',
      difficulty: 'Advanced',
      apps: ['ClientConnect', 'TaskMaster'],
      tags: ['crm', 'follow-up', 'automation'],
      template_config: {
        trigger: {
          app: 'ClientConnect',
          event: 'meeting_completed'
        },
        actions: [{
          app: 'TaskMaster',
          action: 'create_follow_up_task'
        }]
      },
      rating: 4.5,
      downloads: 420,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 94.8
    },
    {
      id: 'template-6',
      user_id: null,
      name: 'Daily Report Generator',
      description: 'Generate and send daily productivity reports automatically',
      category: 'Analytics',
      difficulty: 'Advanced',
      apps: ['InsightIQ', 'CollabSpace', 'TimeTrackPro'],
      tags: ['reports', 'analytics', 'productivity'],
      template_config: {
        trigger: {
          app: 'InsightIQ',
          event: 'daily_report_scheduled',
          cron: '0 9 * * *'
        },
        actions: [{
          app: 'InsightIQ',
          action: 'generate_productivity_report'
        }]
      },
      rating: 4.4,
      downloads: 780,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 96.7
    },
    {
      id: 'template-7',
      user_id: null,
      name: 'Resource Allocation Assistant',
      description: 'Automatically assign resources when new projects are created',
      category: 'Resource Management',
      difficulty: 'Intermediate',
      apps: ['PlanBoard', 'ResourceHub'],
      tags: ['resources', 'allocation', 'projects'],
      template_config: {
        trigger: {
          app: 'PlanBoard',
          event: 'project_created'
        },
        actions: [{
          app: 'ResourceHub',
          action: 'auto_assign_resources'
        }]
      },
      rating: 4.6,
      downloads: 550,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 93.4
    },
    {
      id: 'template-8',
      user_id: null,
      name: 'Weekly Team Sync',
      description: 'Schedule and manage weekly team synchronization meetings',
      category: 'Team Management',
      difficulty: 'Beginner',
      apps: ['CollabSpace', 'ClientConnect'],
      tags: ['meetings', 'sync', 'team'],
      template_config: {
        trigger: {
          app: 'CollabSpace',
          event: 'weekly_sync_scheduled',
          cron: '0 10 * * 1'
        },
        actions: [{
          app: 'ClientConnect',
          action: 'schedule_team_meeting'
        }]
      },
      rating: 4.3,
      downloads: 340,
      is_public: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
      last_used_at: null,
      success_rate: 91.2
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [user]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, selectedDifficulty]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      let userTemplates: IntegrationTemplate[] = [];
      if (user) {
        userTemplates = await integrationDatabaseService.getIntegrationTemplates(user.id);
      }
      
      // Combine predefined templates with user templates
      const allTemplates = [...predefinedTemplates, ...userTemplates];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use predefined templates as fallback
      setTemplates(predefinedTemplates);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  };

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
      const success = await integrationDatabaseService.installTemplate(templateId, user.id);
      
      if (success) {
        toast({
          title: 'Template Installed',
          description: 'Template has been installed successfully'
        });
        
        // Update download count locally
        setTemplates(prev => prev.map(template => 
          template.id === templateId 
            ? { ...template, downloads: (template.downloads || 0) + 1 }
            : template
        ));
      } else {
        throw new Error('Installation failed');
      }
    } catch (error) {
      console.error('Error installing template:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install template',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const difficulties = Array.from(new Set(templates.map(t => t.difficulty).filter(Boolean)));

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
            Pre-built automation templates to get you started quickly
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficulties.map(difficulty => (
              <SelectItem key={difficulty} value={difficulty!}>{difficulty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {template.is_verified && (
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Apps */}
              <div>
                <div className="text-sm font-medium mb-2">Connected Apps</div>
                <div className="flex flex-wrap gap-1">
                  {template.apps.map((app, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="text-sm font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-medium">{template.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Download className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{template.downloads || 0}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-sm font-medium">{template.success_rate?.toFixed(1) || 'N/A'}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
              </div>

              {/* Category and Difficulty */}
              <div className="flex items-center justify-between">
                <Badge variant="outline">{template.category}</Badge>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => installTemplate(template.id)}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTemplates;
