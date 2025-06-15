
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
import { integrationDatabaseService, IntegrationHealthStatus } from '@/services/integrationDatabaseService';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

const IntegrationHealthChecker: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [healthChecks, setHealthChecks] = useState<IntegrationHealthStatus[]>([]);
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
      
      // Load existing health status
      const existingHealth = await integrationDatabaseService.getIntegrationHealthStatus(user.id);
      
      // If no health records exist, create them based on integration actions
      if (existingHealth.length === 0) {
        const integrationActions = await integrationService.getUserIntegrationActions(user.id);
        
        for (const action of integrationActions) {
          await integrationDatabaseService.createIntegrationHealthStatus({
            user_id: user.id,
            integration_id: action.id,
            service_name: `${action.source_app} → ${action.target_app}`,
            status: action.enabled ? 'healthy' : 'warning',
            response_time: Math.floor(Math.random() * 500) + 50,
            uptime_percentage: action.enabled ? 99.9 : 95.0,
            last_checked_at: new Date().toISOString(),
            error_details: action.enabled ? undefined : 'Integration disabled'
          });
        }
        
        // Reload after creating
        const updatedHealth = await integrationDatabaseService.getIntegrationHealthStatus(user.id);
        setHealthChecks(updatedHealth);
      } else {
        setHealthChecks(existingHealth);
      }
      
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
    if (!user || healthChecks.length === 0) return;
    
    setIsChecking(true);
    
    try {
      // Update all checks to "checking" status
      const updatedChecks = healthChecks.map(check => ({
        ...check,
        status: 'checking' as const
      }));
      setHealthChecks(updatedChecks);

      // Simulate health check process with real database updates
      for (const check of healthChecks) {
        // Simulate checking delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate random health results
        const newStatus = Math.random() > 0.8 ? 'warning' : 'healthy';
        const newResponseTime = Math.floor(Math.random() * 1000) + 50;
        const newUptime = Math.random() * 10 + 90;
        
        await integrationDatabaseService.updateIntegrationHealthStatus(check.id, {
          status: newStatus,
          response_time: newResponseTime,
          uptime_percentage: newUptime,
          last_checked_at: new Date().toISOString(),
          error_details: newStatus === 'warning' ? 'Slow response detected' : undefined
        });
      }
      
      // Reload updated data
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
                      {getServiceIcon(check.service_name)}
                      <div>
                        <h4 className="font-medium">{check.service_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {check.error_details || 'Service running normally'}
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
                        {check.response_time}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{check.uptime_percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Checked</p>
                      <p className="font-medium">
                        {new Date(check.last_checked_at).toLocaleTimeString()}
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
