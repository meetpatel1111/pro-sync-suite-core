
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
  Activity
} from 'lucide-react';
import ChangeManagement from './ChangeManagement';
import ProblemManagement from './ProblemManagement';
import IncidentManagement from './IncidentManagement';

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
      trend: 'up'
    },
    {
      title: 'Active Changes',
      value: '8',
      change: '+1',
      icon: Settings,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      title: 'Problem Tickets',
      value: '5',
      change: '-1',
      icon: Search,
      color: 'text-yellow-600',
      trend: 'down'
    },
    {
      title: 'SLA Compliance',
      value: '94%',
      change: '+2%',
      icon: BarChart3,
      color: 'text-green-600',
      trend: 'up'
    }
  ];

  const recentActivity = [
    { type: 'incident', title: 'Database connection timeout', time: '5 min ago', priority: 'high' },
    { type: 'change', title: 'System maintenance window', time: '15 min ago', priority: 'medium' },
    { type: 'problem', title: 'Email delivery issues', time: '1 hour ago', priority: 'low' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ServiceCore
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive IT Service Management and Support Desk
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tickets, changes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'secondary'} 
                  className="text-xs mr-2"
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
        {/* Recent Activity Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="incidents" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Incidents
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="changes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Changes
              </TabsTrigger>
              <TabsTrigger value="problems" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Problems
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incidents" className="space-y-4">
              <IncidentManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Service request management interface coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              <ChangeManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="problems" className="space-y-4">
              <ProblemManagement searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>Asset management interface coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Reporting dashboard coming soon...</p>
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
