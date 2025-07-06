
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
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  FileText, 
  DollarSign,
  TrendingUp,
  Activity,
  Star,
  MapPin,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  user_id: string;
  created_at: string;
}

interface ClientNote {
  id: string;
  client_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const EnhancedClientConnect = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientNotes(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clients',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientNotes = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientNotes(data || []);
    } catch (error) {
      console.error('Error loading client notes:', error);
    }
  };

  const handleAddClient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [data, ...prev]);
      setNewClient({ name: '', email: '', phone: '', company: '' });
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Client added successfully'
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: 'Error',
        description: 'Failed to add client',
        variant: 'destructive'
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: selectedClient.id,
          content: newNote,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setClientNotes(prev => [data, ...prev]);
      setNewNote('');
      
      toast({
        title: 'Success',
        description: 'Note added successfully'
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive'
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ClientConnect</h1>
          <p className="text-muted-foreground">Manage your client relationships and interactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newClient.company}
                  onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <Button onClick={handleAddClient} disabled={!newClient.name.trim()}>
                Add Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Active client relationships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => {
                const clientDate = new Date(c.created_at);
                const now = new Date();
                return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New clients this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientNotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Total client notes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Average engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Add your first client to get started'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedClient?.id === client.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 mr-2" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2" />
                              {client.phone}
                            </div>
                          )}
                          {client.company && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4 mr-2" />
                              {client.company}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-4">
          {selectedClient ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Client Details
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Client since {new Date(selectedClient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {selectedClient.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedClient.email}
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedClient.phone}
                      </div>
                    )}
                    {selectedClient.company && (
                      <div className="flex items-center text-sm">
                        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedClient.company}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
                    Add Note
                  </Button>
                  
                  <div className="space-y-3">
                    {clientNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(note.created_at).toLocaleDateString()} at{' '}
                          {new Date(note.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Client</h3>
                <p className="text-muted-foreground">
                  Choose a client from the list to view their details and notes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedClientConnect;
