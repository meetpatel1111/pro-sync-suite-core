
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, User, Calendar, BarChart2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Resource {
  id: string;
  name: string;
  type: string;
  availability: string;
  user_id: string;
  created_at: string;
}

interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
  user_id: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

const ResourceHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  
  // Dialog states
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [currentAllocation, setCurrentAllocation] = useState<ResourceAllocation | null>(null);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'staff',
    availability: 'full-time'
  });
  const [newAllocation, setNewAllocation] = useState({
    resource_id: '',
    project_id: '',
    start_date: '',
    end_date: '',
    allocation_percentage: 100
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
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*');
      
      if (resourcesError) throw resourcesError;
      
      // Fetch allocations
      const { data: allocationsData, error: allocationsError } = await supabase
        .from('resource_allocations')
        .select('*');
      
      if (allocationsError) throw allocationsError;
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      
      if (projectsError) throw projectsError;
      
      setResources(resourcesData || []);
      setAllocations(allocationsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources and allocations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResource = async () => {
    try {
      if (!newResource.name) {
        toast({
          title: 'Validation Error',
          description: 'Resource name is required',
          variant: 'destructive'
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('resources')
        .insert({
          name: newResource.name,
          type: newResource.type,
          availability: newResource.availability,
          user_id: session.user.id
        })
        .select();
      
      if (error) throw error;
      
      setResources([...(data || []), ...resources]);
      setIsResourceDialogOpen(false);
      setNewResource({
        name: '',
        type: 'staff',
        availability: 'full-time'
      });
      
      toast({
        title: 'Success',
        description: 'Resource created successfully'
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to create resource',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateResource = async () => {
    if (!currentResource) return;
    
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          name: currentResource.name,
          type: currentResource.type,
          availability: currentResource.availability
        })
        .eq('id', currentResource.id);
      
      if (error) throw error;
      
      setResources(resources.map(r => r.id === currentResource.id ? currentResource : r));
      setIsResourceDialogOpen(false);
      setCurrentResource(null);
      
      toast({
        title: 'Success',
        description: 'Resource updated successfully'
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setResources(resources.filter(r => r.id !== id));
      
      toast({
        title: 'Success',
        description: 'Resource deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive'
      });
    }
  };

  const handleCreateAllocation = async () => {
    try {
      if (!newAllocation.resource_id || !newAllocation.project_id || !newAllocation.start_date || !newAllocation.end_date) {
        toast({
          title: 'Validation Error',
          description: 'All fields are required',
          variant: 'destructive'
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('resource_allocations')
        .insert({
          resource_id: newAllocation.resource_id,
          project_id: newAllocation.project_id,
          start_date: newAllocation.start_date,
          end_date: newAllocation.end_date,
          allocation_percentage: newAllocation.allocation_percentage,
          user_id: session.user.id
        })
        .select();
      
      if (error) throw error;
      
      setAllocations([...(data || []), ...allocations]);
      setIsAllocationDialogOpen(false);
      setNewAllocation({
        resource_id: '',
        project_id: '',
        start_date: '',
        end_date: '',
        allocation_percentage: 100
      });
      
      toast({
        title: 'Success',
        description: 'Allocation created successfully'
      });
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create allocation',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateAllocation = async () => {
    if (!currentAllocation) return;
    
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .update({
          resource_id: currentAllocation.resource_id,
          project_id: currentAllocation.project_id,
          start_date: currentAllocation.start_date,
          end_date: currentAllocation.end_date,
          allocation_percentage: currentAllocation.allocation_percentage
        })
        .eq('id', currentAllocation.id);
      
      if (error) throw error;
      
      setAllocations(allocations.map(a => a.id === currentAllocation.id ? currentAllocation : a));
      setIsAllocationDialogOpen(false);
      setCurrentAllocation(null);
      
      toast({
        title: 'Success',
        description: 'Allocation updated successfully'
      });
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update allocation',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAllocations(allocations.filter(a => a.id !== id));
      
      toast({
        title: 'Success',
        description: 'Allocation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete allocation',
        variant: 'destructive'
      });
    }
  };

  const getResourceName = (id: string) => {
    const resource = resources.find(r => r.id === id);
    return resource ? resource.name : 'Unknown Resource';
  };

  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : 'Unknown Project';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">ResourceHub</h1>
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
              Efficient resource allocation and management to optimize team capacity and project delivery
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Allocations</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Resource Management</h2>
              <Button
                onClick={() => {
                  setCurrentResource(null);
                  setIsResourceDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </div>
            
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading resources...</p>
                  </div>
                </CardContent>
              </Card>
            ) : resources.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No resources found. Add your first resource to get started.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Name</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Type</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Availability</th>
                        <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={resource.id} className="border-b">
                          <td className="p-4 align-middle font-medium">{resource.name}</td>
                          <td className="p-4 align-middle capitalize">{resource.type}</td>
                          <td className="p-4 align-middle capitalize">{resource.availability}</td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentResource(resource);
                                  setIsResourceDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteResource(resource.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Resource Allocations</h2>
              <Button
                onClick={() => {
                  setCurrentAllocation(null);
                  setIsAllocationDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Allocation
              </Button>
            </div>
            
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading allocations...</p>
                  </div>
                </CardContent>
              </Card>
            ) : allocations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No allocations found. Allocate resources to projects to get started.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Resource</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Project</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Start Date</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">End Date</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Allocation %</th>
                        <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((allocation) => (
                        <tr key={allocation.id} className="border-b">
                          <td className="p-4 align-middle font-medium">{getResourceName(allocation.resource_id)}</td>
                          <td className="p-4 align-middle">{getProjectName(allocation.project_id)}</td>
                          <td className="p-4 align-middle">{formatDate(allocation.start_date)}</td>
                          <td className="p-4 align-middle">{formatDate(allocation.end_date)}</td>
                          <td className="p-4 align-middle">{allocation.allocation_percentage}%</td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentAllocation(allocation);
                                  setIsAllocationDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAllocation(allocation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  Monitor your resource utilization and identify capacity issues
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Resource utilization charts and reports coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
            <DialogDescription>
              {currentResource ? 'Make changes to the resource.' : 'Add a new resource to your team.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={currentResource ? currentResource.name : newResource.name}
                onChange={(e) => currentResource 
                  ? setCurrentResource({...currentResource, name: e.target.value})
                  : setNewResource({...newResource, name: e.target.value})
                }
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <Select
                value={currentResource ? currentResource.type : newResource.type}
                onValueChange={(value) => currentResource 
                  ? setCurrentResource({...currentResource, type: value})
                  : setNewResource({...newResource, type: value})
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="availability" className="text-sm font-medium">Availability</label>
              <Select
                value={currentResource ? currentResource.availability : newResource.availability}
                onValueChange={(value) => currentResource 
                  ? setCurrentResource({...currentResource, availability: value})
                  : setNewResource({...newResource, availability: value})
                }
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="on-demand">On-demand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={currentResource ? handleUpdateResource : handleCreateResource}>
              {currentResource ? 'Save Changes' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentAllocation ? 'Edit Allocation' : 'Add Allocation'}</DialogTitle>
            <DialogDescription>
              {currentAllocation ? 'Make changes to the allocation.' : 'Allocate a resource to a project.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="resource" className="text-sm font-medium">Resource</label>
              <Select
                value={currentAllocation ? currentAllocation.resource_id : newAllocation.resource_id}
                onValueChange={(value) => currentAllocation 
                  ? setCurrentAllocation({...currentAllocation, resource_id: value})
                  : setNewAllocation({...newAllocation, resource_id: value})
                }
              >
                <SelectTrigger id="resource">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map(resource => (
                    <SelectItem key={resource.id} value={resource.id}>{resource.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="project" className="text-sm font-medium">Project</label>
              <Select
                value={currentAllocation ? currentAllocation.project_id : newAllocation.project_id}
                onValueChange={(value) => currentAllocation 
                  ? setCurrentAllocation({...currentAllocation, project_id: value})
                  : setNewAllocation({...newAllocation, project_id: value})
                }
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
                <Input
                  id="start-date"
                  type="date"
                  value={currentAllocation 
                    ? currentAllocation.start_date.slice(0, 10) 
                    : newAllocation.start_date
                  }
                  onChange={(e) => currentAllocation 
                    ? setCurrentAllocation({...currentAllocation, start_date: e.target.value})
                    : setNewAllocation({...newAllocation, start_date: e.target.value})
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
                <Input
                  id="end-date"
                  type="date"
                  value={currentAllocation 
                    ? currentAllocation.end_date.slice(0, 10) 
                    : newAllocation.end_date
                  }
                  onChange={(e) => currentAllocation 
                    ? setCurrentAllocation({...currentAllocation, end_date: e.target.value})
                    : setNewAllocation({...newAllocation, end_date: e.target.value})
                  }
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="allocation" className="text-sm font-medium">
                Allocation Percentage: {currentAllocation ? currentAllocation.allocation_percentage : newAllocation.allocation_percentage}%
              </label>
              <Input
                id="allocation"
                type="range"
                min="10"
                max="100"
                step="10"
                value={currentAllocation ? currentAllocation.allocation_percentage : newAllocation.allocation_percentage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  currentAllocation 
                    ? setCurrentAllocation({...currentAllocation, allocation_percentage: value})
                    : setNewAllocation({...newAllocation, allocation_percentage: value});
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={currentAllocation ? handleUpdateAllocation : handleCreateAllocation}>
              {currentAllocation ? 'Save Changes' : 'Add Allocation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ResourceHub;
