
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
  Wifi,
  WifiOff,
  Database,
  Activity,
  Pause,
  Play,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

interface SyncStatus {
  id: string;
  source_app: string;
  target_app: string;
  sync_type: string;
  status: 'synced' | 'syncing' | 'error' | 'paused';
  last_sync_at: string;
  next_sync_at: string;
  records_synced: number;
  error_message?: string;
  progress?: number;
}

const RealTimeSyncStatus: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // Mock sync statuses for demonstration
  const mockSyncStatuses: SyncStatus[] = [
    {
      id: '1',
      source_app: 'TaskMaster',
      target_app: 'PlanBoard',
      sync_type: 'real-time',
      status: 'synced',
      last_sync_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      next_sync_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      records_synced: 45,
      progress: 100
    },
    {
      id: '2',
      source_app: 'TimeTrackPro',
      target_app: 'BudgetBuddy',
      sync_type: 'scheduled',
      status: 'syncing',
      last_sync_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      next_sync_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      records_synced: 127,
      progress: 65
    },
    {
      id: '3',
      source_app: 'FileVault',
      target_app: 'CollabSpace',
      sync_type: 'event-driven',
      status: 'error',
      last_sync_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      next_sync_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      records_synced: 0,
      error_message: 'Authentication failed - please check API credentials',
      progress: 0
    },
    {
      id: '4',
      source_app: 'CollabSpace',
      target_app: 'TaskMaster',
      sync_type: 'real-time',
      status: 'paused',
      last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      next_sync_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      records_synced: 89,
      progress: 0
    },
    {
      id: '5',
      source_app: 'ResourceHub',
      target_app: 'InsightIQ',
      sync_type: 'batch',
      status: 'synced',
      last_sync_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      next_sync_at: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      records_synced: 203,
      progress: 100
    }
  ];

  useEffect(() => {
    loadSyncStatuses();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateSyncStatuses();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadSyncStatuses = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the database
      setSyncStatuses(mockSyncStatuses);
    } catch (error) {
      console.error('Error loading sync statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync statuses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSyncStatuses = () => {
    setSyncStatuses(prev => prev.map(status => {
      if (status.status === 'syncing' && status.progress < 100) {
        return {
          ...status,
          progress: Math.min(100, status.progress + Math.random() * 15),
          records_synced: status.records_synced + Math.floor(Math.random() * 3)
        };
      }
      if (status.status === 'syncing' && status.progress >= 100) {
        return {
          ...status,
          status: 'synced' as const,
          last_sync_at: new Date().toISOString()
        };
      }
      return status;
    }));
  };

  const forceSyncNow = async (syncId: string) => {
    try {
      setSyncStatuses(prev => prev.map(status => 
        status.id === syncId 
          ? { ...status, status: 'syncing' as const, progress: 0 }
          : status
      ));
      
      toast({
        title: 'Sync Started',
        description: 'Manual sync has been initiated',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to start manual sync',
        variant: 'destructive'
      });
    }
  };

  const pauseSync = async (syncId: string) => {
    try {
      setSyncStatuses(prev => prev.map(status => 
        status.id === syncId 
          ? { ...status, status: 'paused' as const }
          : status
      ));
      
      toast({
        title: 'Sync Paused',
        description: 'Sync has been paused',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to pause sync',
        variant: 'destructive'
      });
    }
  };

  const resumeSync = async (syncId: string) => {
    try {
      setSyncStatuses(prev => prev.map(status => 
        status.id === syncId 
          ? { ...status, status: 'synced' as const }
          : status
      ));
      
      toast({
        title: 'Sync Resumed',
        description: 'Sync has been resumed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resume sync',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'default';
      case 'syncing': return 'secondary';
      case 'error': return 'destructive';
      case 'paused': return 'outline';
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

  const formatNextSync = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((time.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Syncing now';
    if (diffInMinutes < 60) return `In ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `In ${Math.floor(diffInMinutes / 60)}h`;
    return `In ${Math.floor(diffInMinutes / 1440)}d`;
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
          <h2 className="text-2xl font-bold">Real-Time Sync Status</h2>
          <p className="text-muted-foreground">
            Monitor data synchronization across all integrated apps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button variant="outline" onClick={loadSyncStatuses}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatuses.filter(s => s.status !== 'paused').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {syncStatuses.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Synced</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatuses.reduce((sum, s) => sum + s.records_synced, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              in last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatuses.filter(s => s.status === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status List */}
      <div className="space-y-4">
        {syncStatuses.map((sync) => (
          <Card key={sync.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(sync.status)}
                  <div>
                    <CardTitle className="text-base">
                      {sync.source_app} → {sync.target_app}
                    </CardTitle>
                    <CardDescription>
                      {sync.sync_type} sync • {sync.records_synced} records
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(sync.status)}>
                    {sync.status}
                  </Badge>
                  <div className="flex gap-1">
                    {sync.status === 'paused' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resumeSync(sync.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pauseSync(sync.id)}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => forceSyncNow(sync.id)}
                      disabled={sync.status === 'syncing'}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sync.status === 'syncing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sync Progress</span>
                    <span>{Math.round(sync.progress || 0)}%</span>
                  </div>
                  <Progress value={sync.progress || 0} className="h-2" />
                </div>
              )}

              {sync.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800">Sync Error</div>
                      <div className="text-sm text-red-600">{sync.error_message}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Last sync: {formatTimeAgo(sync.last_sync_at)}</span>
                  {sync.status !== 'error' && (
                    <span>Next sync: {formatNextSync(sync.next_sync_at)}</span>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {sync.sync_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {syncStatuses.length === 0 && (
        <div className="text-center py-16">
          <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Syncs</h3>
          <p className="text-muted-foreground">
            Set up integrations to start syncing data between apps
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeSyncStatus;
