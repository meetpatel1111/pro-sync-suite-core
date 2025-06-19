
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { servicecoreService } from '@/services/servicecoreService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Ticket, CreateTicket } from '@/types/servicecore';

const IncidentManagement = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await servicecoreService.getTickets(user.id);
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: CreateTicket) => {
    if (!user) return;

    try {
      const { data, error } = await servicecoreService.createTicket({
        ...ticketData,
        submitted_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Incident created successfully',
      });

      setShowCreateDialog(false);
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create incident',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTicket = async (updates: Partial<Ticket>) => {
    if (!editingTicket) return;

    try {
      const { data, error } = await servicecoreService.updateTicket(editingTicket.id, updates);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Incident updated successfully',
      });

      setShowEditDialog(false);
      setEditingTicket(null);
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to update incident',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toString().includes(searchQuery)
  ).filter(ticket => ticket.type === 'incident');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">
            Manage and track security incidents and service disruptions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Incident
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">INC-{ticket.ticket_number}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ticket.description?.substring(0, 100)}...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                    {ticket.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTicket(ticket);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No incidents found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Incident Dialog */}
      <CreateIncidentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateTicket}
      />

      {/* Edit Incident Dialog */}
      {editingTicket && (
        <EditIncidentDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingTicket(null);
          }}
          ticket={editingTicket}
          onUpdate={handleUpdateTicket}
        />
      )}

      {/* Incident Detail Dialog */}
      {selectedTicket && (
        <IncidentDetailDialog
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

// Create Incident Dialog Component
const CreateIncidentDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (ticket: CreateTicket) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<CreateTicket>({
    title: '',
    description: '',
    type: 'incident',
    priority: 'medium',
    submitted_by: '',
    category: '',
    tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreate(formData);
      setFormData({
        title: '',
        description: '',
        type: 'incident',
        priority: 'medium',
        submitted_by: '',
        category: '',
        tags: [],
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the incident"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
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

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Incident
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Incident Dialog Component
const EditIncidentDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (updates: Partial<Ticket>) => void;
}> = ({ isOpen, onClose, ticket, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: ticket.title,
    description: ticket.description || '',
    priority: ticket.priority,
    status: ticket.status,
    category: ticket.category || '',
    resolution_notes: ticket.resolution_notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Incident INC-{ticket.ticket_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="resolution">Resolution Notes</Label>
            <Textarea
              id="resolution"
              value={formData.resolution_notes}
              onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
              placeholder="Resolution details and steps taken"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Incident
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Incident Detail Dialog Component
const IncidentDetailDialog: React.FC<{
  ticket: Ticket;
  onClose: () => void;
}> = ({ ticket, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Incident INC-{ticket.ticket_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Badge className={`${ticket.priority === 'critical' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-orange-500' : ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
              {ticket.priority}
            </Badge>
            <Badge className={`${ticket.status === 'open' ? 'bg-blue-500' : ticket.status === 'in_progress' ? 'bg-yellow-500' : ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
              {ticket.status}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Title</h3>
            <p>{ticket.title}</p>
          </div>

          {ticket.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          {ticket.resolution_notes && (
            <div>
              <h3 className="font-semibold mb-2">Resolution Notes</h3>
              <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Created:</span> {new Date(ticket.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span> {new Date(ticket.updated_at).toLocaleString()}
            </div>
            {ticket.resolved_at && (
              <div>
                <span className="font-semibold">Resolved:</span> {new Date(ticket.resolved_at).toLocaleString()}
              </div>
            )}
            {ticket.closed_at && (
              <div>
                <span className="font-semibold">Closed:</span> {new Date(ticket.closed_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentManagement;
