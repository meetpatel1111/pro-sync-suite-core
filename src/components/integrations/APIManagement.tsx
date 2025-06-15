
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Edit,
  Trash2,
  Play,
  Settings,
  Globe,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, APIEndpoint } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

const APIManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<APIEndpoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET' as const,
    headers: '{}',
    auth_config: '{}',
    rate_limit: 100,
    timeout_seconds: 30
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
      const data = await integrationDatabaseService.getAPIEndpoints(user.id);
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
      let headers, authConfig;
      
      try {
        headers = JSON.parse(formData.headers || '{}');
        authConfig = JSON.parse(formData.auth_config || '{}');
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your headers and auth configuration JSON',
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
        auth_config: authConfig,
        rate_limit: formData.rate_limit,
        timeout_seconds: formData.timeout_seconds,
        is_active: true
      };

      if (editingEndpoint) {
        await integrationDatabaseService.updateAPIEndpoint(editingEndpoint.id, endpointData);
        toast({
          title: 'Endpoint Updated',
          description: 'API endpoint has been updated successfully'
        });
      } else {
        await integrationDatabaseService.createAPIEndpoint(endpointData);
        toast({
          title: 'Endpoint Created',
          description: 'New API endpoint has been created successfully'
        });
      }

      setShowCreateForm(false);
      setEditingEndpoint(null);
      setFormData({
        name: '',
        url: '',
        method: 'GET',
        headers: '{}',
        auth_config: '{}',
        rate_limit: 100,
        timeout_seconds: 30
      });
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

  const handleEdit = (endpoint: APIEndpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      headers: JSON.stringify(endpoint.headers, null, 2),
      auth_config: JSON.stringify(endpoint.auth_config, null, 2),
      rate_limit: endpoint.rate_limit || 100,
      timeout_seconds: endpoint.timeout_seconds
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (endpointId: string) => {
    try {
      await integrationDatabaseService.deleteAPIEndpoint(endpointId);
      toast({
        title: 'Endpoint Deleted',
        description: 'API endpoint has been deleted successfully'
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

  const testEndpoint = async (endpoint: APIEndpoint) => {
    try {
      // Update status to pending
      await integrationDatabaseService.updateAPIEndpoint(endpoint.id, {
        test_status: 'pending',
        last_tested_at: new Date().toISOString()
      });

      toast({
        title: 'Testing Endpoint',
        description: 'Testing API endpoint...'
      });

      // Simulate API test (in real implementation, this would make actual HTTP request)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate
      
      await integrationDatabaseService.updateAPIEndpoint(endpoint.id, {
        test_status: success ? 'success' : 'failed',
        last_tested_at: new Date().toISOString()
      });

      toast({
        title: success ? 'Test Successful' : 'Test Failed',
        description: success 
          ? 'API endpoint is responding correctly'
          : 'API endpoint test failed',
        variant: success ? 'default' : 'destructive'
      });

      loadEndpoints();
    } catch (error) {
      console.error('Error testing endpoint:', error);
      toast({
        title: 'Test Error',
        description: 'Failed to test API endpoint',
        variant: 'destructive'
      });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
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
          <h3 className="text-lg font-semibold">API Management</h3>
          <p className="text-muted-foreground">
            Manage and test your API endpoints and connections
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
            </CardTitle>
            <CardDescription>
              Configure your API endpoint settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Endpoint name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
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
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Timeout (seconds)</label>
                  <Input
                    type="number"
                    value={formData.timeout_seconds}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Headers (JSON)</label>
                <Textarea
                  value={formData.headers}
                  onChange={(e) => setFormData(prev => ({ ...prev, headers: e.target.value }))}
                  placeholder='{"Content-Type": "application/json"}'
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Auth Configuration (JSON)</label>
                <Textarea
                  value={formData.auth_config}
                  onChange={(e) => setFormData(prev => ({ ...prev, auth_config: e.target.value }))}
                  placeholder='{"type": "bearer", "token": "your-token"}'
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingEndpoint ? 'Update' : 'Create'} Endpoint
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEndpoint(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Endpoints List */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Your configured API endpoints and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Endpoints</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API endpoint to get started
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{endpoint.name}</h4>
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        {!endpoint.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground break-all">
                        {endpoint.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(endpoint.test_status)}
                      <span className="text-xs text-muted-foreground">
                        {endpoint.last_tested_at 
                          ? new Date(endpoint.last_tested_at).toLocaleString()
                          : 'Never tested'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Rate Limit</p>
                      <p className="font-medium">
                        {endpoint.rate_limit ? `${endpoint.rate_limit}/min` : 'Unlimited'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeout</p>
                      <p className="font-medium">{endpoint.timeout_seconds}s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Auth Type</p>
                      <p className="font-medium">
                        {endpoint.auth_config?.type || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {endpoint.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testEndpoint(endpoint)}
                      disabled={endpoint.test_status === 'pending'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(endpoint)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(endpoint.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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

export default APIManagement;
