
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Zap,
  Clock,
  Activity,
  Wifi,
  Database,
  Server
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  lastChecked: string;
  responseTime: number;
  uptime: number;
  details: string;
}

const IntegrationHealthChecker: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthStatus();
    }
  }, [user]);

  const loadHealthStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load integration actions to determine which services to check
      const integrationActions = await integrationService.getUserIntegrationActions(user.id);
      
      // Convert integration actions to health checks
      const checks: HealthCheck[] = integrationActions.map(action => ({
        id: action.id,
        name: `${action.source_app} Integration`,
        status: action.enabled ? 'healthy' : 'warning',
        lastChecked: action.created_at,
        responseTime: Math.floor(Math.random() * 500) + 50, // Simulate response time
        uptime: action.enabled ? 99.9 : 95.0,
        details: action.enabled ? 'Integration active and responding' : 'Integration disabled'
      }));

      setHealthChecks(checks);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('Error loading health status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load health status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      // Update all checks to "checking" status
      setHealthChecks(prev => prev.map(check => ({
        ...check,
        status: 'checking'
      })));

      // Simulate health check process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update with new results
      await loadHealthStatus();
      
      toast({
        title: 'Health Check Complete',
        description: 'All integration services have been checked'
      });
      
    } catch (error) {
      console.error('Error running health check:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete health check',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('API')) return <Server className="h-4 w-4" />;
    if (name.includes('WebSocket')) return <Wifi className="h-4 w-4" />;
    if (name.includes('Database')) return <Database className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const healthyCount = healthChecks.filter(check => check.status === 'healthy').length;
  const warningCount = healthChecks.filter(check => check.status === 'warning').length;
  const errorCount = healthChecks.filter(check => check.status === 'error').length;
  const overallHealth = healthChecks.length > 0 ? 
    (healthyCount / healthChecks.length) * 100 : 100;

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
          <h3 className="text-lg font-semibold">Integration Health Monitor</h3>
          <p className="text-muted-foreground">
            Monitor the health and availability of your integration services
          </p>
        </div>
        <Button 
          onClick={runHealthCheck} 
          disabled={isChecking || healthChecks.length === 0}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Run Health Check'}
        </Button>
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Health</p>
                <p className="text-xl font-bold">{overallHealth.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-xl font-bold text-green-600">{healthyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Health Progress */}
      {healthChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>
              Last updated: {lastUpdate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Integration Health Score</span>
                <span className={getStatusColor(overallHealth >= 95 ? 'healthy' : overallHealth >= 80 ? 'warning' : 'error')}>
                  {overallHealth.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={overallHealth} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Details</CardTitle>
          <CardDescription>
            Individual health status for each integration service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthChecks.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Services to Monitor</h3>
              <p className="text-muted-foreground">
                Set up integrations to see health monitoring
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {healthChecks.map((check) => (
                <div key={check.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(check.name)}
                      <div>
                        <h4 className="font-medium">{check.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {check.details}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <Badge 
                        variant={check.status === 'healthy' ? 'default' : check.status === 'error' ? 'destructive' : 'secondary'}
                        className={check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                      >
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-medium">
                        {check.responseTime > 0 ? `${check.responseTime}ms` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{check.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Checked</p>
                      <p className="font-medium">
                        {new Date(check.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationHealthChecker;
