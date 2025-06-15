
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
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    runHealthCheck();
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    // Simulate health check for each integration
    const checks: HealthCheck[] = [
      {
        id: '1',
        name: 'TaskMaster API',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        responseTime: 120,
        uptime: 99.8,
        details: 'All endpoints responding normally'
      },
      {
        id: '2',
        name: 'TimeTrackPro Service',
        status: 'warning',
        lastChecked: new Date().toISOString(),
        responseTime: 450,
        uptime: 98.2,
        details: 'High response times detected'
      },
      {
        id: '3',
        name: 'CollabSpace WebSocket',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        responseTime: 35,
        uptime: 99.9,
        details: 'Real-time connections stable'
      },
      {
        id: '4',
        name: 'BudgetBuddy Database',
        status: 'error',
        lastChecked: new Date().toISOString(),
        responseTime: 0,
        uptime: 95.1,
        details: 'Connection timeout errors'
      },
      {
        id: '5',
        name: 'FileVault Storage',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        responseTime: 89,
        uptime: 99.5,
        details: 'Storage operations normal'
      }
    ];

    // Simulate checking delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setHealthChecks(checks);
    setIsChecking(false);
    setLastUpdate(new Date().toLocaleTimeString());
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
    (healthyCount / healthChecks.length) * 100 : 0;

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
          disabled={isChecking}
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

      {/* Detailed Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Details</CardTitle>
          <CardDescription>
            Individual health status for each integration service
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      variant={check.status === 'healthy' ? 'default' : 'destructive'}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationHealthChecker;
