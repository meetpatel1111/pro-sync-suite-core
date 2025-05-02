import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageSquare, Mail, Phone, Clock, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const ResourceHub = () => {
  const { toast } = useToast();
  const { session, user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [utilization, setUtilization] = useState<any[]>([]);
  const [unavailability, setUnavailability] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false);
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newResource, setNewResource] = useState({
    name: '',
    email: '',
    role: '',
    team: ''
  });
  
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (session && user) {
      fetchResources();
      fetchAllocations();
      fetchUtilization();
      fetchUnavailability();
      fetchSkills();
    }
  }, [session, user]);

  useEffect(() => {
    if (selectedResource) {
      // You might want to fetch specific resource details here
    }
  }, [selectedResource]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getUsers();
      setResources(data as any[]);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: 'Error fetching resources',
        description: 'There was a problem fetching resources.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const data = await dbService.getResourceAllocations();
      setAllocations(data as any[]);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast({
        title: 'Error fetching allocations',
        description: 'There was a problem fetching resource allocations.',
        variant: 'destructive'
      });
    }
  };

  const fetchUtilization = async () => {
    try {
      const data = await dbService.getUtilizationHistory();
      setUtilization(data as any[]);
    } catch (error) {
      console.error('Error fetching utilization:', error);
      toast({
        title: 'Error fetching utilization',
        description: 'There was a problem fetching utilization history.',
        variant: 'destructive'
      });
    }
  };

  const fetchUnavailability = async () => {
    try {
      const data = await dbService.getUnavailability();
      setUnavailability(data as any[]);
    } catch (error) {
      console.error('Error fetching unavailability:', error);
      toast({
        title: 'Error fetching unavailability',
        description: 'There was a problem fetching unavailability data.',
        variant: 'destructive'
      });
    }
  };

  const fetchSkills = async () => {
    try {
      const data = await dbService.getUserSkills(user?.id);
      setSkills(data as any[]);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: 'Error fetching skills',
        description: 'There was a problem fetching skills.',
        variant: 'destructive'
      });
    }
  };

  const handleAddResource = async () => {
    if (!newResource.name || !newResource.email || !newResource.role || !newResource.team) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all resource details.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // In a real application, you would create a new user account and resource
      // For this example, we'll just update the local state
      const newResourceId = Math.random().toString(36).substring(2, 15);
      setResources([...resources, { id: newResourceId, ...newResource }]);
      toast({
        title: 'Resource added',
        description: 'New resource has been added successfully.'
      });
      // Reset form and close dialog
      setNewResource({ name: '', email: '', role: '', team: '' });
      setShowAddResourceDialog(false);
      setIsEditingResource(false);
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding the resource.',
        variant: 'destructive'
      });
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill) {
      toast({
        title: 'Missing information',
        description: 'Please provide a skill.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const created = await dbService.createUserSkill(newSkill, user?.id);
      if (created) {
        setSkills([...skills, created]);
        toast({
          title: 'Skill added',
          description: 'New skill has been added successfully.'
        });
      }
      // Reset form and close dialog
      setNewSkill('');
      setShowAddSkillDialog(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding the skill.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      // In a real application, you would delete the resource from the database
      // For this example, we'll just update the local state
      setResources(resources.filter(resource => resource.id !== resourceId));
      if (selectedResource && selectedResource.id === resourceId) {
        setSelectedResource(null);
      }
      toast({
        title: 'Resource deleted',
        description: 'Resource has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the resource.',
        variant: 'destructive'
      });
    }
  };

  const handleEditResource = (resource: any) => {
    setNewResource({
      name: resource.name,
      email: resource.email,
      role: resource.role,
      team: resource.team
    });
    setIsEditingResource(true);
    setShowAddResourceDialog(true);
  };

  const filteredResources = resources.filter(resource => 
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ResourceHub</h1>
            <p className="text-muted-foreground">
              Central hub for managing resources, skills, and allocations
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>Please log in to view and manage your resources.</p>
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
            <h1 className="text-3xl font-bold tracking-tight">ResourceHub</h1>
            <p className="text-muted-foreground">
              Central hub for managing resources, skills, and allocations
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Allocations</span>
            </TabsTrigger>
            <TabsTrigger value="utilization" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Utilization</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="w-full md:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                setNewResource({ name: '', email: '', role: '', team: '' });
                setIsEditingResource(false);
                setShowAddResourceDialog(true);
              }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Loading resources...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No resources found. Add your first resource to get started.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredResources.map(resource => (
                  <Card 
                    key={resource.id} 
                    className={`cursor-pointer transition-all ${selectedResource?.id === resource.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedResource(resource)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditResource(resource);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(resource.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{resource.role} - {resource.team}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{resource.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            {selectedResource && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Skills</CardTitle>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSkillDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Skill
                    </Button>
                  </div>
                  <CardDescription>Skills for {selectedResource.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {skills.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No skills yet. Add your first skill for this resource.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {skills.map(skill => (
                        <Card key={skill.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(skill.created_at), 'MMM d, yyyy h:mm a')}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {}}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-wrap">{skill.skill}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocations</CardTitle>
                <CardDescription>
                  View and manage resource allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Resource allocation feature coming soon.</p>
                  <p className="text-sm mt-2">This will display resource allocations and allow management.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  View and track resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Resource utilization feature coming soon.</p>
                  <p className="text-sm mt-2">This will display resource utilization and allow tracking.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={showAddResourceDialog} onOpenChange={setShowAddResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
            <DialogDescription>
              {isEditingResource 
                ? 'Update resource information' 
                : 'Fill in the details to add a new resource'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Resource Name"
                className="col-span-3"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="resource@example.com"
                className="col-span-3"
                value={newResource.email}
                onChange={(e) => setNewResource({ ...newResource, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right text-sm font-medium">
                Role
              </label>
              <Input
                id="role"
                placeholder="Developer"
                className="col-span-3"
                value={newResource.role}
                onChange={(e) => setNewResource({ ...newResource, role: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="team" className="text-right text-sm font-medium">
                Team
              </label>
              <Input
                id="team"
                placeholder="Engineering"
                className="col-span-3"
                value={newResource.team}
                onChange={(e) => setNewResource({ ...newResource, team: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddResourceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResource}>
              {isEditingResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Add a skill for {selectedResource?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="skill" className="block text-sm font-medium mb-2">
                Skill
              </label>
              <Input
                id="skill"
                placeholder="Enter skill here..."
                className="min-h-[40px]"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ResourceHub;
