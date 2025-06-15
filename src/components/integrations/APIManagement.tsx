
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Edit
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

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    try {
      setTestingEndpoint(endpoint.id);
      const result = await integrationDatabaseService.testApiEndpoint(endpoint.id);
      
      toast({
        title: result.success ? 'Test Successful' : 'Test Failed',
        description: `Status: ${result.status}`,
        variant: result.success ? 'default' : 'destructive'
      });
      
      loadEndpoints();
    } catch (error) {
      console.error('Error testing endpoint:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test API endpoint',
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
            Configure and test your API endpoints
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

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

      {/* Endpoints List */}
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
          <h3 className="text-xl font-semibold mb-2">No API Endpoints</h3>
          <p className="text-muted-foreground mb-4">
            Create your first API endpoint to start managing external integrations
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  );
};

export default APIManagement;
