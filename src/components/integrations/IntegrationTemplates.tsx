
import React, { useState } from 'react';
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
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  downloads: number;
  apps: string[];
  template: any;
  tags: string[];
}

const IntegrationTemplates: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const templates: IntegrationTemplate[] = [
    {
      id: '1',
      name: 'Task-to-Time Automation',
      description: 'Automatically start time tracking when a task is assigned and stop when completed',
      category: 'Productivity',
      difficulty: 'Beginner',
      rating: 4.8,
      downloads: 1250,
      apps: ['TaskMaster', 'TimeTrackPro'],
      tags: ['automation', 'time-tracking', 'tasks'],
      template: {
        trigger: 'task_assigned',
        actions: ['start_timer', 'notify_user'],
        conditions: ['task_status != completed']
      }
    },
    {
      id: '2',
      name: 'Budget Alert System',
      description: 'Send notifications when project budgets exceed thresholds with automatic reporting',
      category: 'Finance',
      difficulty: 'Intermediate',
      rating: 4.6,
      downloads: 890,
      apps: ['BudgetBuddy', 'CollabSpace', 'InsightIQ'],
      tags: ['budget', 'alerts', 'reporting'],
      template: {
        trigger: 'expense_created',
        actions: ['check_budget', 'send_alert', 'generate_report'],
        conditions: ['budget_usage > 80%']
      }
    },
    {
      id: '3',
      name: 'Client Communication Flow',
      description: 'Automate client updates when project milestones are reached',
      category: 'Communication',
      difficulty: 'Advanced',
      rating: 4.9,
      downloads: 2100,
      apps: ['ClientConnect', 'PlanBoard', 'TaskMaster'],
      tags: ['client', 'communication', 'milestones'],
      template: {
        trigger: 'milestone_completed',
        actions: ['create_report', 'send_client_update', 'schedule_meeting'],
        conditions: ['client_notifications_enabled']
      }
    },
    {
      id: '4',
      name: 'Resource Optimization',
      description: 'Automatically reassign resources based on workload and availability',
      category: 'Resource Management',
      difficulty: 'Advanced',
      rating: 4.7,
      downloads: 650,
      apps: ['ResourceHub', 'TaskMaster', 'PlanBoard'],
      tags: ['resources', 'optimization', 'workload'],
      template: {
        trigger: 'resource_overallocated',
        actions: ['analyze_workload', 'suggest_reallocation', 'notify_manager'],
        conditions: ['utilization > 100%']
      }
    },
    {
      id: '5',
      name: 'File Backup Automation',
      description: 'Automatically backup important files to multiple storage locations',
      category: 'Data Management',
      difficulty: 'Beginner',
      rating: 4.5,
      downloads: 1500,
      apps: ['FileVault', 'InsightIQ'],
      tags: ['backup', 'files', 'storage'],
      template: {
        trigger: 'file_uploaded',
        actions: ['create_backup', 'verify_integrity', 'log_activity'],
        conditions: ['file_size > 10MB']
      }
    }
  ];

  const categories = ['all', 'Productivity', 'Finance', 'Communication', 'Resource Management', 'Data Management'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleUseTemplate = (template: IntegrationTemplate) => {
    toast({
      title: 'Template Applied',
      description: `Integration template "${template.name}" has been applied to your workflow builder`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Integration Templates</h3>
          <p className="text-muted-foreground">
            Pre-built integration workflows to get you started quickly
          </p>
        </div>
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
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

                {/* Tags */}
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

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating}</span>
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

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTemplates;
