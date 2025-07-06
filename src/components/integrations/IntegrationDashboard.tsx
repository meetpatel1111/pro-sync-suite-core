import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Settings, 
  TrendingUp, 
  Users, 
  Database, 
  Cloud,
  Webhook,
  Brain,
  Globe,
  Shield,
  RefreshCw,
  Plus,
  ArrowRight,
  Star,
  Sparkles,
  PlayCircle,
  PauseCircle,
  Trash2,
  Edit
} from 'lucide-react';
import IntegrationHealthChecker from './IntegrationHealthChecker';
import RealTimeSyncStatus from './RealTimeSyncStatus';
import IntegrationMarketplace from './IntegrationMarketplace';
import APIManagement from './APIManagement';
import IntegrationMonitoring from './IntegrationMonitoring';
import AutomationWorkflowBuilder from './AutomationWorkflowBuilder';
import AIFeaturesTab from './AIFeaturesTab';
import { useIntegration } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IntegrationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeStats, setRealTimeStats] = useState({
    activeIntegrations: 0,
    syncedToday: 0,
    successRate: 0,
    avgResponseTime: 0
  });
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { refreshIntegrations } = useIntegration();

  useEffect(() => {
    loadIntegrations();
    loadRealTimeStats();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: integrationActions, error } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIntegrations(integrationActions || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get real integration stats
      const { data: actions } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);

      const { data: healthStatus } = await supabase
        .from('integration_health_status')
        .select('*')
        .eq('user_id', user.id);

      const activeCount = actions?.length || 0;
      const healthyCount = healthStatus?.filter(h => h.status === 'healthy').length || 0;
      const totalHealth = healthStatus?.length || 1;
      const avgUptime = healthStatus?.reduce((acc, h) => acc + h.uptime_percentage, 0) / totalHealth || 100;
      const avgResponseTime = healthStatus?.reduce((acc, h) => acc + (h.response_time || 0), 0) / totalHealth || 0;

      setRealTimeStats({
        activeIntegrations: activeCount,
        syncedToday: Math.floor(activeCount * 1.5 * 100), // Estimated based on active integrations
        successRate: Math.floor(avgUptime),
        avgResponseTime: Math.floor(avgResponseTime)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_actions')
        .update({ enabled: !enabled })
        .eq('id', integrationId);

      if (error) throw error;

      await loadIntegrations();
      await loadRealTimeStats();

      toast({
        title: enabled ? 'Integration Disabled' : 'Integration Enabled',
        description: `Integration has been ${enabled ? 'disabled' : 'enabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update integration status',
        variant: 'destructive'
      });
    }
  };

  const deleteIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('integration_actions')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      await loadIntegrations();
      await loadRealTimeStats();

      toast({
        title: 'Integration Deleted',
        description: 'Integration has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete integration',
        variant: 'destructive'
      });
    }
  };

  const stats = [
    { 
      title: 'Active Integrations', 
      value: realTimeStats.activeIntegrations, 
      change: 'Live count',
      icon: Activity, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up'
    },
    { 
      title: 'Syncs Today', 
      value: realTimeStats.syncedToday.toLocaleString(), 
      change: 'Auto-updated',
      icon: Database, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    { 
      title: 'Success Rate', 
      value: `${realTimeStats.successRate}%`, 
      change: 'Live monitoring',
      icon: CheckCircle, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: 'stable'
    },
    { 
      title: 'Avg Response', 
      value: `${realTimeStats.avgResponseTime}ms`, 
      change: 'Real-time',
      icon: Zap, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'up'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (enabled: boolean, hasError: boolean) => {
    if (!enabled) return Clock;
    if (hasError) return AlertCircle;
    return CheckCircle;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-xs animate-pulse">
                  {stat.trend === 'up' ? '↗️' : stat.trend === 'down' ? '↘️' : '→'} Live
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
              <TabsList className="p-6 bg-transparent flex flex-wrap gap-2">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Activity className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <CheckCircle className="h-4 w-4" />
                  Health Check
                </TabsTrigger>
                <TabsTrigger value="sync" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <RefreshCw className="h-4 w-4" />
                  Real-time Sync
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Globe className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Settings className="h-4 w-4" />
                  API Management
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <TrendingUp className="h-4 w-4" />
                  Monitoring
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Zap className="h-4 w-4" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Webhook className="h-4 w-4" />
                  Webhooks
                </TabsTrigger>
                <TabsTrigger value="ai-features" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-4 py-2">
                  <Brain className="h-4 w-4" />
                  AI Features
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">New</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Integrations</h3>
                  <div className="flex gap-2">
                    <Button onClick={refreshIntegrations} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : integrations.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Integrations Yet</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first integration to connect your apps</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Integration
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {integrations.map((integration) => {
                      const StatusIcon = getStatusIcon(integration.enabled, integration.error_count > 0);
                      const hasError = integration.error_count > 0;
                      
                      return (
                        <Card key={integration.id} className="hover:shadow-md transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <div className={`p-3 rounded-lg ${
                                    integration.enabled 
                                      ? hasError ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    <StatusIcon className="h-5 w-5" />
                                  </div>
                                  {integration.enabled && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-lg">
                                      {integration.source_app} → {integration.target_app}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {integration.action_type}
                                    </Badge>
                                    <Badge variant={integration.enabled ? 'default' : 'secondary'}>
                                      {integration.enabled ? 'Active' : 'Paused'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Executions:</span> {integration.execution_count}
                                    </div>
                                    <div>
                                      <span className="font-medium">Success:</span> {integration.success_count}
                                    </div>
                                    <div>
                                      <span className="font-medium">Errors:</span> {integration.error_count}
                                    </div>
                                  </div>
                                  {integration.last_executed_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Last run: {new Date(integration.last_executed_at).toLocaleString()}
                                    </p>
                                  )}
                                  {integration.last_error_message && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                      {integration.last_error_message}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleIntegration(integration.id, integration.enabled)}
                                >
                                  {integration.enabled ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteIntegration(integration.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Success Rate</span>
                                <span>{integration.execution_count > 0 ? Math.round((integration.success_count / integration.execution_count) * 100) : 100}%</span>
                              </div>
                              <Progress 
                                value={integration.execution_count > 0 ? (integration.success_count / integration.execution_count) * 100 : 100} 
                                className="h-2" 
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Other Tab Contents */}
              <TabsContent value="health">
                <IntegrationHealthChecker />
              </TabsContent>

              <TabsContent value="sync">
                <RealTimeSyncStatus />
              </TabsContent>

              <TabsContent value="marketplace">
                <IntegrationMarketplace />
              </TabsContent>

              <TabsContent value="api">
                <APIManagement />
              </TabsContent>

              <TabsContent value="monitoring">
                <IntegrationMonitoring />
              </TabsContent>

              <TabsContent value="automation">
                <AutomationWorkflowBuilder />
              </TabsContent>

              <TabsContent value="webhooks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      Webhook Management
                    </CardTitle>
                    <CardDescription>
                      Configure and manage webhooks for real-time notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Task Created Webhook</h4>
                          <p className="text-sm text-gray-600">Triggers when new tasks are created</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Budget Alert Webhook</h4>
                          <p className="text-sm text-gray-600">Sends alerts for budget thresholds</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>
                      </div>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Webhook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-features">
                <AIFeaturesTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationDashboard;
