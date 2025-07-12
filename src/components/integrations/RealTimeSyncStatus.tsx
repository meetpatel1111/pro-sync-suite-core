
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RealTimeSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadSyncStatus();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get active integrations
      const { data: integrations } = await supabase
        .from('integration_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);

      // Get recent time entries for sync status
      const { data: timeEntries } = await supabase
        .from('productivity_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent tasks for sync status
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      // Get projects for sync status
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      // Build sync status data
      const statusData = [
        {
          app: 'TaskMaster',
          status: tasks && tasks.length > 0 ? 'synced' : 'pending',
          lastSync: tasks && tasks.length > 0 ? new Date(tasks[0].updated_at) : null,
          recordCount: tasks?.length || 0,
          syncType: 'Tasks & Projects'
        },
        {
          app: 'TimeTrackPro',
          status: timeEntries && timeEntries.length > 0 ? 'synced' : 'pending',
          lastSync: timeEntries && timeEntries.length > 0 ? new Date(timeEntries[0].created_at) : null,
          recordCount: timeEntries?.length || 0,
          syncType: 'Time Entries'
        },
        {
          app: 'PlanBoard',
          status: projects && projects.length > 0 ? 'synced' : 'pending',
          lastSync: projects && projects.length > 0 ? new Date(projects[0].updated_at) : null,
          recordCount: projects?.length || 0,
          syncType: 'Project Planning'
        },
        {
          app: 'Integration Hub',
          status: integrations && integrations.length > 0 ? 'active' : 'inactive',
          lastSync: new Date(),
          recordCount: integrations?.length || 0,
          syncType: 'Cross-App Sync'
        }
      ];

      setSyncStatus(statusData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading sync status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync status',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSyncStatus();
    setIsRefreshing(false);
    
    toast({
      title: 'Refreshed',
      description: 'Sync status has been updated'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'syncing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
      case 'active':
        return CheckCircle;
      case 'syncing':
        return RefreshCw;
      case 'pending':
        return Clock;
      case 'error':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Sync Status</h2>
          <p className="text-muted-foreground">
            Monitor data synchronization across all ProSync Suite apps
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Sync Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus.length}</div>
            <p className="text-xs text-muted-foreground">
              Connected applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {syncStatus.filter(s => s.status === 'synced' || s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently synchronized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus.reduce((acc, s) => acc + s.recordCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total synchronized records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((syncStatus.filter(s => s.status === 'synced' || s.status === 'active').length / Math.max(syncStatus.length, 1)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall health score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sync Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Application Sync Details</h3>
        {syncStatus.map((app, index) => {
          const StatusIcon = getStatusIcon(app.status);
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(app.status)}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{app.app}</h4>
                      <p className="text-sm text-muted-foreground">{app.syncType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.recordCount} records
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last sync: {formatLastSync(app.lastSync)}</span>
                    <span className="text-muted-foreground">
                      {app.status === 'synced' || app.status === 'active' ? 'Up to date' : 'Sync pending'}
                    </span>
                  </div>
                  <Progress 
                    value={app.status === 'synced' || app.status === 'active' ? 100 : 
                           app.status === 'syncing' ? 65 : 
                           app.status === 'pending' ? 30 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {syncStatus.length === 0 && (
        <Card className="p-8 text-center">
          <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Sync Data</h3>
          <p className="text-muted-foreground">
            Start using ProSync Suite apps to see real-time sync status
          </p>
        </Card>
      )}
    </div>
  );
};

export default RealTimeSyncStatus;
