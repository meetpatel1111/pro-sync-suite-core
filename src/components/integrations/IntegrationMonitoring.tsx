
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const IntegrationMonitoring: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState([
    {
      service: 'TaskMaster',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: '2 minutes ago',
      responseTime: 120
    },
    {
      service: 'TimeTrackPro',
      status: 'healthy',
      uptime: '99.8%',
      lastCheck: '1 minute ago',
      responseTime: 95
    },
    {
      service: 'CollabSpace',
      status: 'warning',
      uptime: '98.5%',
      lastCheck: '5 minutes ago',
      responseTime: 250
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Health Monitoring
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all ProSync Suite integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthStatus.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.service}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {service.lastCheck}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={service.status === 'healthy' ? 'default' : 'secondary'}>
                    {service.uptime} uptime
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.responseTime}ms avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationMonitoring;
