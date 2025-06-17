
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  Settings,
  Activity,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Workflow
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';
import AutomationWorkflowBuilder from './AutomationWorkflowBuilder';
import IntegrationMonitoring from './IntegrationMonitoring';
import IntegrationMarketplace from './IntegrationMarketplace';
import IntegrationTemplates from './IntegrationTemplates';
import RealTimeSyncStatus from './RealTimeSyncStatus';
import APIManagement from './APIManagement';

const IntegrationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrationActions, setIntegrationActions] = useState<any[]>([]);
  const [automationEvents, setAutomationEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIntegrationData();
    }
  }, [user]);

  const fetchIntegrationData = async () => {
    try {
      setLoading(true);
      const actions = await integrationService.getUserIntegrationActions(user!.id);
      setIntegrationActions(actions);
      
      // In a real implementation, you'd fetch automation events from the database
      // For now, we'll use mock data
      setAutomationEvents([
        {
          id: '1',
          event_type: 'task_created',
          source_module: 'CollabSpace',
          target_module: 'TaskMaster',
          status: 'completed',
          triggered_at: new Date().toISOString()
        },
        {
          id: '2',
          event_type: 'time_logged',
          source_module: 'TimeTrackPro',
          target_module: 'BudgetBuddy',
          status: 'processing',
          triggered_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching integration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestIntegration = async () => {
    try {
      const success = await integrationService.createIntegrationAction(
        'TaskMaster',
        'TimeTrackPro',
        'auto_time_tracking',
        { auto_start: true, default_duration: 30 }
      );

      if (success) {
        toast({
          title: 'Integration Created',
          description: 'Test integration action has been created'
        });
        fetchIntegrationData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive'
      });
    }
  };

  const appIntegrations = [
    {
      source: 'TaskMaster',
      targets: ['TimeTrackPro', 'CollabSpace', 'PlanBoard', 'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 'ClientConnect', 'RiskRadar'],
      color: 'bg-blue-500'
    },
    {
      source: 'TimeTrackPro',
      targets: ['TaskMaster', 'CollabSpace', 'PlanBoard', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 'ClientConnect', 'RiskRadar'],
      color: 'bg-green-500'
    },
    {
      source: 'CollabSpace',
      targets: ['TaskMaster', 'PlanBoard', 'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 'ClientConnect', 'RiskRadar'],
      color: 'bg-purple-500'
    },
    {
      source: 'PlanBoard',
      targets: ['TaskMaster', 'TimeTrackPro', 'CollabSpace', 'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 'ClientConnect', 'RiskRadar'],
      color: 'bg-orange-500'
    },
    {
      source: 'FileVault',
      targets: ['TaskMaster', 'CollabSpace', 'PlanBoard', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 'ClientConnect', 'RiskRadar'],
      color: 'bg-cyan-500'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500 animate-bounce-soft" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500 animate-shake" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin-slow" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500 animate-wiggle" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-down">
        <div className="animate-fade-in-right">
          <h2 className="text-2xl font-bold text-shimmer">Integration Dashboard</h2>
          <p className="text-muted-foreground animate-fade-in-up">
            Monitor and manage integrations across all ProSync Suite apps
          </p>
        </div>
        <Button onClick={createTestIntegration} className="button-hover animate-bounce-soft">
          <Zap className="mr-2 h-4 w-4 icon-bounce" />
          Create Test Integration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
        <TabsList className="grid w-full grid-cols-6 glass-morphism">
          <TabsTrigger value="overview" className="flex items-center gap-2 nav-item">
            <Activity className="h-4 w-4 icon-bounce" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2 nav-item">
            <Workflow className="h-4 w-4 icon-bounce" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 nav-item">
            <BarChart3 className="h-4 w-4 icon-bounce" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2 nav-item">
            <ShoppingCart className="h-4 w-4 icon-bounce" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2 nav-item">
            <Settings className="h-4 w-4 icon-bounce" />
            Sync Status
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 nav-item">
            <Settings className="h-4 w-4 icon-bounce" />
            API Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 tab-content-enter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-container">
            <Card className="interactive-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground animate-pulse-soft" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-fade-in">{integrationActions.length}</div>
                <p className="text-xs text-muted-foreground animate-fade-in-up">
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card className="interactive-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground animate-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-fade-in">{automationEvents.length}</div>
                <p className="text-xs text-muted-foreground animate-fade-in-up">
                  Automation events triggered
                </p>
              </CardContent>
            </Card>

            <Card className="interactive-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground animate-heartbeat" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-fade-in">98.5%</div>
                <p className="text-xs text-muted-foreground animate-fade-in-up">
                  Integration reliability
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="interactive-card animate-slide-in-up">
            <CardHeader>
              <CardTitle className="animate-fade-in-right">Recent Integration Activity</CardTitle>
              <CardDescription className="animate-fade-in-up">Latest automation events across your apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 stagger-container">
                {automationEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(event.status)}
                      <div className="animate-fade-in-right">
                        <p className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.source_module} → {event.target_module}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.status === 'completed' ? 'default' : 'secondary'} className="badge-pulse">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Flow Map */}
          <Card className="interactive-card animate-slide-in-up">
            <CardHeader>
              <CardTitle className="animate-fade-in-right">Integration Flow Map</CardTitle>
              <CardDescription className="animate-fade-in-up">Visualize data flows between ProSync Suite apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 stagger-container">
                {appIntegrations.map((integration, index) => (
                  <div key={integration.source} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${integration.color} animate-pulse-soft`}></div>
                      <span className="font-medium text-gradient">{integration.source}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-5">
                      {integration.targets.map((target, targetIndex) => (
                        <div key={target} className="flex items-center space-x-1 animate-scale-in" style={{ animationDelay: `${targetIndex * 0.05}s` }}>
                          <ArrowRight className="h-3 w-3 text-muted-foreground icon-bounce" />
                          <Badge variant="outline" className="text-xs hover:scale-110 transition-transform badge-pulse">
                            {target}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="tab-content-enter">
          <AutomationWorkflowBuilder />
        </TabsContent>

        <TabsContent value="monitoring" className="tab-content-enter">
          <IntegrationMonitoring />
        </TabsContent>

        <TabsContent value="marketplace" className="tab-content-enter">
          <IntegrationMarketplace />
        </TabsContent>

        <TabsContent value="sync" className="tab-content-enter">
          <RealTimeSyncStatus />
        </TabsContent>

        <TabsContent value="api" className="tab-content-enter">
          <APIManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDashboard;
