
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Key, 
  Globe, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'api_key' | 'bearer' | 'basic';
    value: string;
  };
  rateLimit: {
    requests: number;
    period: string;
  };
  lastTested: string;
  status: 'active' | 'inactive' | 'error';
  responseTime: number;
}

const APIManagement: React.FC = () => {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'TaskMaster API',
      url: 'https://api.taskmaster.com/v1',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      authentication: { type: 'api_key', value: 'tm_***************' },
      rateLimit: { requests: 1000, period: 'hour' },
      lastTested: '2024-01-15T10:30:00Z',
      status: 'active',
      responseTime: 150
    },
    {
      id: '2',
      name: 'TimeTrackPro Webhook',
      url: 'https://webhook.timetrackpro.com/events',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      authentication: { type: 'bearer', value: 'tt_***************' },
      rateLimit: { requests: 500, period: 'hour' },
      lastTested: '2024-01-15T09:45:00Z',
      status: 'active',
      responseTime: 89
    }
  ]);

  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newEndpoint, setNewEndpoint] = useState<Partial<APIEndpoint>>({
    name: '',
    url: '',
    method: 'GET',
    headers: {},
    authentication: { type: 'none', value: '' },
    rateLimit: { requests: 1000, period: 'hour' }
  });

  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) {
      toast({
        title: 'Error',
        description: 'Please provide name and URL for the endpoint',
        variant: 'destructive'
      });
      return;
    }

    const endpoint: APIEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      url: newEndpoint.url,
      method: newEndpoint.method || 'GET',
      headers: newEndpoint.headers || {},
      authentication: newEndpoint.authentication || { type: 'none', value: '' },
      rateLimit: newEndpoint.rateLimit || { requests: 1000, period: 'hour' },
      lastTested: new Date().toISOString(),
      status: 'inactive',
      responseTime: 0
    };

    setEndpoints([...endpoints, endpoint]);
    setNewEndpoint({
      name: '',
      url: '',
      method: 'GET',
      headers: {},
      authentication: { type: 'none', value: '' },
      rateLimit: { requests: 1000, period: 'hour' }
    });
    setIsAddingEndpoint(false);

    toast({
      title: 'Endpoint Added',
      description: `API endpoint "${endpoint.name}" has been added successfully`
    });
  };

  const handleTestEndpoint = async (endpoint: APIEndpoint) => {
    toast({
      title: 'Testing Endpoint',
      description: `Testing connection to ${endpoint.name}...`
    });

    // Simulate API test
    setTimeout(() => {
      const updatedEndpoints = endpoints.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, status: 'active' as const, lastTested: new Date().toISOString(), responseTime: Math.floor(Math.random() * 200) + 50 }
          : ep
      );
      setEndpoints(updatedEndpoints);

      toast({
        title: 'Test Successful',
        description: `${endpoint.name} is responding correctly`
      });
    }, 2000);
  };

  const handleDeleteEndpoint = (endpointId: string) => {
    setEndpoints(endpoints.filter(ep => ep.id !== endpointId));
    toast({
      title: 'Endpoint Deleted',
      description: 'API endpoint has been removed'
    });
  };

  const toggleSecretVisibility = (endpointId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [endpointId]: !prev[endpointId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Endpoint Management</h3>
          <p className="text-muted-foreground">
            Manage and monitor your integration API endpoints
          </p>
        </div>
        <Button onClick={() => setIsAddingEndpoint(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      {/* Add New Endpoint Form */}
      {isAddingEndpoint && (
        <Card>
          <CardHeader>
            <CardTitle>Add New API Endpoint</CardTitle>
            <CardDescription>Configure a new API endpoint for integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endpoint-name">Endpoint Name</Label>
                <Input
                  id="endpoint-name"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({...newEndpoint, name: e.target.value})}
                  placeholder="Enter endpoint name"
                />
              </div>
              <div>
                <Label htmlFor="endpoint-method">HTTP Method</Label>
                <Select value={newEndpoint.method} onValueChange={(value) => setNewEndpoint({...newEndpoint, method: value as any})}>
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
              <Label htmlFor="endpoint-url">URL</Label>
              <Input
                id="endpoint-url"
                value={newEndpoint.url}
                onChange={(e) => setNewEndpoint({...newEndpoint, url: e.target.value})}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select 
                  value={newEndpoint.authentication?.type} 
                  onValueChange={(value) => setNewEndpoint({
                    ...newEndpoint, 
                    authentication: { ...newEndpoint.authentication!, type: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auth-value">Authentication Value</Label>
                <Input
                  id="auth-value"
                  type="password"
                  value={newEndpoint.authentication?.value}
                  onChange={(e) => setNewEndpoint({
                    ...newEndpoint, 
                    authentication: { ...newEndpoint.authentication!, value: e.target.value }
                  })}
                  placeholder="Enter authentication value"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEndpoint}>Add Endpoint</Button>
              <Button variant="outline" onClick={() => setIsAddingEndpoint(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <Badge className={getStatusColor(endpoint.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(endpoint.status)}
                        {endpoint.status}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <code className="bg-muted px-2 py-1 rounded">{endpoint.url}</code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestEndpoint(endpoint)}
                  >
                    Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingEndpoint(endpoint.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteEndpoint(endpoint.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Authentication</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{endpoint.authentication.type}</span>
                    {endpoint.authentication.type !== 'none' && (
                      <>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {showSecrets[endpoint.id] 
                            ? endpoint.authentication.value 
                            : endpoint.authentication.value.replace(/./g, '*')
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(endpoint.id)}
                        >
                          {showSecrets[endpoint.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Rate Limit</p>
                  <p className="text-sm text-muted-foreground">
                    {endpoint.rateLimit.requests} requests per {endpoint.rateLimit.period}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Performance</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{endpoint.responseTime}ms avg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {endpoints.length === 0 && (
        <div className="text-center py-12">
          <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No API endpoints configured</h3>
          <p className="text-muted-foreground mb-4">Add your first API endpoint to start managing integrations</p>
          <Button onClick={() => setIsAddingEndpoint(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  );
};

export default APIManagement;
