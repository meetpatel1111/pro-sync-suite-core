
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationMetric {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  successRate: number;
  totalExecutions: number;
  avgResponseTime: number;
  lastExecuted: string;
  errorCount: number;
}

interface PerformanceData {
  timestamp: string;
  executions: number;
  successRate: number;
  responseTime: number;
}

const IntegrationMonitoring: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<IntegrationMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data - in real implementation, this would come from your monitoring service
  useEffect(() => {
    const mockMetrics: IntegrationMetric[] = [
      {
        id: '1',
        name: 'TaskMaster → TimeTrackPro',
        status: 'healthy',
        successRate: 98.5,
        totalExecutions: 1247,
        avgResponseTime: 145,
        lastExecuted: '2 minutes ago',
        errorCount: 18
      },
      {
        id: '2',
        name: 'CollabSpace → TaskMaster',
        status: 'warning',
        successRate: 92.1,
        totalExecutions: 856,
        avgResponseTime: 289,
        lastExecuted: '5 minutes ago',
        errorCount: 67
      },
      {
        id: '3',
        name: 'BudgetBuddy → InsightIQ',
        status: 'healthy',
        successRate: 99.2,
        totalExecutions: 423,
        avgResponseTime: 98,
        lastExecuted: '1 minute ago',
        errorCount: 3
      },
      {
        id: '4',
        name: 'FileVault → CollabSpace',
        status: 'error',
        successRate: 87.3,
        totalExecutions: 234,
        avgResponseTime: 456,
        lastExecuted: '15 minutes ago',
        errorCount: 30
      }
    ];

    const mockPerformanceData: PerformanceData[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${23 - i}:00`,
      executions: Math.floor(Math.random() * 50) + 10,
      successRate: 85 + Math.random() * 15,
      responseTime: 100 + Math.random() * 200
    }));

    setMetrics(mockMetrics);
    setPerformanceData(mockPerformanceData);
    setLoading(false);
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportMetrics = () => {
    const csvContent = [
      ['Integration', 'Status', 'Success Rate', 'Total Executions', 'Avg Response Time', 'Error Count'],
      ...metrics.map(m => [m.name, m.status, m.successRate, m.totalExecutions, m.avgResponseTime, m.errorCount])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integration-metrics.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Integration metrics exported successfully'
    });
  };

  const pieData = [
    { name: 'Healthy', value: metrics.filter(m => m.status === 'healthy').length, color: '#22c55e' },
    { name: 'Warning', value: metrics.filter(m => m.status === 'warning').length, color: '#eab308' },
    { name: 'Error', value: metrics.filter(m => m.status === 'error').length, color: '#ef4444' }
  ];

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
          <h3 className="text-lg font-semibold">Integration Monitoring</h3>
          <p className="text-muted-foreground">
            Monitor the health and performance of your integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{metrics.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.filter(m => m.status === 'healthy').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">
                  {(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {metrics.reduce((sum, m) => sum + m.totalExecutions, 0).toLocaleString()}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Executions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="successRate" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="responseTime" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
              <CardDescription>Detailed metrics for each integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(metric.status)}
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last executed: {metric.lastExecuted}
                          </p>
                        </div>
                      </div>
                      <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'}>
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={metric.successRate} className="flex-1" />
                          <span className="text-sm font-medium">{metric.successRate}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Executions</p>
                        <p className="font-medium">{metric.totalExecutions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="font-medium">{metric.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Errors</p>
                        <p className="font-medium text-red-600">{metric.errorCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationMonitoring;
