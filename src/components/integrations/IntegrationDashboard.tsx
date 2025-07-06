import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import IntegrationHealthChecker from './IntegrationHealthChecker';
import RealTimeSyncStatus from './RealTimeSyncStatus';
import IntegrationMarketplace from './IntegrationMarketplace';
import APIManagement from './APIManagement';
import IntegrationMonitoring from './IntegrationMonitoring';
import AutomationWorkflowBuilder from './AutomationWorkflowBuilder';
import AIFeaturesTab from './AIFeaturesTab';

const IntegrationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced statistics with real-time updates
  const stats = [
    { 
      title: 'Active Integrations', 
      value: 24, 
      change: '+3 this week',
      icon: Activity, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up'
    },
    { 
      title: 'Data Synced Today', 
      value: '1.2M', 
      change: '+15% vs yesterday',
      icon: Database, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    { 
      title: 'Success Rate', 
      value: '99.7%', 
      change: 'Last 30 days',
      icon: CheckCircle, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: 'stable'
    },
    { 
      title: 'Response Time', 
      value: '245ms', 
      change: '-12ms improvement',
      icon: Zap, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'up'
    }
  ];

  // Enhanced app integrations with more details
  const appIntegrations = [
    { 
      name: 'TaskMaster', 
      status: 'connected', 
      lastSync: '2 minutes ago', 
      syncCount: 1247,
      health: 98,
      features: ['Real-time sync', 'Webhooks', 'API v2'],
      category: 'Productivity'
    },
    { 
      name: 'TimeTrackPro', 
      status: 'connected', 
      lastSync: '5 minutes ago', 
      syncCount: 892,
      health: 96,
      features: ['Bulk sync', 'Analytics', 'Mobile sync'],
      category: 'Time Management'
    },
    { 
      name: 'BudgetBuddy', 
      status: 'syncing', 
      lastSync: 'Now', 
      syncCount: 634,
      health: 94,
      features: ['Financial data', 'Reports', 'Alerts'],
      category: 'Finance'
    },
    { 
      name: 'CollabSpace', 
      status: 'connected', 
      lastSync: '1 minute ago', 
      syncCount: 2103,
      health: 99,
      features: ['Live chat', 'File sync', 'Notifications'],
      category: 'Communication'
    },
    { 
      name: 'FileVault', 
      status: 'connected', 
      lastSync: '3 minutes ago', 
      syncCount: 1567,
      health: 97,
      features: ['Cloud storage', 'Version control', 'Sharing'],
      category: 'Storage'
    },
    { 
      name: 'ClientConnect', 
      status: 'warning', 
      lastSync: '15 minutes ago', 
      syncCount: 445,
      health: 85,
      features: ['CRM sync', 'Contact management', 'Pipeline'],
      category: 'CRM'
    },
    { 
      name: 'InsightIQ', 
      status: 'connected', 
      lastSync: '4 minutes ago', 
      syncCount: 789,
      health: 93,
      features: ['Analytics', 'Dashboards', 'Reports'],
      category: 'Analytics'
    },
    { 
      name: 'RiskRadar', 
      status: 'connected', 
      lastSync: '7 minutes ago', 
      syncCount: 334,
      health: 91,
      features: ['Risk assessment', 'Monitoring', 'Alerts'],
      category: 'Security'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {stat.trend === 'up' ? '↗️' : stat.trend === 'down' ? '↘️' : '→'} Live
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
              <TabsList className="p-6 bg-transparent flex flex-wrap gap-2">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <Activity className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="health" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4" />
                  Health Check
                </TabsTrigger>
                <TabsTrigger 
                  value="sync" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4" />
                  Real-time Sync
                </TabsTrigger>
                <TabsTrigger 
                  value="marketplace" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <Globe className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger 
                  value="api" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                  API Management
                </TabsTrigger>
                <TabsTrigger 
                  value="monitoring" 
                  className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  Monitoring
                </TabsTrigger>
                <TabsTrigger 
                  value="automation" 
                  className="flex items-center gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <Zap className="h-4 w-4" />
                  Automation
                </TabsTrigger>
                <TabsTrigger 
                  value="webhooks" 
                  className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
                  <Webhook className="h-4 w-4" />
                  Webhooks
                </TabsTrigger>
                <TabsTrigger 
                  value="ai-features" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-300"
                >
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
                  <h3 className="text-lg font-semibold">App Integration Status</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Integration
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {appIntegrations.map((app, index) => {
                    const StatusIcon = getStatusIcon(app.status);
                    return (
                      <Card key={index} className="hover:shadow-md transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className={`p-2 rounded-lg ${getStatusColor(app.status)}`}>
                                  <StatusIcon className="h-4 w-4" />
                                </div>
                                {app.status === 'syncing' && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{app.name}</h4>
                                  <Badge variant="outline" className="text-xs">{app.category}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">Last sync: {app.lastSync}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">{app.syncCount} syncs</span>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="text-xs text-gray-500">{app.health}% health</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {app.features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Health Score</span>
                              <span>{app.health}%</span>
                            </div>
                            <Progress value={app.health} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
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
