import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Activity,
  FileText,
  Settings,
  MessageSquare,
  Calendar,
  Zap,
  Shield,
  BarChart3,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Brain,
  Lightbulb,
  Target,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AITicketAnalyzer from './AITicketAnalyzer';

interface ServiceTicket {
  id: string;
  ticket_number: number;
  title: string;
  description?: string;
  type: 'incident' | 'request' | 'problem' | 'change';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  submitted_by: string;
  assigned_to?: string;
  category?: string;
  subcategory?: string;
  created_at: string;
  updated_at: string;
}

const EnhancedServiceCore = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<ServiceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    type: 'incident' as const,
    priority: 'medium' as const,
    category: ''
  });
  const { toast } = useToast();

  const [selectedTicketForAI, setSelectedTicketForAI] = useState<ServiceTicket | null>(null);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const loadTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setTickets((data || []).map(ticket => ({
        ...ticket,
        type: ticket.type as 'incident' | 'request' | 'problem' | 'change',
        priority: ticket.priority as 'low' | 'medium' | 'high' | 'critical',
        status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed'
      })));
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_number.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.type === typeFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleCreateTicket = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...newTicket,
          submitted_by: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [{
        ...data,
        type: data.type as 'incident' | 'request' | 'problem' | 'change',
        priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
        status: data.status as 'open' | 'in_progress' | 'resolved' | 'closed'
      }, ...prev]);
      setNewTicket({
        title: '',
        description: '',
        type: 'incident',
        priority: 'medium',
        category: ''
      });
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Ticket created successfully'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Clock;
      case 'in_progress': return Activity;
      case 'resolved': return CheckCircle;
      case 'closed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    critical: tickets.filter(t => t.priority === 'critical').length
  };

  const handleAIAnalysis = (analysis: any) => {
    toast({
      title: 'AI Analysis Complete',
      description: 'Ticket has been analyzed and suggestions are available.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ServiceCore
          </h1>
          <p className="text-muted-foreground">AI-powered IT Service Management & Help Desk</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </Button>
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            SLA Monitor
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>Submit a new service request or incident report</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the issue or request"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newTicket.type} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="request">Service Request</SelectItem>
                          <SelectItem value="problem">Problem</SelectItem>
                          <SelectItem value="change">Change Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Hardware, Software, Network"
                    />
                  </div>
                  <Button onClick={handleCreateTicket} disabled={!newTicket.title.trim()}>
                    Create Ticket
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <AITicketAnalyzer
                    ticketTitle={newTicket.title}
                    ticketDescription={newTicket.description}
                    onAnalysisComplete={handleAIAnalysis}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ticketStats.open}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ticketStats.resolved}</div>
            <p className="text-xs text-muted-foreground">+8% resolution rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Timer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">2.4h</div>
            <p className="text-xs text-muted-foreground">-15% vs last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">Within SLA targets</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tickets">Active Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sla">SLA Monitor</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="change">Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Service Tickets</CardTitle>
              <CardDescription>
                Manage and track all service requests and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first service ticket to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    return (
                      <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold">#{ticket.ticket_number} - {ticket.title}</h3>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">
                                {ticket.type}
                              </Badge>
                            </div>
                            {ticket.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                              {ticket.category && <span>Category: {ticket.category}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resolution Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold text-green-600">2.1h avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Week</span>
                    <span className="font-bold">2.8h avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold">2.4h avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>John Smith</span>
                    <Badge className="bg-green-100 text-green-800">98% SLA</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sarah Connor</span>
                    <Badge className="bg-green-100 text-green-800">96% SLA</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mike Johnson</span>
                    <Badge className="bg-yellow-100 text-yellow-800">89% SLA</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Auto-Routing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically route tickets to the best available agent based on skills and workload.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Smart Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-generated response suggestions based on ticket content and history.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-blue-100 text-blue-800">Learning</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Auto-Escalation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically escalate tickets that are approaching SLA breach.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Escalated Today</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedServiceCore;
