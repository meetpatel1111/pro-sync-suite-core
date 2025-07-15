
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Link2,
  Database,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

interface Integration {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  syncFrequency: string;
  dataTransferred: number;
  errorCount: number;
  type: string;
}

const IntegrationDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStats, setSyncStats] = useState({
    totalIntegrations: 0,
    activeIntegrations: 0,
    successRate: 0,
    dataTransferred: 0
  });

  // Sample data for demonstration
  const sampleIntegrations: Integration[] = [
    {
      id: '1',
      name: 'TaskMaster → Slack',
      status: 'active',
      lastSync: '2 minutes ago',
      syncFrequency: 'Real-time',
      dataTransferred: 1547,
      errorCount: 0,
      type: 'notification'
    },
    {
      id: '2',
      name: 'BudgetBuddy → Google Sheets',
      status: 'active',
      lastSync: '5 minutes ago',
      syncFrequency: 'Every 5 minutes',
      dataTransferred: 892,
      errorCount: 0,
      type: 'data_export'
    },
    {
      id: '3',
      name: 'TimeTrack → Calendly',
      status: 'error',
      lastSync: '2 hours ago',
      syncFrequency: 'Daily',
      dataTransferred: 0,
      errorCount: 3,
      type: 'scheduling'
    },
    {
      id: '4',
      name: 'FileVault → Dropbox',
      status: 'active',
      lastSync: '1 minute ago',
      syncFrequency: 'Real-time',
      dataTransferred: 2341,
      errorCount: 0,
      type: 'storage'
    },
    {
      id: '5',
      name: 'ClientConnect → Mailchimp',
      status: 'inactive',
      lastSync: '1 day ago',
      syncFrequency: 'Weekly',
      dataTransferred: 156,
      errorCount: 1,
      type: 'marketing'
    }
  ];

  useEffect(() => {
    loadIntegrations();
  }, [user]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      // For now, use sample data
      setIntegrations(sampleIntegrations);
      
      // Calculate stats
      const stats = {
        totalIntegrations: sampleIntegrations.length,
        activeIntegrations: sampleIntegrations.filter(i => i.status === 'active').length,
        successRate: Math.round((sampleIntegrations.filter(i => i.status === 'active').length / sampleIntegrations.length) * 100),
        dataTransferred: sampleIntegrations.reduce((acc, i) => acc + i.dataTransferred, 0)
      };
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <Zap className="h-4 w-4" />;
      case 'data_export':
        return <Database className="h-4 w-4" />;
      case 'storage':
        return <Cloud className="h-4 w-4" />;
      case 'scheduling':
        return <Clock className="h-4 w-4" />;
      case 'marketing':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Link2 className="h-4 w-4" />;
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const newStatus = integration.status === 'active' ? 'inactive' : 'active';
    
    setIntegrations(prev => 
      prev.map(i => i.id === integrationId ? { ...i, status: newStatus } : i)
    );

    toast({
      title: 'Integration Updated',
      description: `${integration.name} has been ${newStatus === 'active' ? 'enabled' : 'disabled'}`,
    });
  };

  const handleRefreshIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    toast({
      title: 'Refreshing Integration',
      description: `Syncing ${integration.name}...`,
    });

    // Simulate refresh
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(i => i.id === integrationId ? { 
          ...i, 
          lastSync: 'Just now',
          status: i.status === 'error' ? 'active' : i.status
        } : i)
      );

      toast({
        title: 'Integration Refreshed',
        description: `${integration.name} has been synced successfully`,
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Integrations</p>
                <p className="text-3xl font-bold text-blue-800">{syncStats.totalIntegrations}</p>
              </div>
              <Link2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Active</p>
                <p className="text-3xl font-bold text-emerald-800">{syncStats.activeIntegrations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Success Rate</p>
                <p className="text-3xl font-bold text-purple-800">{syncStats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Data Synced</p>
                <p className="text-3xl font-bold text-orange-800">{syncStats.dataTransferred.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(integration.type)}
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    </div>
                    <Badge className={`${getStatusColor(integration.status)} capitalize`}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1">{integration.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshIntegration(integration.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={integration.status === 'active'}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Last Sync:</span>
                    <p>{integration.lastSync}</p>
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span>
                    <p>{integration.syncFrequency}</p>
                  </div>
                  <div>
                    <span className="font-medium">Data Transferred:</span>
                    <p>{integration.dataTransferred.toLocaleString()} records</p>
                  </div>
                  <div>
                    <span className="font-medium">Errors:</span>
                    <p className={integration.errorCount > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      {integration.errorCount}
                    </p>
                  </div>
                </div>
                
                {integration.status === 'active' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Sync Progress</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationDashboard;
