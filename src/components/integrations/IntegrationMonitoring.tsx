
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Database,
  Wifi,
  Server,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

interface HealthMetric {
  service: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  response_time: number;
  error_rate: number;
  last_check: string;
}

interface PerformanceMetric {
  timestamp: string;
  requests_per_minute: number;
  success_rate: number;
  avg_response_time: number;
  error_count: number;
}

const IntegrationMonitoring: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock health metrics for all ProSync Suite apps
  const mockHealthMetrics: HealthMetric[] = [
    {
      service: 'TaskMaster',
      status: 'healthy',
      uptime: 99.8,
      response_time: 120,
      error_rate: 0.2,
      last_check: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      service: 'TimeTrackPro',
      status: 'healthy',
      uptime: 99.9,
      response_time: 85,
      error_rate: 0.1,
      last_check: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    },
    {
      service: 'CollabSpace',
      status: 'warning',
      uptime: 98.5,
      response_time: 250,
      error_rate: 1.5,
      last_check: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    },
    {
      service: 'PlanBoard',
      status: 'healthy',
      uptime: 99.7,
      response_time: 95,
      error_rate: 0.3,
      last_check: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    },
    {
      service: 'FileVault',
      status: 'critical',
      uptime: 95.2,
      response_time: 450,
      error_rate: 4.8,
      last_check: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      service: 'BudgetBuddy',
      status: 'healthy',
      uptime: 99.6,
      response_time: 110,
      error_rate: 0.4,
      last_check: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      service: 'InsightIQ',
      status: 'healthy',
      uptime: 99.4,
      response_time: 180,
      error_rate: 0.6,
      last_check: new Date(Date.now() - 4 * 60 * 1000).toISOString()
    },
    {
      service: 'ResourceHub',
      status: 'warning',
      uptime: 98.8,
      response_time: 200,
      error_rate: 1.2,
      last_check: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    },
    {
      service: 'ClientConnect',
      status: 'healthy',
      uptime: 99.5,
      response_time: 130,
      error_rate: 0.5,
      last_check: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      service: 'RiskRadar',
      status: 'healthy',
      uptime: 99.1,
      response_time: 160,
      error_rate: 0.9,
      last_check: new Date(Date.now() - 6 * 60 * 1000).toISOString()
    }
  ];

  // Mock performance data for the last 24 hours
  const generateMockPerformanceData = (): PerformanceMetric[] => {
    const data: PerformanceMetric[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        requests_per_minute: Math.floor(Math.random() * 1000) + 500,
        success_rate: Math.random() * 5 + 95, // 95-100%
        avg_response_time: Math.floor(Math.random() * 200) + 100,
        error_count: Math.floor(Math.random() * 10)
      });
    }
    
    return data;
  };

  useEffect(() => {
    loadMonitoringData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the database
      setHealthMetrics(mockHealthMetrics);
      setPerformanceData(generateMockPerformanceData());
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load monitoring data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with fresh data
      setHealthMetrics(mockHealthMetrics.map(metric => ({
        ...metric,
        response_time: Math.floor(Math.random() * 50) + metric.response_time - 25,
        last_check: new Date().toISOString()
      })));
      
      // Add new performance data point
      const now = new Date();
      const newDataPoint: PerformanceMetric = {
        timestamp: now.toISOString(),
        requests_per_minute: Math.floor(Math.random() * 1000) + 500,
        success_rate: Math.random() * 5 + 95,
        avg_response_time: Math.floor(Math.random() * 200) + 100,
        error_count: Math.floor(Math.random() * 10)
      };
      
      setPerformanceData(prev => [...prev.slice(1), newDataPoint]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getOverallHealth = () => {
    const totalServices = healthMetrics.length;
    const healthyServices = healthMetrics.filter(m => m.status === 'healthy').length;
    const warningServices = healthMetrics.filter(m => m.status === 'warning').length;
    const criticalServices = healthMetrics.filter(m => m.status === 'critical').length;

    if (criticalServices > 0) return 'critical';
    if (warningServices > 0) return 'warning';
    return 'healthy';
  };

  const getAverageUptime = () => {
    return healthMetrics.reduce((sum, metric) => sum + metric.uptime, 0) / healthMetrics.length;
  };

  const getAverageResponseTime = () => {
    return healthMetrics.reduce((sum, metric) => sum + metric.response_time, 0) / healthMetrics.length;
  };

  const getTotalErrorRate = () => {
    return healthMetrics.reduce((sum, metric) => sum + metric.error_rate, 0) / healthMetrics.length;
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
          <h2 className="text-2xl font-bold">Integration Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor health and performance of all integrations
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshData}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            {getStatusIcon(getOverallHealth())}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{getOverallHealth()}</div>
            <p className="text-xs text-muted-foreground">
              {healthMetrics.filter(m => m.status === 'healthy').length} of {healthMetrics.length} services healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageUptime().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getAverageResponseTime())}ms</div>
            <p className="text-xs text-muted-foreground">
              Across all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalErrorRate().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthMetrics.map((metric) => (
              <Card key={metric.service}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <CardTitle className="text-base">{metric.service}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-medium">{metric.uptime}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Response Time</div>
                      <div className="font-medium">{metric.response_time}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Error Rate</div>
                      <div className="font-medium">{metric.error_rate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Check</div>
                      <div className="font-medium">{formatTimeAgo(metric.last_check)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span>{metric.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.uptime} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="mr-1 h-3 w-3" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requests Per Minute</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {performanceData.slice(-12).map((data, index) => (
                    <div
                      key={index}
                      className="bg-primary/20 rounded-t-sm flex-1"
                      style={{
                        height: `${(data.requests_per_minute / 1500) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Current: {performanceData[performanceData.length - 1]?.requests_per_minute || 0} req/min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Success Rate</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {performanceData.slice(-12).map((data, index) => (
                    <div
                      key={index}
                      className="bg-green-500/20 rounded-t-sm flex-1"
                      style={{
                        height: `${data.success_rate}%`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Current: {performanceData[performanceData.length - 1]?.success_rate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Time</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {performanceData.slice(-12).map((data, index) => (
                    <div
                      key={index}
                      className="bg-blue-500/20 rounded-t-sm flex-1"
                      style={{
                        height: `${(data.avg_response_time / 300) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Current: {performanceData[performanceData.length - 1]?.avg_response_time || 0}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Count</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-1">
                  {performanceData.slice(-12).map((data, index) => (
                    <div
                      key={index}
                      className="bg-red-500/20 rounded-t-sm flex-1"
                      style={{
                        height: `${(data.error_count / 20) * 100}%`,
                        minHeight: data.error_count > 0 ? '8px' : '2px'
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Current: {performanceData[performanceData.length - 1]?.error_count || 0} errors
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Healthy</span>
                    </div>
                    <span>{healthMetrics.filter(m => m.status === 'healthy').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>Warning</span>
                    </div>
                    <span>{healthMetrics.filter(m => m.status === 'warning').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>Critical</span>
                    </div>
                    <span>{healthMetrics.filter(m => m.status === 'critical').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthMetrics.slice(0, 5).map((metric) => (
                    <div key={metric.service}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.service}</span>
                        <span>{(100 - metric.error_rate).toFixed(1)}%</span>
                      </div>
                      <Progress value={100 - metric.error_rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {healthMetrics.filter(m => m.status !== 'healthy').map((metric) => (
              <Card key={metric.service} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <CardTitle className="text-base">
                        {metric.status === 'critical' ? 'Critical Issue' : 'Performance Warning'} - {metric.service}
                      </CardTitle>
                    </div>
                    <Badge variant={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {metric.status === 'critical' 
                        ? `Service is experiencing critical issues with ${metric.error_rate}% error rate and ${metric.response_time}ms response time.`
                        : `Service performance is degraded with ${metric.error_rate}% error rate.`
                      }
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {healthMetrics.filter(m => m.status !== 'healthy').length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h4 className="font-medium mb-2">All Systems Operational</h4>
                  <p className="text-sm text-muted-foreground text-center">
                    No active alerts or issues detected across all integrations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationMonitoring;
