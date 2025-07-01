
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  AlertTriangle, 
  Settings, 
  FileText, 
  Search, 
  BarChart3,
  Clock,
  Users,
  Shield,
  Plus,
  Filter,
  Download,
  TrendingUp,
  Activity,
  Workflow,
  Bell,
  Target,
  Zap
} from 'lucide-react';
import ChangeManagement from './ChangeManagement';
import ProblemManagement from './ProblemManagement';
import IncidentManagement from './IncidentManagement';
import TicketWorkflow from './TicketWorkflow';
import RealTimeNotifications from './RealTimeNotifications';
import AdvancedTicketSearch from './AdvancedTicketSearch';
import AdvancedSLAManagement from './AdvancedSLAManagement';

const ServiceCore = () => {
  const [activeTab, setActiveTab] = useState('incidents');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Open Incidents',
      value: '23',
      change: '+2',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'up'
    },
    {
      title: 'Active Changes',
      value: '8',
      change: '+1',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Problem Tickets',
      value: '5',
      change: '-1',
      icon: Search,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: 'down'
    },
    {
      title: 'SLA Compliance',
      value: '94%',
      change: '+2%',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    }
  ];

  const recentActivity = [
    { 
      type: 'incident', 
      title: 'Database connection timeout', 
      time: '5 min ago', 
      priority: 'high',
      assignee: 'John Doe',
      status: 'investigating'
    },
    { 
      type: 'change', 
      title: 'System maintenance window', 
      time: '15 min ago', 
      priority: 'medium',
      assignee: 'Jane Smith',
      status: 'approved'
    },
    { 
      type: 'problem', 
      title: 'Email delivery issues', 
      time: '1 hour ago', 
      priority: 'low',
      assignee: 'Bob Wilson',
      status: 'analyzing'
    },
  ];

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-shimmer">
            ServiceCore
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Comprehensive IT Service Management and Support Desk
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <RealTimeNotifications />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tickets, changes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 shadow-sm"
            />
          </div>
          <Button variant="outline" className="hover-scale">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="hover-scale">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="hover-scale shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden shadow-lg hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={`absolute inset-0 ${stat.bgColor} opacity-10`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'secondary'} 
                  className={`text-xs mr-2 ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  from last week
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Recent Activity Sidebar */}
        <Card className="lg:col-span-1 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
              <Badge className="ml-2 bg-blue-100 text-blue-800 animate-pulse">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-2 h-2 rounded-full mt-2 animate-pulse ${
                  activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.type}
                    </Badge>
                    <Badge className={`text-xs ${
                      activity.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                      activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate mb-1">{activity.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{activity.time}</span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {activity.assignee}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full hover-scale">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Main Content Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">
              <TabsTrigger value="incidents" className="flex items-center gap-2 hover-scale">
                <Ticket className="h-4 w-4" />
                <span className="hidden sm:inline">Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2 hover-scale">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="changes" className="flex items-center gap-2 hover-scale">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Changes</span>
              </TabsTrigger>
              <TabsTrigger value="problems" className="flex items-center gap-2 hover-scale">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Problems</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2 hover-scale">
                <Workflow className="h-4 w-4" />
                <span className="hidden sm:inline">Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="sla" className="flex items-center gap-2 hover-scale">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">SLA</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 hover-scale">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incidents" className="space-y-4 animate-fade-in">
              <IncidentManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="search" className="space-y-4 animate-fade-in">
              <AdvancedTicketSearch />
            </TabsContent>

            <TabsContent value="changes" className="space-y-4 animate-fade-in">
              <ChangeManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="problems" className="space-y-4 animate-fade-in">
              <ProblemManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4 animate-fade-in">
              <TicketWorkflow ticketId="12345" />
            </TabsContent>

            <TabsContent value="sla" className="space-y-4 animate-fade-in">
              <AdvancedSLAManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 animate-fade-in">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Analytics & Reporting Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      {[
                        { icon: Target, label: 'Performance Analytics', color: 'text-blue-500' },
                        { icon: TrendingUp, label: 'Trend Analysis', color: 'text-green-500' },
                        { icon: Clock, label: 'SLA Reports', color: 'text-orange-500' },
                        { icon: Users, label: 'Team Metrics', color: 'text-purple-500' }
                      ].map((item, index) => (
                        <div key={index} className="text-center animate-bounce-soft" style={{ animationDelay: `${index * 0.2}s` }}>
                          <item.icon className={`h-12 w-12 mx-auto mb-2 ${item.color}`} />
                          <p className="text-sm font-medium">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <Zap className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics Dashboard</h3>
                    <p className="max-w-md mx-auto">
                      Comprehensive reporting and analytics dashboard with real-time insights, 
                      performance metrics, and customizable reports is coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ServiceCore;
