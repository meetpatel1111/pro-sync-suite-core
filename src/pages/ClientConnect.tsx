import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Search, Phone, Mail, Building, Edit, Trash2, MessageSquare, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dbService from '@/services/dbService';
import { format } from 'date-fns';
import { Client, ClientNote } from '@/utils/dbtypes';

const ClientConnect = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientNotes(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getClients();
      setClients(data as Client[]);
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
      const data = await dbService.getClientNotesByClientId(clientId);
      setClientNotes(data as ClientNote[]);
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
        await dbService.updateClient(selectedClient.id, newClient);
        setClients(clients.map(client =>
          client.id === selectedClient.id
            ? { ...client, ...newClient }
            : client
        ));
        toast({
          title: 'Client updated',
          description: 'Client information has been updated successfully.'
        });
      } else {
        // Add new client
        const created = await dbService.createClient(newClient);
        if (created) {
          setClients([created, ...clients]);
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
      const created = await dbService.createClientNote({
        client_id: selectedClient.id,
        content: newNote.content,
        user_id: session.user.id
      });
      if (created) {
        setClientNotes([created, ...clientNotes]);
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
      await dbService.deleteClient(clientId);
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
      await dbService.deleteClientNote(noteId);
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
      email: client.email,
      phone: client.phone,
      company: client.company
    });
    setIsEditingClient(true);
    setShowAddClientDialog(true);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!session) {
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
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ClientConnect</h1>
            <p className="text-muted-foreground">
              Seamless client and stakeholder engagement platform
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Clients</span>
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
                              handleDeleteClient(client.id);
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
              <Card className="mt-6">
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
                                onClick={() => handleDeleteNote(note.id)}
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
            )}
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
                <div className="text-center py-8 text-muted-foreground">
                  <p>Client interaction timeline feature coming soon.</p>
                  <p className="text-sm mt-2">This will display emails, meetings, and other touchpoints with clients.</p>
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
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Client Name"
                className="col-span-3"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="client@example.com"
                className="col-span-3"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                placeholder="555-123-4567"
                className="col-span-3"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="company" className="text-right text-sm font-medium">
                Company
              </label>
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
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Note Content
              </label>
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
