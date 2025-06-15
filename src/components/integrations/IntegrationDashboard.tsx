
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
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
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
          <h2 className="text-2xl font-bold">Integration Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage integrations across all ProSync Suite apps
          </p>
        </div>
        <Button onClick={createTestIntegration}>
          <Zap className="mr-2 h-4 w-4" />
          Create Test Integration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">Integration Flows</TabsTrigger>
          <TabsTrigger value="events">Automation Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrationActions.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{automationEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Automation events triggered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  Integration reliability
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Integration Activity</CardTitle>
              <CardDescription>Latest automation events across your apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automationEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <p className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.source_module} → {event.target_module}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Flow Map</CardTitle>
              <CardDescription>Visualize data flows between ProSync Suite apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {appIntegrations.map((integration) => (
                  <div key={integration.source} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${integration.color}`}></div>
                      <span className="font-medium">{integration.source}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-5">
                      {integration.targets.map((target) => (
                        <div key={target} className="flex items-center space-x-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
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

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Events</CardTitle>
              <CardDescription>Detailed log of all integration events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationEvents.map((event) => (
                  <div key={event.id} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{event.event_type}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(event.status)}
                        <span className="text-sm">{event.status}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Source: {event.source_module}</p>
                      <p>Target: {event.target_module}</p>
                      <p>Triggered: {new Date(event.triggered_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure your integration preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-sync enabled</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data between connected apps
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified when integrations trigger
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Error handling</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure retry policies and error notifications
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDashboard;
