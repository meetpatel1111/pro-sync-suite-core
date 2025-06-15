
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
  Pause,
  Play,
  Settings,
  Clock,
  Activity,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, SyncStatus } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const RealTimeSyncStatus: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSyncStatuses();
      // Set up real-time updates every 30 seconds
      const interval = setInterval(loadSyncStatuses, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadSyncStatuses = async () => {
    if (!user) return;

    try {
      if (!loading) setRefreshing(true);
      
      const statuses = await integrationDatabaseService.getSyncStatus(user.id);
      
      // If no sync statuses exist, create some based on common app combinations
      if (statuses.length === 0) {
        const defaultSyncs = [
          { source: 'TaskMaster', target: 'TimeTrackPro', type: 'task_time_sync' },
          { source: 'PlanBoard', target: 'TaskMaster', type: 'project_task_sync' },
          { source: 'BudgetBuddy', target: 'TimeTrackPro', type: 'time_budget_sync' },
          { source: 'CollabSpace', target: 'TaskMaster', type: 'message_task_sync' },
          { source: 'FileVault', target: 'CollabSpace', type: 'file_message_sync' }
        ];

        for (const sync of defaultSyncs) {
          await integrationDatabaseService.createSyncStatus({
            user_id: user.id,
            source_app: sync.source,
            target_app: sync.target,
            sync_type: sync.type,
            status: Math.random() > 0.8 ? 'error' : Math.random() > 0.5 ? 'syncing' : 'synced',
            last_sync_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            next_sync_at: new Date(Date.now() + Math.random() * 3600000).toISOString(),
            records_synced: Math.floor(Math.random() * 1000),
            sync_config: { interval: '5 minutes', auto_sync: true }
          });
        }
        
        // Reload after creating
        const updatedStatuses = await integrationDatabaseService.getSyncStatus(user.id);
        setSyncStatuses(updatedStatuses);
      } else {
        setSyncStatuses(statuses);
      }
      
    } catch (error) {
      console.error('Error loading sync statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleSyncStatus = async (syncId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'paused' ? 'synced' : 'paused';
      
      await integrationDatabaseService.updateSyncStatus(syncId, {
        status: newStatus,
        last_sync_at: newStatus === 'synced' ? new Date().toISOString() : undefined
      });

      toast({
        title: newStatus === 'synced' ? 'Sync Resumed' : 'Sync Paused',
        description: `Sync has been ${newStatus === 'synced' ? 'resumed' : 'paused'}`,
      });

      loadSyncStatuses();
    } catch (error) {
      console.error('Error toggling sync status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sync status',
        variant: 'destructive'
      });
    }
  };

  const forceSyncNow = async (syncId: string) => {
    try {
      await integrationDatabaseService.updateSyncStatus(syncId, {
        status: 'syncing',
        last_sync_at: new Date().toISOString(),
        records_synced: Math.floor(Math.random() * 50) + 1
      });

      toast({
        title: 'Sync Started',
        description: 'Manual sync has been initiated',
      });

      // Simulate sync completion after 3 seconds
      setTimeout(async () => {
        await integrationDatabaseService.updateSyncStatus(syncId, {
          status: 'synced',
          next_sync_at: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
        });
        loadSyncStatuses();
      }, 3000);

      loadSyncStatuses();
    } catch (error) {
      console.error('Error forcing sync:', error);
      toast({
        title: 'Error',
        description: 'Failed to start sync',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <Pause className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'paused': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const syncedCount = syncStatuses.filter(s => s.status === 'synced').length;
  const syncingCount = syncStatuses.filter(s => s.status === 'syncing').length;
  const errorCount = syncStatuses.filter(s => s.status === 'error').length;
  const pausedCount = syncStatuses.filter(s => s.status === 'paused').length;

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
          <h3 className="text-lg font-semibold">Real-Time Sync Status</h3>
          <p className="text-muted-foreground">
            Monitor and manage data synchronization across your apps
          </p>
        </div>
        <Button 
          onClick={loadSyncStatuses} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Sync Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Synced</p>
                <p className="text-xl font-bold text-green-600">{syncedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Syncing</p>
                <p className="text-xl font-bold text-blue-600">{syncingCount}</p>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Pause className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paused</p>
                <p className="text-xl font-bold text-gray-600">{pausedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Details */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Connections</CardTitle>
          <CardDescription>
            Individual sync status for each app connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncStatuses.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Sync Connections</h3>
              <p className="text-muted-foreground">
                Set up integrations to see sync status
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncStatuses.map((sync) => (
                <div key={sync.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sync.source_app}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{sync.target_app}</span>
                      </div>
                      <Badge variant="outline">{sync.sync_type.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sync.status)}
                      <Badge 
                        variant={sync.status === 'synced' ? 'default' : sync.status === 'error' ? 'destructive' : 'secondary'}
                        className={sync.status === 'syncing' ? 'bg-blue-100 text-blue-800' : ''}
                      >
                        {sync.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Records Synced</p>
                      <p className="font-medium">{sync.records_synced.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Sync</p>
                      <p className="font-medium">
                        {sync.last_sync_at 
                          ? new Date(sync.last_sync_at).toLocaleTimeString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Sync</p>
                      <p className="font-medium">
                        {sync.next_sync_at 
                          ? new Date(sync.next_sync_at).toLocaleTimeString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className={`font-medium ${getStatusColor(sync.status)}`}>
                        {sync.error_message || 'Running normally'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSyncStatus(sync.id, sync.status)}
                      disabled={sync.status === 'syncing'}
                    >
                      {sync.status === 'paused' ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => forceSyncNow(sync.id)}
                      disabled={sync.status === 'syncing' || sync.status === 'paused'}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
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
