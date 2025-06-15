
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
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<SyncActivity[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalSynced, setTotalSynced] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadSyncData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSyncData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load integration actions to determine which apps are connected
      const integrationActions = await integrationService.getUserIntegrationActions(user.id);
      
      // Convert integration actions to sync statuses
      const statuses: SyncStatus[] = integrationActions.map(action => ({
        id: action.id,
        app: action.source_app || action.target_app,
        status: action.enabled ? 'synced' : 'pending',
        progress: action.enabled ? 100 : 0,
        lastSync: action.created_at,
        dataCount: 0,
        errors: 0
      }));

      setSyncStatuses(statuses);
      
      // Load recent activity (in a real implementation, this would come from an activity log)
      setRecentActivity([]);
      
    } catch (error) {
      console.error('Error loading sync data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (appId: string) => {
    try {
      setSyncStatuses(prev => prev.map(status => 
        status.id === appId 
          ? { ...status, status: 'syncing', progress: 0 }
          : status
      ));

      // Simulate sync process
      setTimeout(() => {
        setSyncStatuses(prev => prev.map(status => 
          status.id === appId 
            ? { ...status, status: 'synced', progress: 100, lastSync: new Date().toISOString() }
            : status
        ));
      }, 3000);

      toast({
        title: 'Sync Started',
        description: 'Manual synchronization has been initiated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start sync',
        variant: 'destructive'
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncStatuses(prev => prev.map(status => ({
        ...status,
        status: 'syncing',
        progress: 0
      })));

      // Simulate sync all process
      setTimeout(() => {
        setSyncStatuses(prev => prev.map(status => ({
          ...status,
          status: 'synced',
          progress: 100,
          lastSync: new Date().toISOString()
        })));
      }, 5000);

      toast({
        title: 'Syncing All Apps',
        description: 'Full synchronization started for all connected apps'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync all apps',
        variant: 'destructive'
      });
    }
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

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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
          <Button onClick={handleSyncAll} variant="outline" disabled={syncStatuses.length === 0}>
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

      {/* Sync Status Cards or Empty State */}
      {syncStatuses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Set up integrations to see real-time sync status
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
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
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
          <CardDescription>Latest synchronization events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-0.5">
                    {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                    {activity.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeSyncStatus;
