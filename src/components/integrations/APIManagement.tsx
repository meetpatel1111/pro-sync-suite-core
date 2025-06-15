
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit,
  Trash2,
  Play,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Book,
  Shield,
  Globe,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService } from '@/services/integrationDatabaseService';
import { useAuth } from '@/hooks/useAuth';

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  auth_config: Record<string, any>;
  rate_limit?: number;
  timeout_seconds: number;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: string;
  created_at: string;
  updated_at: string;
}

const APIManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    method: 'GET',
    headers: '{\n  "Content-Type": "application/json"\n}',
    auth_config: '{}',
    rate_limit: 100,
    timeout_seconds: 30
  });

  const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

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
      console.error('Error loading endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API endpoints',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createEndpoint = async () => {
    if (!user) return;

    try {
      let headers, authConfig;
      
      try {
        headers = JSON.parse(newEndpoint.headers);
        authConfig = JSON.parse(newEndpoint.auth_config);
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your headers and auth configuration JSON',
          variant: 'destructive'
        });
        return;
      }

      const endpoint = {
        user_id: user.id,
        name: newEndpoint.name,
        url: newEndpoint.url,
        method: newEndpoint.method,
        headers,
        auth_config: authConfig,
        rate_limit: newEndpoint.rate_limit,
        timeout_seconds: newEndpoint.timeout_seconds,
        is_active: true
      };

      const created = await integrationDatabaseService.createApiEndpoint(endpoint);
      setEndpoints(prev => [created, ...prev]);
      setShowCreateDialog(false);
      setNewEndpoint({
        name: '',
        url: '',
        method: 'GET',
        headers: '{\n  "Content-Type": "application/json"\n}',
        auth_config: '{}',
        rate_limit: 100,
        timeout_seconds: 30
      });

      toast({
        title: 'Endpoint Created',
        description: 'API endpoint has been created successfully'
      });
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API endpoint',
        variant: 'destructive'
      });
    }
  };

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    try {
      setTestingEndpoint(endpoint.id);
      const result = await integrationDatabaseService.testApiEndpoint(endpoint.id);
      
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, test_status: result.success ? 'success' : 'failed', last_tested_at: result.tested_at }
          : ep
      ));

      toast({
        title: result.success ? 'Test Successful' : 'Test Failed',
        description: result.success 
          ? `API responded with status ${result.status}` 
          : 'API test failed - check endpoint configuration',
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test API endpoint',
        variant: 'destructive'
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'PATCH': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
            Manage and test your external API integrations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add API Endpoint
        </Button>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {endpoints.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No API Endpoints</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first API endpoint
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <CardTitle className="text-base">{endpoint.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {endpoint.url}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(endpoint.test_status)}
                        <Badge variant={endpoint.is_active ? 'default' : 'secondary'}>
                          {endpoint.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Last tested: {formatTimeAgo(endpoint.last_tested_at)}</span>
                        <span>Timeout: {endpoint.timeout_seconds}s</span>
                        {endpoint.rate_limit && (
                          <span>Rate limit: {endpoint.rate_limit}/min</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testEndpoint(endpoint)}
                        disabled={testingEndpoint === endpoint.id}
                      >
                        <Play className="mr-2 h-3 w-3" />
                        {testingEndpoint === endpoint.id ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.url)}
                      >
                        <Copy className="mr-2 h-3 w-3" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEndpoint(endpoint)}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Delete endpoint logic
                          toast({
                            title: 'Feature Coming Soon',
                            description: 'Endpoint deletion will be available in the next update'
                          });
                        }}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Methods
              </CardTitle>
              <CardDescription>
                Configure authentication for your API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">API Key Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Simple API key in headers or query parameters
                  </p>
                  <Badge variant="outline">Supported</Badge>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Bearer Token</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    JWT or other bearer tokens in Authorization header
                  </p>
                  <Badge variant="outline">Supported</Badge>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">OAuth 2.0</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Standard OAuth 2.0 flow with refresh tokens
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Basic Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Username and password authentication
                  </p>
                  <Badge variant="outline">Supported</Badge>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Integration Guide
              </CardTitle>
              <CardDescription>
                Learn how to integrate external APIs with ProSync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h4>Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Add your API endpoint using the "Add API Endpoint" button</li>
                  <li>Configure authentication in the endpoint settings</li>
                  <li>Test the endpoint to ensure connectivity</li>
                  <li>Use the endpoint in your automation workflows</li>
                </ol>

                <h4 className="mt-6">Supported Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Custom headers and authentication</li>
                  <li>Rate limiting and timeout configuration</li>
                  <li>Endpoint health monitoring</li>
                  <li>Automatic retry on failures</li>
                  <li>Request/response logging</li>
                </ul>

                <h4 className="mt-6">Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Always test endpoints before using in production</li>
                  <li>Set appropriate timeout values for your use case</li>
                  <li>Use environment variables for sensitive data</li>
                  <li>Monitor endpoint health regularly</li>
                  <li>Implement proper error handling</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="mr-2">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Documentation
                </Button>
                <Button variant="outline">
                  <Code className="mr-2 h-4 w-4" />
                  API Reference
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Endpoint Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add API Endpoint</DialogTitle>
            <DialogDescription>
              Configure a new external API endpoint for integration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newEndpoint.name}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                className="col-span-3"
                placeholder="My API Endpoint"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input
                id="url"
                value={newEndpoint.url}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                className="col-span-3"
                placeholder="https://api.example.com/v1/data"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">Method</Label>
              <Select
                value={newEndpoint.method}
                onValueChange={(value) => setNewEndpoint({ ...newEndpoint, method: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {httpMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="headers" className="text-right pt-2">Headers</Label>
              <Textarea
                id="headers"
                value={newEndpoint.headers}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, headers: e.target.value })}
                className="col-span-3 font-mono text-sm"
                rows={4}
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="auth" className="text-right pt-2">Auth Config</Label>
              <Textarea
                id="auth"
                value={newEndpoint.auth_config}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, auth_config: e.target.value })}
                className="col-span-3 font-mono text-sm"
                rows={3}
                placeholder='{"type": "bearer", "token": "your-token"}'
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeout" className="text-right">Timeout (s)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={newEndpoint.timeout_seconds}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, timeout_seconds: parseInt(e.target.value) || 30 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rate-limit" className="text-right">Rate Limit</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={newEndpoint.rate_limit}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, rate_limit: parseInt(e.target.value) || 100 })}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createEndpoint}>
              Create Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIManagement;
