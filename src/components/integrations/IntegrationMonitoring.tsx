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
  Server,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { appMonitoringService, AppHealthMetric, AppPerformanceMetric } from '@/services/appMonitoringService';

const IntegrationMonitoring: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthMetrics, setHealthMetrics] = useState<AppHealthMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<AppPerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMonitoringData();
      // Initialize monitoring if this is the first time
      appMonitoringService.initializeMonitoring(user.id);
    }
  }, [user]);

  const loadMonitoringData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load health metrics
      const healthData = await appMonitoringService.getHealthMetrics(user.id);
      setHealthMetrics(healthData);
      
      // Load performance data for the last 24 hours
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      
      const performanceMetrics = await appMonitoringService.getPerformanceMetrics(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setPerformanceData(performanceMetrics);
      
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
    if (!user) return;
    
    try {
      setRefreshing(true);
      
      // Run health checks for all apps
      await appMonitoringService.runHealthChecks(user.id);
      
      // Reload the data
      await loadMonitoringData();
      
      toast({
        title: 'Health Check Complete',
        description: 'All app health statuses have been updated'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Health Check Failed',
        description: 'Failed to update health statuses',
        variant: 'destructive'
      });
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
        return <Activity className="h-4 w-4 text-gray-500" />;
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
    if (totalServices === 0) return 'unknown';
    
    const criticalServices = healthMetrics.filter(m => m.status === 'critical').length;
    const warningServices = healthMetrics.filter(m => m.status === 'warning').length;

    if (criticalServices > 0) return 'critical';
    if (warningServices > 0) return 'warning';
    return 'healthy';
  };

  const getAverageUptime = () => {
    if (healthMetrics.length === 0) return 100;
    return healthMetrics.reduce((sum, metric) => sum + metric.uptime_percentage, 0) / healthMetrics.length;
  };

  const getAverageResponseTime = () => {
    if (healthMetrics.length === 0) return 0;
    return healthMetrics.reduce((sum, metric) => sum + metric.response_time_ms, 0) / healthMetrics.length;
  };

  const getTotalErrorRate = () => {
    if (healthMetrics.length === 0) return 0;
    return healthMetrics.reduce((sum, metric) => sum + metric.error_rate, 0) / healthMetrics.length;
  };

  const healthyCount = healthMetrics.filter(m => m.status === 'healthy').length;
  const warningCount = healthMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = healthMetrics.filter(m => m.status === 'critical').length;

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
          {refreshing ? 'Checking...' : 'Check All'}
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
              {healthyCount} of {healthMetrics.length} services healthy
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
              Real-time monitoring
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
          {healthMetrics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Health Data</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Click "Check All" to start monitoring your integrations
                </p>
                <Button onClick={refreshData} disabled={refreshing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Start Monitoring
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <CardTitle className="text-base">{metric.app_name}</CardTitle>
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
                        <div className="font-medium">{metric.uptime_percentage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Response Time</div>
                        <div className="font-medium">{metric.response_time_ms}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Error Rate</div>
                        <div className="font-medium">{metric.error_rate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Check</div>
                        <div className="font-medium">{formatTimeAgo(metric.last_check_at)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Health Score</span>
                        <span>{metric.uptime_percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.uptime_percentage} className="h-2" />
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
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Performance</CardTitle>
                <CardDescription>Last 24 hours of app performance</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {performanceData.slice(0, 5).map((data) => (
                      <div key={data.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{data.app_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimeAgo(data.recorded_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{data.success_rate.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">
                            {data.avg_response_time_ms}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <span>{healthyCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>Warning</span>
                    </div>
                    <span>{warningCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>Critical</span>
                    </div>
                    <span>{criticalCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {healthMetrics.filter(m => m.status !== 'healthy').map((metric) => (
              <Card key={metric.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <CardTitle className="text-base">
                        {metric.status === 'critical' ? 'Critical Issue' : 'Performance Warning'} - {metric.app_name}
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
                        ? `Service is experiencing critical issues with ${metric.error_rate.toFixed(1)}% error rate and ${metric.response_time_ms}ms response time.`
                        : `Service performance is degraded with ${metric.error_rate.toFixed(1)}% error rate.`
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
