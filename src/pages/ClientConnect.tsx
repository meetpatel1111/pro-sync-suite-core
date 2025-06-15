import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, Plus, Search, Filter, Star, Mail, Phone, MapPin, 
  Calendar, Users, DollarSign, TrendingUp, Activity, Eye, 
  Edit, MoreVertical, UserPlus, Building, Target, Zap, Globe,
  FileText, MessageSquare, Trash2, Clock, Bell, FileCheck, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Client, ClientNote } from '@/utils/dbtypes';
import { ContactBook } from '@/components/clientconnect/ContactBook';

const ClientConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, user } = useAuth();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  const [newNote, setNewNote] = useState({
    content: ''
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientNotes(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setClients(data as Client[]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error fetching clients',
        description: 'There was a problem fetching your clients.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientNotes = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setClientNotes(data as ClientNote[]);
      }
    } catch (error) {
      console.error('Error fetching client notes:', error);
      toast({
        title: 'Error fetching notes',
        description: 'There was a problem fetching notes for this client.',
        variant: 'destructive'
      });
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a client name.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditingClient && selectedClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            company: newClient.company
          })
          .eq('id', selectedClient.id);
          
        if (error) throw error;
        
        toast({
          title: 'Client updated',
          description: 'Client has been updated successfully.'
        });
        
        // Update the local state
        setClients(clients.map(client => 
          client.id === selectedClient.id 
            ? { ...client, ...newClient } 
            : client
        ));
      } else {
        // Add new client
        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            company: newClient.company,
            user_id: user?.id
          })
          .select();
          
        if (error) throw error;
        
        if (data) {
          setClients([data[0], ...clients]);
          toast({
            title: 'Client added',
            description: 'New client has been added successfully.'
          });
        }
      }
      
      // Reset form and close dialog
      setNewClient({ name: '', email: '', phone: '', company: '' });
      setShowAddClientDialog(false);
      setIsEditingClient(false);
    } catch (error) {
      console.error('Error adding/updating client:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding/updating the client.',
        variant: 'destructive'
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNote.content) {
      toast({
        title: 'Missing information',
        description: 'Please select a client and provide note content.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: selectedClient.id,
          content: newNote.content,
          user_id: user?.id
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        setClientNotes([data[0], ...clientNotes]);
        toast({
          title: 'Note added',
          description: 'New note has been added successfully.'
        });
      }
      
      // Reset form and close dialog
      setNewNote({ content: '' });
      setShowAddNoteDialog(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding the note.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
        
      if (error) throw error;
      
      setClients(clients.filter(client => client.id !== clientId));
      
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
        setClientNotes([]);
      }
      
      toast({
        title: 'Client deleted',
        description: 'Client has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the client.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);
        
      if (error) throw error;
      
      setClientNotes(clientNotes.filter(note => note.id !== noteId));
      
      toast({
        title: 'Note deleted',
        description: 'Note has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the note.',
        variant: 'destructive'
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setNewClient({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || ''
    });
    setIsEditingClient(true);
    setShowAddClientDialog(true);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ClientConnect</h1>
            <p className="text-muted-foreground">
              Seamless client and stakeholder engagement platform
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>Please log in to view and manage your clients.</p>
                <Button 
                  variant="default" 
                  className="mt-4"
                  onClick={() => window.location.href = '/auth'}
                >
                  Log In / Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Modern Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">ClientConnect</h1>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Advanced client relationship management and business development
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Users className="h-4 w-4 mr-2" />
              Client Management
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Globe className="h-4 w-4 mr-2" />
              Relationship Tracking
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Target className="h-4 w-4 mr-2" />
              Business Growth
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 backdrop-blur-3xl"></div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 gap-1" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ClientConnect</h1>
            <p className="text-muted-foreground">
              Seamless client and stakeholder engagement platform
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex gap-2">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Interactions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="w-full md:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                setNewClient({ name: '', email: '', phone: '', company: '' });
                setIsEditingClient(false);
                setShowAddClientDialog(true);
              }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Loading clients...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredClients.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No clients found. Add your first client to get started.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredClients.map(client => (
                  <Card 
                    key={client.id} 
                    className={`cursor-pointer transition-all ${selectedClient?.id === client.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClient(client);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this client?')) {
                                handleDeleteClient(client.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{client.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            {selectedClient && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Notes */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Client Notes</CardTitle>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddNoteDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Note
                      </Button>
                    </div>
                    <CardDescription>Notes for {selectedClient.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clientNotes.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No notes yet. Add your first note for this client.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clientNotes.map(note => (
                          <Card key={note.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this note?')) {
                                      handleDeleteNote(note.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Client Contact Book */}
                <ContactBook clientId={selectedClient.id} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Recent Projects</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Website Redesign</div>
                      <div className="text-xs text-muted-foreground">75% complete</div>
                    </div>
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="font-medium">App Development</div>
                      <div className="text-xs text-muted-foreground">30% complete</div>
                    </div>
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">View All Projects</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Pending Approvals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Logo Design Draft</div>
                      <Button variant="outline" size="sm" className="h-7">Review</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Content Strategy</div>
                      <Button variant="outline" size="sm" className="h-7">Review</Button>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Recent Invoices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">INV-2023-001</div>
                      <div className="font-medium">$1,500.00</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">INV-2023-002</div>
                      <div className="font-medium">$850.00</div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted rounded-md h-12 w-12 flex flex-col items-center justify-center text-center">
                        <div className="text-xs">JUN</div>
                        <div className="font-bold">15</div>
                      </div>
                      <div>
                        <div className="font-medium">Project Status Review</div>
                        <div className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-muted rounded-md h-12 w-12 flex flex-col items-center justify-center text-center">
                        <div className="text-xs">JUN</div>
                        <div className="font-bold">18</div>
                      </div>
                      <div>
                        <div className="font-medium">Feedback Session</div>
                        <div className="text-sm text-muted-foreground">2:00 PM - 3:30 PM</div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">Schedule Meeting</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Recent Updates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium">New feature deployed</div>
                      <div className="text-xs text-muted-foreground">3 hours ago</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Content updates completed</div>
                      <div className="text-xs text-muted-foreground">Yesterday</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Report ready for review</div>
                      <div className="text-xs text-muted-foreground">2 days ago</div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">View All Updates</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>
                  View and track all client communication in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Interaction Timeline */}
                  <div className="relative border-l border-muted pl-6">
                    {/* Email interaction */}
                    <div className="mb-6 relative">
                      <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="flex flex-col">
                        <h4 className="font-medium">Email Sent: Project Update</h4>
                        <p className="text-sm text-muted-foreground">
                          To: client@example.com
                        </p>
                        <time className="text-xs text-muted-foreground mt-1">
                          {format(new Date(), 'MMM d, yyyy h:mm a')}
                        </time>
                        <p className="text-sm mt-2">
                          Weekly project status update with timeline revisions and next steps.
                        </p>
                      </div>
                    </div>

                    {/* Meeting interaction */}
                    <div className="mb-6 relative">
                      <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="flex flex-col">
                        <h4 className="font-medium">Meeting: Kickoff Session</h4>
                        <time className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Date.now() - 86400000), 'MMM d, yyyy h:mm a')}
                        </time>
                        <p className="text-sm mt-2">
                          Initial project kickoff meeting with team introductions and scope review.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 w-fit">
                          View Meeting Notes
                        </Button>
                      </div>
                    </div>

                    {/* File sharing interaction */}
                    <div className="relative">
                      <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="flex flex-col">
                        <h4 className="font-medium">Files Shared: Design Assets</h4>
                        <time className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Date.now() - 172800000), 'MMM d, yyyy h:mm a')}
                        </time>
                        <p className="text-sm mt-2">
                          Shared 5 files including logo variations, color palette, and brand guidelines.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 w-fit">
                          View Files
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline">
                      Load More History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {isEditingClient 
                ? 'Update client information' 
                : 'Fill in the details to add a new client'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Client Name"
                className="col-span-3"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                placeholder="client@example.com"
                className="col-span-3"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="555-123-4567"
                className="col-span-3"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right text-sm font-medium">
                Company
              </Label>
              <Input
                id="company"
                placeholder="Company Name"
                className="col-span-3"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>
              {isEditingClient ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Note</DialogTitle>
            <DialogDescription>
              Add a note for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="content" className="block text-sm font-medium mb-2">
                Note Content
              </Label>
              <Textarea
                id="content"
                placeholder="Enter your note here..."
                className="min-h-[120px]"
                value={newNote.content}
                onChange={(e) => setNewNote({ content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ClientConnect;
