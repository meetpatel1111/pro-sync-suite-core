
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  Zap,
  Shield,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  businessHoursOnly: boolean;
  escalationEnabled: boolean;
  escalationAfter: number; // minutes
  escalationTeam: string;
  conditions: {
    category?: string[];
    type?: string[];
    customer?: string[];
    customFields?: Record<string, any>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SLAMetrics {
  totalTickets: number;
  onTimeResponse: number;
  onTimeResolution: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  breachedTickets: number;
  escalatedTickets: number;
  complianceRate: number;
  trendData: Array<{
    date: string;
    compliance: number;
    responseTime: number;
    resolutionTime: number;
  }>;
}

const AdvancedSLAManagement: React.FC = () => {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [metrics, setMetrics] = useState<SLAMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<SLAPolicy>>({});

  useEffect(() => {
    loadPolicies();
    loadMetrics();
  }, []);

  const loadPolicies = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPolicies: SLAPolicy[] = [
        {
          id: '1',
          name: 'Critical Infrastructure Issues',
          description: 'High priority incidents affecting core infrastructure',
          priority: 'critical',
          responseTime: 15, // 15 minutes
          resolutionTime: 240, // 4 hours
          businessHoursOnly: false,
          escalationEnabled: true,
          escalationAfter: 30,
          escalationTeam: 'senior-ops',
          conditions: {
            category: ['infrastructure', 'security'],
            type: ['incident'],
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Standard Service Requests',
          description: 'Regular service requests during business hours',
          priority: 'medium',
          responseTime: 120, // 2 hours
          resolutionTime: 1440, // 24 hours
          businessHoursOnly: true,
          escalationEnabled: true,
          escalationAfter: 480, // 8 hours
          escalationTeam: 'service-desk',
          conditions: {
            type: ['request'],
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Error loading SLA policies:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      // Mock metrics data
      const mockMetrics: SLAMetrics = {
        totalTickets: 1247,
        onTimeResponse: 1156,
        onTimeResolution: 1089,
        averageResponseTime: 45, // minutes
        averageResolutionTime: 380, // minutes
        breachedTickets: 91,
        escalatedTickets: 23,
        complianceRate: 87.3,
        trendData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          compliance: Math.floor(Math.random() * 20) + 80,
          responseTime: Math.floor(Math.random() * 30) + 30,
          resolutionTime: Math.floor(Math.random() * 100) + 300
        }))
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading SLA metrics:', error);
    }
  };

  const handleSavePolicy = async () => {
    try {
      if (editingPolicy) {
        // Update existing policy
        setPolicies(prev => 
          prev.map(p => p.id === editingPolicy.id ? { ...editingPolicy, ...formData } : p)
        );
        toast({
          title: 'Success',
          description: 'SLA policy updated successfully',
        });
      } else {
        // Create new policy
        const newPolicy: SLAPolicy = {
          id: Date.now().toString(),
          ...formData as SLAPolicy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPolicies(prev => [newPolicy, ...prev]);
        toast({
          title: 'Success',
          description: 'SLA policy created successfully',
        });
      }
      
      setShowCreateForm(false);
      setEditingPolicy(null);
      setFormData({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save SLA policy',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this SLA policy?')) return;
    
    try {
      setPolicies(prev => prev.filter(p => p.id !== policyId));
      toast({
        title: 'Success',
        description: 'SLA policy deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete SLA policy',
        variant: 'destructive',
      });
    }
  };

  const togglePolicyStatus = async (policyId: string) => {
    try {
      setPolicies(prev =>
        prev.map(p => p.id === policyId ? { ...p, isActive: !p.isActive } : p)
      );
      toast({
        title: 'Success',
        description: 'SLA policy status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update policy status',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 animate-pulse';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg animate-pulse-glow">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">SLA Management</CardTitle>
                <p className="text-blue-700">Service Level Agreement policies and compliance monitoring</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="hover-scale shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New SLA Policy
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* SLA Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-lg hover-lift animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.complianceRate}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={metrics.complianceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{formatTime(metrics.averageResponseTime)}</p>
                </div>
                <Timer className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-5min from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Breached Tickets</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.breachedTickets}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">+3 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated Tickets</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.escalatedTickets}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                  Active escalations
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SLA Policies
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {policies.map((policy, index) => (
              <Card 
                key={policy.id} 
                className={`shadow-lg transition-all duration-300 hover-lift animate-fade-in ${
                  policy.isActive ? 'border-green-200' : 'border-gray-200 opacity-75'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(policy.priority)}`} />
                      <Badge 
                        className={`${policy.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'} border text-xs`}
                      >
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPolicy(policy);
                          setFormData(policy);
                          setShowCreateForm(true);
                        }}
                        className="hover-scale"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePolicyStatus(policy.id)}
                        className="hover-scale"
                      >
                        {policy.isActive ? <Shield className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="hover-scale text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{policy.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{policy.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Response:</span>
                      <p className="font-semibold text-blue-600">{formatTime(policy.responseTime)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Resolution:</span>
                      <p className="font-semibold text-green-600">{formatTime(policy.resolutionTime)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge className={`${
                        policy.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        policy.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        policy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      } border text-xs capitalize`}>
                        {policy.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Business Hours:</span>
                      <span className={policy.businessHoursOnly ? 'text-orange-600' : 'text-green-600'}>
                        {policy.businessHoursOnly ? 'Yes' : '24/7'}
                      </span>
                    </div>
                    
                    {policy.escalationEnabled && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Escalation:</span>
                        <span className="text-blue-600">{formatTime(policy.escalationAfter)}</span>
                      </div>
                    )}
                  </div>

                  {policy.conditions && Object.keys(policy.conditions).length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-2">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(policy.conditions).map(([key, values]) => (
                          Array.isArray(values) ? values.map((value: string) => (
                            <Badge key={`${key}-${value}`} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          )) : (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(values)}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Real-time SLA Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Active Violations */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Active SLA Violations
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        ticketId: 'INC-12345',
                        title: 'Database connection timeout',
                        policy: 'Critical Infrastructure Issues',
                        timeRemaining: -15, // negative means overdue
                        type: 'resolution'
                      },
                      {
                        ticketId: 'REQ-12346',
                        title: 'New user account setup',
                        policy: 'Standard Service Requests',
                        timeRemaining: 45,
                        type: 'response'
                      }
                    ].map((ticket, index) => (
                      <Card key={ticket.ticketId} className="p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {ticket.ticketId}
                              </Badge>
                              <Badge className={`${
                                ticket.timeRemaining < 0 ? 'bg-red-100 text-red-800 border-red-200 animate-pulse' :
                                ticket.timeRemaining < 60 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                              } border text-xs`}>
                                {ticket.type} SLA
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1">{ticket.title}</h4>
                            <p className="text-sm text-gray-600">{ticket.policy}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              ticket.timeRemaining < 0 ? 'text-red-600' :
                              ticket.timeRemaining < 60 ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {ticket.timeRemaining < 0 ? 
                                `${Math.abs(ticket.timeRemaining)}m overdue` :
                                `${ticket.timeRemaining}m remaining`
                              }
                            </p>
                            <Progress 
                              value={ticket.timeRemaining < 0 ? 100 : Math.max(0, 100 - (ticket.timeRemaining / 120) * 100)}
                              className="h-2 mt-2 w-24"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Upcoming Escalations */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Upcoming Escalations
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        ticketId: 'INC-12347',
                        title: 'Network connectivity issues',
                        escalationIn: 25,
                        escalationTeam: 'Network Operations'
                      },
                      {
                        ticketId: 'REQ-12348',
                        title: 'Software license request',
                        escalationIn: 75,
                        escalationTeam: 'IT Management'
                      }
                    ].map((ticket, index) => (
                      <Card key={ticket.ticketId} className="p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {ticket.ticketId}
                              </Badge>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 border text-xs">
                                Escalation Pending
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1">{ticket.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {ticket.escalationTeam}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              {ticket.escalationIn}m
                            </p>
                            <p className="text-xs text-gray-500">until escalation</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                SLA Performance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Advanced Reporting</h3>
                <p>Detailed SLA performance reports and analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Policy Form Modal would be rendered here */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <CardHeader>
              <CardTitle>
                {editingPolicy ? 'Edit SLA Policy' : 'Create New SLA Policy'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Policy Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={formData.priority || ''}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Policy Description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Response Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.responseTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, responseTime: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Resolution Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.resolutionTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.businessHoursOnly || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, businessHoursOnly: checked }))}
                  />
                  <label className="text-sm">Business Hours Only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.escalationEnabled || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, escalationEnabled: checked }))}
                  />
                  <label className="text-sm">Enable Escalation</label>
                </div>
              </div>

              {formData.escalationEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Escalation After (minutes)
                    </label>
                    <Input
                      type="number"
                      value={formData.escalationAfter || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, escalationAfter: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Escalation Team
                    </label>
                    <Input
                      placeholder="e.g., senior-ops"
                      value={formData.escalationTeam || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, escalationTeam: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPolicy(null);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePolicy}>
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedSLAManagement;
