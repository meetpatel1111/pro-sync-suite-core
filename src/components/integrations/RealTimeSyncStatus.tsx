
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Zap,
  Activity,
  Wifi,
  WifiOff,
  Database,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  id: string;
  app: string;
  status: 'syncing' | 'synced' | 'error' | 'pending';
  progress: number;
  lastSync: string;
  dataCount: number;
  errors: number;
}

interface SyncActivity {
  id: string;
  timestamp: string;
  app: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'warning';
}

const RealTimeSyncStatus: React.FC = () => {
  const { toast } = useToast();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    {
      id: '1',
      app: 'TaskMaster',
      status: 'synced',
      progress: 100,
      lastSync: new Date().toISOString(),
      dataCount: 150,
      errors: 0
    },
    {
      id: '2',
      app: 'TimeTrackPro',
      status: 'syncing',
      progress: 65,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      dataCount: 89,
      errors: 0
    },
    {
      id: '3',
      app: 'BudgetBuddy',
      status: 'error',
      progress: 0,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      dataCount: 0,
      errors: 3
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<SyncActivity[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      app: 'TaskMaster',
      action: 'Data Sync',
      details: 'Synchronized 25 tasks successfully',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      app: 'TimeTrackPro',
      action: 'Time Entry Update',
      details: 'Updated 8 time entries',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      app: 'BudgetBuddy',
      action: 'Connection Failed',
      details: 'Authentication error - check API key',
      status: 'error'
    }
  ]);

  const [isOnline, setIsOnline] = useState(true);
  const [totalSynced, setTotalSynced] = useState(0);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSyncStatuses(prev => prev.map(status => {
        if (status.status === 'syncing' && status.progress < 100) {
          const newProgress = Math.min(status.progress + Math.random() * 10, 100);
          return {
            ...status,
            progress: newProgress,
            status: newProgress === 100 ? 'synced' : 'syncing',
            lastSync: newProgress === 100 ? new Date().toISOString() : status.lastSync
          };
        }
        return status;
      }));

      // Update total synced count
      setTotalSynced(prev => prev + Math.floor(Math.random() * 5));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = (appId: string) => {
    setSyncStatuses(prev => prev.map(status => 
      status.id === appId 
        ? { ...status, status: 'syncing', progress: 0 }
        : status
    ));

    toast({
      title: 'Sync Started',
      description: 'Manual synchronization has been initiated'
    });
  };

  const handleSyncAll = () => {
    setSyncStatuses(prev => prev.map(status => ({
      ...status,
      status: 'syncing',
      progress: 0
    })));

    toast({
      title: 'Syncing All Apps',
      description: 'Full synchronization started for all connected apps'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-time Sync Status</h3>
          <p className="text-muted-foreground">
            Monitor live data synchronization across all integrated apps
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Offline</span>
              </>
            )}
          </div>
          <Button onClick={handleSyncAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Synced</p>
                <p className="text-xl font-bold">{totalSynced.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Active Syncs</p>
                <p className="text-xl font-bold">{syncStatuses.filter(s => s.status === 'synced').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{syncStatuses.filter(s => s.status === 'syncing').length}</p>
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
                <p className="text-xl font-bold">{syncStatuses.reduce((sum, s) => sum + s.errors, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {syncStatuses.map((sync) => (
          <Card key={sync.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{sync.app}</CardTitle>
                <Badge className={getStatusColor(sync.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(sync.status)}
                    {sync.status}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sync.status === 'syncing' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(sync.progress)}%</span>
                    </div>
                    <Progress value={sync.progress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Last Sync</p>
                    <p className="font-medium">{formatTimeAgo(sync.lastSync)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Records</p>
                    <p className="font-medium">{sync.dataCount}</p>
                  </div>
                </div>

                {sync.errors > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{sync.errors} error(s) detected</span>
                  </div>
                )}

                <Button
                  onClick={() => handleManualSync(sync.id)}
                  disabled={sync.status === 'syncing'}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Manual Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
          <CardDescription>Latest synchronization events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-0.5">
                  {getActivityStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.app}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{activity.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.details}
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
