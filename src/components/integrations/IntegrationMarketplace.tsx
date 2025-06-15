
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Download } from 'lucide-react';

const IntegrationMarketplace: React.FC = () => {
  const templates = [
    {
      id: '1',
      name: 'Task-Time Sync',
      description: 'Automatically start time tracking when tasks move to "In Progress"',
      category: 'Productivity',
      rating: 4.8,
      downloads: 1200,
      apps: ['TaskMaster', 'TimeTrackPro']
    },
    {
      id: '2',
      name: 'Budget Alert System',
      description: 'Get notifications when project budgets exceed thresholds',
      category: 'Finance',
      rating: 4.6,
      downloads: 850,
      apps: ['BudgetBuddy', 'CollabSpace']
    },
    {
      id: '3',
      name: 'Client Communication Flow',
      description: 'Automatically notify clients of project milestones',
      category: 'Communication',
      rating: 4.9,
      downloads: 950,
      apps: ['ClientConnect', 'PlanBoard']
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Integration Marketplace
          </CardTitle>
          <CardDescription>
            Discover and install pre-built automation templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.apps.map((app) => (
                        <Badge key={app} variant="secondary" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download className="h-3 w-3" />
                        {template.downloads}
                      </div>
                      <Button size="sm">Install</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationMarketplace;
