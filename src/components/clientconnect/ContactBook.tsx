
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, User, Phone, Mail, Building, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  client_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  emergency_contact?: boolean;
  notes?: string;
  created_at: string;
}

export const ContactBook: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    emergency_contact: false,
    notes: ''
  });

  useEffect(() => {
    if (clientId) {
      fetchContacts();
    }
  }, [clientId]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        setContacts(data as Contact[]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateContact = async () => {
    if (!newContact.name) {
      toast({
        title: 'Missing information',
        description: 'Contact name is required.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditMode && selectedContact) {
        // Update existing contact
        const { error } = await supabase
          .from('client_contacts')
          .update({
            name: newContact.name,
            role: newContact.role,
            email: newContact.email,
            phone: newContact.phone,
            emergency_contact: newContact.emergency_contact,
            notes: newContact.notes
          })
          .eq('id', selectedContact.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Contact updated successfully.',
        });
        
        // Update local state
        setContacts(contacts.map(contact => 
          contact.id === selectedContact.id ? { ...contact, ...newContact } : contact
        ));
      } else {
        // Add new contact
        const { data, error } = await supabase
          .from('client_contacts')
          .insert({
            client_id: clientId,
            name: newContact.name,
            role: newContact.role,
            email: newContact.email,
            phone: newContact.phone,
            emergency_contact: newContact.emergency_contact,
            notes: newContact.notes
          })
          .select();
          
        if (error) throw error;
        
        if (data) {
          setContacts([...contacts, data[0] as Contact]);
          toast({
            title: 'Success',
            description: 'Contact added successfully.',
          });
        }
      }
      
      // Reset form and close dialog
      resetForm();
      setShowAddContactDialog(false);
    } catch (error) {
      console.error('Error adding/updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('client_contacts')
        .delete()
        .eq('id', contactId);
        
      if (error) throw error;
      
      setContacts(contacts.filter(contact => contact.id !== contactId));
      toast({
        title: 'Success',
        description: 'Contact deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact.',
        variant: 'destructive'
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setNewContact({
      name: contact.name,
      role: contact.role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      emergency_contact: contact.emergency_contact || false,
      notes: contact.notes || ''
    });
    setIsEditMode(true);
    setShowAddContactDialog(true);
  };

  const resetForm = () => {
    setNewContact({
      name: '',
      role: '',
      email: '',
      phone: '',
      emergency_contact: false,
      notes: ''
    });
    setSelectedContact(null);
    setIsEditMode(false);
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.role && contact.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Contact Book</CardTitle>
          <Button onClick={() => {
            resetForm();
            setShowAddContactDialog(true);
          }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
        <CardDescription>
          Manage client contacts and emergency information
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-32 text-muted-foreground">
              <User className="h-10 w-10 mb-2 opacity-20" />
              <p>{searchQuery ? 'No contacts match your search' : 'No contacts added yet'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{contact.name}</div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this contact?')) {
                              handleDeleteContact(contact.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {contact.role && <p className="text-sm text-muted-foreground">{contact.role}</p>}
                    <div className="flex flex-col space-y-1 pt-1">
                      {contact.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                        </div>
                      )}
                    </div>
                    {contact.emergency_contact && (
                      <Badge variant="destructive" className="mt-1">Emergency Contact</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update contact information' 
                : 'Add a new contact for this client'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Contact Name"
                className="col-span-3"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                placeholder="Project Manager, CEO, etc."
                className="col-span-3"
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="col-span-3"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="555-123-4567"
                className="col-span-3"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="emergency">
                  Emergency
                </Label>
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={newContact.emergency_contact}
                  onChange={(e) => setNewContact({ ...newContact, emergency_contact: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="emergency" className="text-sm">Mark as emergency contact</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <textarea
                id="notes"
                placeholder="Additional information..."
                className="col-span-3 min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateContact}>
              {isEditMode ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
