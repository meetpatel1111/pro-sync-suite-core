
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  TestTube,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Trash2,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, ApiEndpoint } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const APIManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpoint | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('prosync-apis');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET',
    headers: '{}',
    auth_config: '{}',
    rate_limit: 100,
    timeout_seconds: 30,
    is_active: true
  });

  // Real ProSync Suite API endpoints using Edge Functions
  const preSyncAPIs = [
    // TaskMaster APIs
    { app: 'TaskMaster', name: 'Get Tasks', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-taskmaster-tasks`, description: 'Retrieve all tasks from database' },
    { app: 'TaskMaster', name: 'Get Projects', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-taskmaster-projects`, description: 'Retrieve all projects from database' },
    
    // TimeTrackPro APIs
    { app: 'TimeTrackPro', name: 'Get Time Entries', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-timetrack-entries`, description: 'Retrieve time tracking entries from database' },
    { app: 'TimeTrackPro', name: 'Get Time Summary', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-timetrack-summary`, description: 'Get calculated time tracking summary' },
    
    // BudgetBuddy APIs
    { app: 'BudgetBuddy', name: 'Get Expenses', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-budget-expenses`, description: 'Retrieve all expenses from database' },
    { app: 'BudgetBuddy', name: 'Get Budgets', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-budget-budgets`, description: 'Retrieve budget information from database' },
    
    // CollabSpace APIs
    { app: 'CollabSpace', name: 'Get Channels', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-collab-channels`, description: 'Retrieve communication channels from database' },
    { app: 'CollabSpace', name: 'Get Messages', method: 'GET', url: `https://iqevpdydshphxaszljsp.supabase.co/functions/v1/api-collab-messages`, description: 'Retrieve messages from database' },
    
    // FileVault APIs (using static for now)
    { app: 'FileVault', name: 'Get Files', method: 'GET', url: `${window.location.origin}/api/filevault/files.json`, description: 'Retrieve file listings' },
    { app: 'FileVault', name: 'Get Folders', method: 'GET', url: `${window.location.origin}/api/filevault/folders.json`, description: 'Retrieve folder structure' },
    
    // PlanBoard APIs (using static for now)
    { app: 'PlanBoard', name: 'Get Projects', method: 'GET', url: `${window.location.origin}/api/planboard/projects.json`, description: 'Retrieve planning projects' },
    { app: 'PlanBoard', name: 'Get Milestones', method: 'GET', url: `${window.location.origin}/api/planboard/milestones.json`, description: 'Retrieve project milestones' },
    
    // ClientConnect APIs (using static for now)
    { app: 'ClientConnect', name: 'Get Contacts', method: 'GET', url: `${window.location.origin}/api/clients/contacts.json`, description: 'Retrieve client contacts' },
    { app: 'ClientConnect', name: 'Get Interactions', method: 'GET', url: `${window.location.origin}/api/clients/interactions.json`, description: 'Retrieve client interactions' },
    
    // ResourceHub APIs (using static for now)
    { app: 'ResourceHub', name: 'Get Allocations', method: 'GET', url: `${window.location.origin}/api/resources/allocations.json`, description: 'Retrieve resource allocations' },
    { app: 'ResourceHub', name: 'Get Availability', method: 'GET', url: `${window.location.origin}/api/resources/availability.json`, description: 'Get resource availability' },
    
    // InsightIQ APIs (using static for now)
    { app: 'InsightIQ', name: 'Get Reports', method: 'GET', url: `${window.location.origin}/api/insights/reports.json`, description: 'Retrieve analytics reports' },
    { app: 'InsightIQ', name: 'Get Analytics', method: 'GET', url: `${window.location.origin}/api/insights/analytics.json`, description: 'Get analytics data' },
    
    // RiskRadar APIs (using static for now)
    { app: 'RiskRadar', name: 'Get Risk Assessments', method: 'GET', url: `${window.location.origin}/api/risks/assessments.json`, description: 'Retrieve risk assessments' },
    { app: 'RiskRadar', name: 'Get Mitigations', method: 'GET', url: `${window.location.origin}/api/risks/mitigations.json`, description: 'Get risk mitigations' }
  ];

  useEffect(() => {
    if (user) {
      loadEndpoints();
    }
  }, [user]);

  const loadEndpoints = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await integrationDatabaseService.getApiEndpoints(user.id);
      setEndpoints(data);
    } catch (error) {
      console.error('Error loading API endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API endpoints',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let headers, auth_config;
      
      try {
        headers = JSON.parse(formData.headers);
        auth_config = JSON.parse(formData.auth_config);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your headers and auth config JSON syntax',
          variant: 'destructive'
        });
        return;
      }

      const endpointData = {
        user_id: user.id,
        name: formData.name,
        url: formData.url,
        method: formData.method,
        headers,
        auth_config,
        rate_limit: formData.rate_limit,
        timeout_seconds: formData.timeout_seconds,
        is_active: formData.is_active,
        test_status: 'pending' as const,
        last_tested_at: new Date().toISOString()
      };

      if (editingEndpoint) {
        await integrationDatabaseService.updateApiEndpoint(editingEndpoint.id, endpointData);
        toast({
          title: 'Success',
          description: 'API endpoint updated successfully'
        });
      } else {
        await integrationDatabaseService.createApiEndpoint(endpointData);
        toast({
          title: 'Success',
          description: 'API endpoint created successfully'
        });
      }

      resetForm();
      loadEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API endpoint',
        variant: 'destructive'
      });
    }
  };

  const testEndpoint = async (endpoint: ApiEndpoint | any) => {
    try {
      const endpointId = endpoint.id || `test-${Date.now()}`;
      setTestingEndpoint(endpointId);
      
      const startTime = Date.now();
      const response = await fetch(endpoint.url, {
        method: endpoint.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers
        },
        signal: AbortSignal.timeout((endpoint.timeout_seconds || 30) * 1000)
      });
      
      const responseTime = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Invalid JSON response' };
      }
      
      const isSuccess = response.ok && responseData.success !== false;
      
      toast({
        title: isSuccess ? 'Test Successful' : 'Test Failed',
        description: `Status: ${response.status}, Time: ${responseTime}ms${responseData.error ? `, Error: ${responseData.error}` : ''}`,
        variant: isSuccess ? 'default' : 'destructive'
      });
      
      if (endpoint.id) {
        loadEndpoints();
      }
    } catch (error) {
      console.error('Error testing endpoint:', error);
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to test API endpoint',
        variant: 'destructive'
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  const deleteEndpoint = async (id: string) => {
    try {
      await integrationDatabaseService.deleteApiEndpoint(id);
      toast({
        title: 'Success',
        description: 'API endpoint deleted successfully'
      });
      loadEndpoints();
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API endpoint',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      method: 'GET',
      headers: '{}',
      auth_config: '{}',
      rate_limit: 100,
      timeout_seconds: 30,
      is_active: true
    });
    setShowAddForm(false);
    setEditingEndpoint(null);
  };

  const editEndpoint = (endpoint: ApiEndpoint) => {
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      headers: JSON.stringify(endpoint.headers, null, 2),
      auth_config: JSON.stringify(endpoint.auth_config, null, 2),
      rate_limit: endpoint.rate_limit || 100,
      timeout_seconds: endpoint.timeout_seconds,
      is_active: endpoint.is_active
    });
    setEditingEndpoint(endpoint);
    setShowAddForm(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard'
    });
  };

  const addProSyncAPI = async (api: any) => {
    if (!user) return;

    const endpointData = {
      user_id: user.id,
      name: api.name,
      url: api.url,
      method: api.method,
      headers: {},
      auth_config: {},
      rate_limit: 100,
      timeout_seconds: 30,
      is_active: true,
      test_status: 'pending' as const,
      last_tested_at: new Date().toISOString()
    };

    try {
      await integrationDatabaseService.createApiEndpoint(endpointData);
      toast({
        title: 'Success',
        description: `${api.name} added to your managed endpoints`
      });
      loadEndpoints();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add API endpoint',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
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
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-muted-foreground">
            Configure and test your real API endpoints
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Endpoint
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Real API Endpoints</h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          These endpoints connect to your live Supabase database and return real data. TaskMaster, TimeTrackPro, BudgetBuddy, and CollabSpace use Edge Functions, while others use static JSON for now.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prosync-apis">ProSync Suite APIs</TabsTrigger>
          <TabsTrigger value="custom-apis">Custom APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="prosync-apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available ProSync Suite APIs</CardTitle>
              <CardDescription>
                Real API endpoints that connect to your live database and return dynamic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  preSyncAPIs.reduce((acc, api) => {
                    if (!acc[api.app]) acc[api.app] = [];
                    acc[api.app].push(api);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([app, apis]) => (
                  <div key={app} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {app}
                      {['TaskMaster', 'TimeTrackPro', 'BudgetBuddy', 'CollabSpace'].includes(app) && (
                        <Badge variant="default" className="text-xs">Live Database</Badge>
                      )}
                    </h3>
                    <div className="grid gap-3">
                      {apis.map((api, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded bg-gray-50 dark:bg-gray-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{api.method}</Badge>
                              <span className="font-medium">{api.name}</span>
                              {['TaskMaster', 'TimeTrackPro', 'BudgetBuddy', 'CollabSpace'].includes(app) && (
                                <Badge variant="secondary" className="text-xs">Edge Function</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-muted-foreground truncate max-w-md">{api.url}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(api.url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(api.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testEndpoint(api)}
                              disabled={testingEndpoint === `test-${index}`}
                            >
                              <TestTube className="h-3 w-3 mr-1" />
                              {testingEndpoint === `test-${index}` ? 'Testing...' : 'Test'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addProSyncAPI(api)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-apis" className="space-y-4">
          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingEndpoint ? 'Edit API Endpoint' : 'Add New API Endpoint'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My API Endpoint"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Method</label>
                      <Select 
                        value={formData.method} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://api.example.com/endpoint"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Rate Limit (req/min)</label>
                      <Input
                        type="number"
                        value={formData.rate_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, rate_limit: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Timeout (seconds)</label>
                      <Input
                        type="number"
                        value={formData.timeout_seconds}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                        min="1"
                        max="300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Headers (JSON)</label>
                    <Textarea
                      value={formData.headers}
                      onChange={(e) => setFormData(prev => ({ ...prev, headers: e.target.value }))}
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Auth Config (JSON)</label>
                    <Textarea
                      value={formData.auth_config}
                      onChange={(e) => setFormData(prev => ({ ...prev, auth_config: e.target.value }))}
                      placeholder='{"type": "bearer", "token": "your-token"}'
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <label htmlFor="is_active" className="text-sm font-medium">
                        Active
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingEndpoint ? 'Update' : 'Create'} Endpoint
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Custom Endpoints List */}
          <div className="grid grid-cols-1 gap-4">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-base">{endpoint.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <span className="font-mono text-xs">{endpoint.url}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(endpoint.test_status)}
                        <Badge variant={getStatusColor(endpoint.test_status)}>
                          {endpoint.test_status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testEndpoint(endpoint)}
                          disabled={testingEndpoint === endpoint.id || !endpoint.is_active}
                        >
                          <TestTube className="h-3 w-3" />
                          {testingEndpoint === endpoint.id ? 'Testing...' : 'Test'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editEndpoint(endpoint)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEndpoint(endpoint.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        {endpoint.is_active ? (
                          <Globe className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-500" />
                        )}
                        {endpoint.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span>Rate limit: {endpoint.rate_limit || 100}/min</span>
                      <span>Timeout: {endpoint.timeout_seconds}s</span>
                    </div>
                    {endpoint.last_tested_at && (
                      <span className="text-muted-foreground">
                        Last tested: {new Date(endpoint.last_tested_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {endpoints.length === 0 && (
            <div className="text-center py-16">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Custom API Endpoints</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custom API endpoint to start managing external integrations
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Endpoint
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIManagement;
