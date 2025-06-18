
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket as TicketIcon, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Bug,
  HelpCircle,
  Wrench,
  TrendingUp
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { servicecoreService } from '@/services/servicecoreService';
import { useToast } from '@/hooks/use-toast';
import type { Ticket, ChangeRequest, ProblemTicket } from '@/types/servicecore';

const ServiceCore: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [problemTickets, setProblemTickets] = useState<ProblemTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [createChangeOpen, setCreateChangeOpen] = useState(false);
  const [createProblemOpen, setCreateProblemOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    type: 'incident' as const,
    priority: 'medium' as const,
    category: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [ticketsResult, changesResult, problemsResult] = await Promise.all([
        servicecoreService.getTickets(user.id),
        servicecoreService.getChangeRequests(user.id),
        servicecoreService.getProblemTickets(user.id)
      ]);

      if (ticketsResult.error) {
        console.error('Error fetching tickets:', ticketsResult.error);
      } else {
        setTickets((ticketsResult.data || []) as Ticket[]);
      }

      if (changesResult.error) {
        console.error('Error fetching change requests:', changesResult.error);
      } else {
        setChangeRequests((changesResult.data || []) as ChangeRequest[]);
      }

      if (problemsResult.error) {
        console.error('Error fetching problem tickets:', problemsResult.error);
      } else {
        setProblemTickets((problemsResult.data || []) as ProblemTicket[]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await servicecoreService.createTicket({
        ...ticketForm,
        submitted_by: user.id,
        tags: [],
        custom_fields: {}
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create ticket',
          variant: 'destructive',
        });
        return;
      }

      setTickets(prev => [data, ...prev]);
      setCreateTicketOpen(false);
      setTicketForm({
        title: '',
        description: '',
        type: 'incident',
        priority: 'medium',
        category: ''
      });
      
      toast({
        title: 'Success',
        description: 'Ticket created successfully',
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'request': return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case 'problem': return <Bug className="h-4 w-4 text-orange-500" />;
      case 'change': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <TicketIcon className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">ServiceCore</h1>
          <p className="text-muted-foreground">IT Service Management & Support Desk</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.openTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="changes">Change Requests</TabsTrigger>
          <TabsTrigger value="problems">Problem Management</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Support Tickets</h2>
            <Dialog open={createTicketOpen} onOpenChange={setCreateTicketOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={ticketForm.type} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="request">Request</SelectItem>
                          <SelectItem value="problem">Problem</SelectItem>
                          <SelectItem value="change">Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, priority: value }))}>
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

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateTicketOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Ticket</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(ticket.type)}
                        {getStatusIcon(ticket.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          <Badge variant="outline">#{ticket.ticket_number}</Badge>
                        </div>
                        
                        {ticket.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {ticket.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                          {ticket.category && <span>• {ticket.category}</span>}
                          <span>• {ticket.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-12">
              <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">Create your first support ticket to get started</p>
              <Button onClick={() => setCreateTicketOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Ticket
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="changes">
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Change Management</h3>
            <p className="text-muted-foreground">Change request functionality coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="problems">
          <div className="text-center py-12">
            <Bug className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Problem Management</h3>
            <p className="text-muted-foreground">Problem ticket functionality coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Asset Management</h3>
            <p className="text-muted-foreground">Asset tracking functionality coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceCore;
