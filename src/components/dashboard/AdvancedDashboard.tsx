
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Maximize2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdvancedDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const performanceData = [
    { date: '2024-01-08', productivity: 85, tasks: 12, hours: 7.5, efficiency: 92 },
    { date: '2024-01-09', productivity: 92, tasks: 15, hours: 8.0, efficiency: 88 },
    { date: '2024-01-10', productivity: 78, tasks: 9, hours: 6.5, efficiency: 85 },
    { date: '2024-01-11', productivity: 95, tasks: 18, hours: 8.5, efficiency: 95 },
    { date: '2024-01-12', productivity: 88, tasks: 14, hours: 7.8, efficiency: 90 },
    { date: '2024-01-13', productivity: 82, tasks: 11, hours: 7.2, efficiency: 87 },
    { date: '2024-01-14', productivity: 90, tasks: 16, hours: 8.2, efficiency: 93 }
  ];

  const projectDistribution = [
    { name: 'ProSync Suite', value: 40, color: '#3b82f6' },
    { name: 'Mobile App', value: 25, color: '#10b981' },
    { name: 'Client Portal', value: 20, color: '#f59e0b' },
    { name: 'API Redesign', value: 10, color: '#ef4444' },
    { name: 'Documentation', value: 5, color: '#8b5cf6' }
  ];

  const teamMetrics = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Team Members',
      value: '28',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Avg. Productivity',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'On-Time Delivery',
      value: '94%',
      change: '-2%',
      trend: 'down',
      icon: Target,
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'task_completed',
      title: 'API Documentation Updated',
      user: 'Sarah Johnson',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'project_milestone',
      title: 'Mobile App Beta Released',
      user: 'Development Team',
      timestamp: '4 hours ago',
      status: 'milestone'
    },
    {
      id: '3',
      type: 'team_update',
      title: 'New Team Member Onboarded',
      user: 'HR Department',
      timestamp: '1 day ago',
      status: 'info'
    },
    {
      id: '4',
      type: 'alert',
      title: 'Server Maintenance Scheduled',
      user: 'DevOps Team',
      timestamp: '2 days ago',
      status: 'warning'
    }
  ];

  const upcomingDeadlines = [
    {
      id: '1',
      title: 'Q1 Project Review',
      date: '2024-01-20',
      priority: 'high',
      project: 'ProSync Suite'
    },
    {
      id: '2',
      title: 'Client Presentation',
      date: '2024-01-22',
      priority: 'medium',
      project: 'Client Portal'
    },
    {
      id: '3',
      title: 'Feature Release',
      date: '2024-01-25',
      priority: 'high',
      project: 'Mobile App'
    }
  ];

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'milestone': return <Target className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your team's performance overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <metric.icon className={`h-6 w-6 ${getMetricColor(metric.color)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Performance</CardTitle>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="productivity" className="space-y-4">
              <TabsList>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              </TabsList>
              
              <TabsContent value="productivity">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="productivity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="tasks">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="hours">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="efficiency">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="efficiency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {projectDistribution.map((project, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <span className="text-sm">{project.name}</span>
                    </div>
                    <Badge variant="outline">{project.value}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-600">{activity.user} • {activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Deadline
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{deadline.title}</h4>
                    <p className="text-sm text-gray-600">{deadline.project}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{deadline.date}</span>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              New Project
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Add Member
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              View Reports
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Zap className="h-6 w-6 mb-2" />
              Automation
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedDashboard;
