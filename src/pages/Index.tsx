
import React from 'react';
import AppLayout from '@/components/AppLayout';
import AppNavigation from '@/components/AppNavigation';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AIProductivityCoach from '@/components/ai/AIProductivityCoach';
import AIWorkflowOptimizer from '@/components/ai/AIWorkflowOptimizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Brain,
  Shield,
  Target
} from 'lucide-react';

const Index: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardStats = [
    {
      title: "Active Apps",
      value: "12",
      description: "All systems running",
      icon: Activity,
      color: "text-blue-500"
    },
    {
      title: "Total Users",
      value: "1,234",
      description: "+12% from last month",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Uptime",
      value: "99.9%",
      description: "Last 30 days",
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Performance",
      value: "+24%",
      description: "Response time improved",
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ProSync Suite Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage all your integrated applications
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            All Systems Operational
          </Badge>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabbed Dashboard Views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Features
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AIInsightsWidget />
              <AIProductivityCoach />
              <div className="lg:col-span-3">
                <AIWorkflowOptimizer />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <AppNavigation />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsightsWidget />
              <AIProductivityCoach />
              <div className="lg:col-span-2">
                <AIWorkflowOptimizer />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>TaskMaster</span>
                      <span className="font-mono">245ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TimeTrackPro</span>
                      <span className="font-mono">180ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BudgetBuddy</span>
                      <span className="font-mono">320ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>API Gateway</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cache Layer</span>
                      <Badge variant="secondary">Warning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Integration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Active Integrations</span>
                      <span className="font-mono">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Synced Today</span>
                      <span className="font-mono">4.2GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <span className="font-mono text-green-600">99.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Overview
                  </CardTitle>
                  <CardDescription>
                    Monitor security threats and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Threat Level</span>
                      <Badge variant="default">Low</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Failed Login Attempts</span>
                      <span className="font-mono">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SSL Certificate</span>
                      <Badge variant="default">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>2FA Users</span>
                      <span className="font-mono">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Compliance Status
                  </CardTitle>
                  <CardDescription>
                    Track compliance with security standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>GDPR Compliance</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SOC 2 Type II</span>
                      <Badge variant="default">Certified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ISO 27001</span>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;
