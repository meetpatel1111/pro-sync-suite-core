import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';
import { Client, ClientNote } from '@/utils/dbtypes';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, PlusCircle } from 'lucide-react';

const ClientConnect = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [clientData, setClientData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;
    const response = await dbService.getClients(user.id);
    setClients(response.data || []);
  };

  const handleClientSelect = async (client: Client) => {
    setSelectedClient(client);
    const response = await dbService.getClientNotesByClientId(client.id);
    setClientNotes((response.data || []) as ClientNote[]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleCreateClient = async () => {
    if (!user) return;
    const response = await dbService.createClient({ ...clientData, user_id: user.id });
    if (response.data) {
      fetchClients();
      setClientData({ name: '', email: '', phone: '', company: '' });
      toast({
        title: "Client created",
        description: "The client has been created successfully",
      });
    } else if (response.error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    const response = await dbService.updateClient(selectedClient.id, clientData);
    setSelectedClient((response.data) as Client);
    fetchClients();
    setIsEditing(false);
    toast({
      title: "Client updated",
      description: "The client has been updated successfully",
    });
  };

  const handleCreateNote = async () => {
    if (!selectedClient || !user) return;
    const response = await dbService.createClientNote({
      client_id: selectedClient.id,
      user_id: user.id,
      content: newNote,
    });

    if (response.data) {
      setClientNotes([...clientNotes, response.data as unknown as ClientNote]);
      setNewNote('');
      toast({
        title: "Note created",
        description: "The note has been created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    const response = await dbService.deleteClient(selectedClient.id);
    if (!response.error) {
      setSelectedClient(null);
      fetchClients();
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const response = await dbService.deleteClientNote(noteId);
    if (!response.error) {
      setClientNotes(clientNotes.filter((note) => note.id !== noteId));
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Client Connect</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                View and manage your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className={`cursor-pointer p-2 rounded-md hover:bg-secondary ${
                      selectedClient?.id === client.id ? 'bg-secondary' : ''
                    }`}
                    onClick={() => handleClientSelect(client)}
                  >
                    {client.name}
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold tracking-tight">Create Client</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input type="text" id="name" name="name" value={clientData.name || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input type="email" id="email" name="email" value={clientData.email || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input type="tel" id="phone" name="phone" value={clientData.phone || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">
                    Company
                  </Label>
                  <Input type="text" id="company" name="company" value={clientData.company || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <Button onClick={handleCreateClient}>Create Client</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
              <CardDescription>
                View and manage client details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedClient ? (
                <>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={clientData.name || selectedClient?.name || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={clientData.email || selectedClient?.email || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={clientData.phone || selectedClient?.phone || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="company" className="text-right">
                        Company
                      </Label>
                      <Input
                        type="text"
                        id="company"
                        name="company"
                        value={clientData.company || selectedClient?.company || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {isEditing ? (
                      <>
                        <Button onClick={handleUpdateClient}>Update Client</Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => {
                          setIsEditing(true);
                          setClientData({
                            name: selectedClient.name,
                            email: selectedClient.email,
                            phone: selectedClient.phone,
                            company: selectedClient.company,
                          });
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClient}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Client
                        </Button>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl font-bold tracking-tight">Notes</h3>
                  <ul className="space-y-2">
                    {clientNotes.map((note) => (
                      <li key={note.id} className="border rounded-md p-2">
                        <p>{note.content}</p>
                        <div className="text-sm text-muted-foreground">
                          Created at: {new Date(note.created_at).toLocaleDateString()}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                          Delete Note
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Add a note"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button size="sm" onClick={handleCreateNote}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </>
              ) : (
                <div>Select a client to view details</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientConnect;
