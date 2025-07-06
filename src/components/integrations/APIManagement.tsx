
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Shield, 
  Activity, 
  Clock,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Code,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const APIManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadAPIData();
  }, []);

  const loadAPIData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load API usage data (mock for now since we don't have a specific table)
      const mockApiKeys = [
        {
          id: '1',
          name: 'TaskMaster Integration',
          key: 'tm_sk_live_51H...',
          description: 'API key for TaskMaster integration',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          requests_today: 847,
          requests_month: 23456,
          status: 'active'
        },
        {
          id: '2',
          name: 'TimeTrack API',
          key: 'tt_pk_test_12...',
          description: 'API key for time tracking integration',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          last_used: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          requests_today: 234,
          requests_month: 8967,
          status: 'active'
        }
      ];

      const mockEndpoints = [
        {
          id: '1',
          path: '/api/v1/tasks',
          method: 'GET',
          description: 'Retrieve tasks',
          requests_today: 453,
          avg_response_time: 120,
          success_rate: 99.2,
          status: 'active'
        },
        {
          id: '2',
          path: '/api/v1/tasks',
          method: 'POST',
          description: 'Create new task',
          requests_today: 89,
          avg_response_time: 89,
          success_rate: 98.7,
          status: 'active'
        },
        {
          id: '3',
          path: '/api/v1/time-entries',
          method: 'GET',
          description: 'Get time entries',
          requests_today: 234,
          avg_response_time: 156,
          success_rate: 99.8,
          status: 'active'
        }
      ];

      setApiKeys(mockApiKeys);
      setEndpoints(mockEndpoints);
    } catch (error) {
      console.error('Error loading API data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API data',
        variant: 'destructive'
      });
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the API key',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate a mock API key
      const newKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `ps_sk_${Math.random().toString(36).substr(2, 20)}`,
        description: newKeyDescription,
        created_at: new Date().toISOString(),
        last_used: null,
        requests_today: 0,
        requests_month: 0,
        status: 'active'
      };

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setNewKeyDescription('');
      setShowNewKeyForm(false);

      toast({
        title: 'API Key Generated',
        description: 'New API key has been created successfully'
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate API key',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard'
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-muted-foreground">
            Manage API keys, monitor usage, and configure endpoints
          </p>
        </div>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <Button onClick={() => setShowNewKeyForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>

          {showNewKeyForm && (
            <Card>
              <CardHeader>
                <CardTitle>Generate New API Key</CardTitle>
                <CardDescription>
                  Create a new API key for integration access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="e.g., Production Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Describe the purpose of this API key..."
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={generateAPIKey}>Generate Key</Button>
                  <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{key.name}</h4>
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                      </div>
                      {key.description && (
                        <p className="text-sm text-muted-foreground mb-3">{key.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {visibleKeys.has(key.id) ? key.key : key.key.replace(/./g, '•').slice(0, 20) + '...'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Created</div>
                          <div className="text-muted-foreground">{formatDate(key.created_at)}</div>
                        </div>
                        <div>
                          <div className="font-medium">Last Used</div>
                          <div className="text-muted-foreground">{formatDateTime(key.last_used)}</div>
                        </div>
                        <div>
                          <div className="font-medium">Requests Today</div>
                          <div className="text-muted-foreground">{key.requests_today.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-medium">Requests This Month</div>
                          <div className="text-muted-foreground">{key.requests_month.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <h3 className="text-lg font-semibold">API Endpoints</h3>
          
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                        <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                          {endpoint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Requests Today</div>
                          <div className="text-muted-foreground">{endpoint.requests_today}</div>
                        </div>
                        <div>
                          <div className="font-medium">Avg Response Time</div>
                          <div className="text-muted-foreground">{endpoint.avg_response_time}ms</div>
                        </div>
                        <div>
                          <div className="font-medium">Success Rate</div>
                          <div className="text-muted-foreground">{endpoint.success_rate}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {endpoint.success_rate >= 95 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-6">
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125ms</div>
                <p className="text-xs text-muted-foreground">
                  -5ms from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.1% from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>API requests over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-muted-foreground">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIManagement;
