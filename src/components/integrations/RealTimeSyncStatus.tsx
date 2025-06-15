
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const RealTimeSyncStatus: React.FC = () => {
  const syncStatus = [
    {
      source: 'TaskMaster',
      target: 'TimeTrackPro',
      status: 'synced',
      lastSync: '2 minutes ago',
      recordsSynced: 156
    },
    {
      source: 'PlanBoard',
      target: 'ResourceHub',
      status: 'syncing',
      lastSync: 'Now',
      recordsSynced: 89
    },
    {
      source: 'BudgetBuddy',
      target: 'InsightIQ',
      status: 'error',
      lastSync: '1 hour ago',
      recordsSynced: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Real-Time Sync Status
          </CardTitle>
          <CardDescription>
            Monitor data synchronization across all ProSync apps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncStatus.map((sync, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(sync.status)}
                  <div>
                    <h4 className="font-medium">
                      {sync.source} → {sync.target}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Last sync: {sync.lastSync}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={sync.status === 'synced' ? 'default' : sync.status === 'error' ? 'destructive' : 'secondary'}>
                    {sync.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sync.recordsSynced} records
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

export default RealTimeSyncStatus;
