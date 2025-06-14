
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';

interface Allocation {
  id: string;
  resource_id: string;
  project_id: string;
  percent: number;
  from_date: string;
  to_date: string;
  notes?: string;
  resource_name?: string;
  project_name?: string;
}

interface AllocationFormState {
  resource_id: string;
  project_id: string;
  percent: number;
  from_date: string;
  to_date: string;
  notes: string;
}

const ResourceAllocation = () => {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const [newAllocation, setNewAllocation] = useState<AllocationFormState>({
    resource_id: '',
    project_id: '',
    percent: 0,
    from_date: '',
    to_date: '',
    notes: ''
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
      // Fetch allocations
      const { data: allocationsData, error: allocationsError } = await safeQueryTable(
        'allocations',
        (query) => query.select('*')
      );
      
      if (allocationsError) throw allocationsError;

      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await safeQueryTable(
        'resources',
        (query) => query.select('*').eq('user_id', session.user.id)
      );
      
      if (resourcesError) throw resourcesError;

      // Fetch projects (assuming projects table exists)
      const { data: projectsData, error: projectsError } = await safeQueryTable(
        'projects',
        (query) => query.select('*').eq('user_id', session.user.id)
      );
      
      if (!projectsError && projectsData) {
        setProjects(projectsData);
      }

      if (allocationsData && resourcesData) {
        // Enhance allocations with resource and project names
        const enhancedAllocations = allocationsData.map(allocation => ({
          ...allocation,
          resource_name: resourcesData.find(r => r.id === allocation.resource_id)?.name || 'Unknown',
          project_name: projectsData?.find(p => p.id === allocation.project_id)?.name || 'Unknown Project'
        }));
        
        setAllocations(enhancedAllocations);
        setResources(resourcesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Failed to load data',
        description: 'There was a problem fetching allocation data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllocation = async () => {
    if (!session || !newAllocation.resource_id || !newAllocation.project_id) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await safeQueryTable(
        'allocations',
        (query) => query.insert({
          resource_id: newAllocation.resource_id,
          project_id: newAllocation.project_id,
          percent: newAllocation.percent,
          from_date: newAllocation.from_date,
          to_date: newAllocation.to_date,
          notes: newAllocation.notes
        }).select()
      );
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast({
          title: 'Allocation created',
          description: 'Resource allocation has been created successfully',
        });
        
        setNewAllocation({
          resource_id: '',
          project_id: '',
          percent: 0,
          from_date: '',
          to_date: '',
          notes: ''
        });
        
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast({
        title: 'Failed to create allocation',
        description: 'There was a problem creating the allocation',
        variant: 'destructive'
      });
    }
  };

  const calculateResourceUtilization = (resourceId: string) => {
    const resourceAllocations = allocations.filter(a => a.resource_id === resourceId);
    return resourceAllocations.reduce((total, allocation) => total + allocation.percent, 0);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Loading allocation data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Manage resource allocations across projects</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                New Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Resource Allocation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Select 
                    value={newAllocation.resource_id} 
                    onValueChange={(value) => setNewAllocation({...newAllocation, resource_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} - {resource.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select 
                    value={newAllocation.project_id} 
                    onValueChange={(value) => setNewAllocation({...newAllocation, project_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="percent">Allocation Percentage</Label>
                  <Input 
                    id="percent" 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={newAllocation.percent.toString()} 
                    onChange={(e) => setNewAllocation({...newAllocation, percent: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="from_date">From Date</Label>
                    <Input 
                      id="from_date" 
                      type="date" 
                      value={newAllocation.from_date} 
                      onChange={(e) => setNewAllocation({...newAllocation, from_date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="to_date">To Date</Label>
                    <Input 
                      id="to_date" 
                      type="date" 
                      value={newAllocation.to_date} 
                      onChange={(e) => setNewAllocation({...newAllocation, to_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    value={newAllocation.notes} 
                    onChange={(e) => setNewAllocation({...newAllocation, notes: e.target.value})}
                    placeholder="Optional notes about this allocation"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddAllocation}>
                  Create Allocation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {allocations.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => {
                const resourceAllocations = allocations.filter(a => a.resource_id === resource.id);
                const totalUtilization = calculateResourceUtilization(resource.id);
                
                return (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{resource.name}</CardTitle>
                          <CardDescription>{resource.role}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getUtilizationColor(totalUtilization)}`}>
                            {totalUtilization}% allocated
                          </span>
                          {totalUtilization > 100 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(totalUtilization, 100)} 
                        className={`h-2 ${totalUtilization > 100 ? 'bg-red-100' : ''}`}
                      />
                    </CardHeader>
                    <CardContent>
                      {resourceAllocations.length > 0 ? (
                        <div className="space-y-2">
                          {resourceAllocations.map((allocation) => (
                            <div key={allocation.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{allocation.project_name}</span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {allocation.from_date} → {allocation.to_date}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {allocation.percent}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No current allocations</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No allocations found. Create your first allocation to get started.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Create Allocation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceAllocation;
