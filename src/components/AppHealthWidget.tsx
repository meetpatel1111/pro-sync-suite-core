
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { appMonitoringService, AppHealthMetric } from '@/services/appMonitoringService';
import { useAuthContext } from '@/context/AuthContext';

const AppHealthWidget: React.FC = () => {
  const { user } = useAuthContext();
  const [healthMetrics, setHealthMetrics] = useState<AppHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthMetrics();
    }
  }, [user]);

  const loadHealthMetrics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const metrics = await appMonitoringService.getHealthMetrics(user.id);
      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>App Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          App Health Monitor
        </CardTitle>
        <CardDescription>
          Real-time status of all integrated applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthMetrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(metric.status)}
              <div>
                <div className="font-medium">{metric.app_name}</div>
                <div className="text-sm text-muted-foreground">
                  {metric.uptime_percentage}% uptime • {metric.response_time_ms}ms
                </div>
              </div>
            </div>
            <Badge variant={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AppHealthWidget;
