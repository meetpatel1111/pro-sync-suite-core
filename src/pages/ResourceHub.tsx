import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Plus, Users, Calendar, Clock, Briefcase, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TeamCalendar,
  AllocationBoard,
  SkillsMatrix,
  UtilizationReports,
  AvailabilityTable
} from "../components/ResourceHubWidgets";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { updateResource } from '@/services/resourcehub';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { safeQueryTable } from '@/utils/db-helpers';
import { Resource, ResourceSkill } from '@/utils/dbtypes';

// Extend Resource type to include allocation_history and utilization_history for UI safety
interface ResourceWithHistory extends Resource {
  allocation_history?: Array<{
    project_id: string;
    percent: number;
    from: string;
    to?: string | null;
  }>;
  // utilization_history is now always { date: string, utilization_percent: number }
  // FIX: Use utilization_percent for all utilization_history entries
  utilization_history?: Array<{
    date: string;
    utilization_percent: number;
  }>;
}

interface ResourceFormState {
  name: string;
  role: string;
  availability: string;
  utilization: number;
  skills: string[];
}

import dbService from '@/services/dbService';

const ResourceHub = () => {
  // ...existing state...
  // Edit resource dialog state
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceWithHistory | null>(null);
  const [editResourceForm, setEditResourceForm] = useState<ResourceFormState>({
    name: '',
    role: '',
    availability: 'Available',
    utilization: 0,
    skills: [], // Should be array of { id, skill }
  });

  // Handler for edit form field changes
  const handleEditResourceChange = (field: keyof ResourceFormState, value: any) => {
    setEditResourceForm(prev => ({ ...prev, [field]: value }));
  };
  // Skill change in edit form
  const handleEditSkillChange = (index: number, value: string) => {
    setEditResourceForm(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => (i === index ? value : s)),
    }));
  };
  // Add skill field in edit form
  const addEditSkillField = () => {
    setEditResourceForm(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };
  // Remove skill field in edit form
  const removeEditSkillField = (index: number) => {
    setEditResourceForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // fetchResources: Fetch resources and update state
  const fetchResources = async () => {
    console.log('[ResourceHub] fetchResources called');
    if (!session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch resources using safeQueryTable helper
      // Fetch all resources for the user
      const { data: resourcesData, error: resourcesError } = await safeQueryTable<Resource>(
        'resources',
        (query) => query.select('*').eq('user_id', session.user.id)
      );
      console.log('[ResourceHub] safeQueryTable result:', { resourcesData, resourcesError });
      if (resourcesError) throw resourcesError;
      setResourcesError(null); // Clear previous error if success
      // Fetch skills for all resources from resource_skills table
      if (resourcesData && resourcesData.length > 0) {
        const resourcesWithSkills = await Promise.all(
          resourcesData.map(async (resource: Resource) => {
            // Fetch skills for this resource from the resource_skills table
            const { data: skillsData, error: skillsError } = await safeQueryTable<ResourceSkill>(
              'resource_skills',
              (query) => query.select('skill').eq('resource_id', resource.id)
            );
            if (skillsError) {
              console.error('[ResourceHub] Error fetching skills for resource', resource.id, skillsError);
            }
            // Map skillsData to an array of skill names (strings)
            const skillNames = skillsData ? skillsData.map(s => s.skill) : [];
            return {
              ...resource,
              skills: skillNames,
              allocation_history: [], // Placeholder for future allocation data
              utilization_history: [], // Placeholder for future utilization data
              schedule: [] // Placeholder for future schedule data
            };
          })
        );
        setResources(resourcesWithSkills as Resource[]);
      }
    } catch (error: any) {
      setResourcesError(error?.message || error?.toString() || 'Unknown error');
      console.error('[ResourceHub] Error fetching resources:', error);
      toast({
        title: 'Failed to load resources',
        description: 'There was a problem fetching resource data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit edit
  const handleSubmitEditResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      let updateError = null;
      // Only update fields that exist in the resources table
      try {
        await handleUpdateResource(editingResource.id, {
          name: editResourceForm.name,
          role: editResourceForm.role,
          availability: editResourceForm.availability,
          utilization: editResourceForm.utilization,
        });
        // handleUpdateResource handles errors and toasts internally, so no need to check its result.
      } catch (err) {
        updateError = err;
        toast({ title: 'Failed to update resource', description: err?.message || String(err), variant: 'destructive' });
      }
      // Update skills separately
      // Defensive check: ensure user_id is present
      console.log('editingResource.user_id:', editingResource.user_id);
      if (!editingResource.user_id) {
        toast({ title: 'No user linked', description: 'This resource is not linked to a user.', variant: 'destructive' });
        setIsEditResourceOpen(false);
        setEditingResource(null);
        return;
      }
      try {
        // Remove all old skills
        if (editingResource.skills && editingResource.skills.length > 0) {
          // Remove all old skills for this resource (delete by resource id)
          const delResult = await dbService.deleteSkillsByResourceId(editingResource.user_id);
          if (delResult && delResult.error) {
            updateError = delResult.error;
            toast({ title: 'Failed to delete skills', description: delResult.error?.message || String(delResult.error), variant: 'destructive' });
          }
        }
        // Add new skills
        for (const skill of editResourceForm.skills) {
          const skillValue = skill;
          if (skillValue && skillValue.trim() !== '') {
            const addResult = await dbService.createUserSkill({
              user_id: editingResource.user_id,
              skill: skillValue.trim(),
            });
            console.log('[EditResource] createUserSkill', skillValue, addResult);
            if (addResult && addResult.error) {
              updateError = addResult.error;
              toast({ title: 'Failed to add skill', description: addResult.error?.message || String(addResult.error), variant: 'destructive' });
            }
          }
        }
      } catch (err) {
        updateError = err;
        toast({ title: 'Failed to update skills', description: err?.message || String(err), variant: 'destructive' });
      }
      // Always refresh resources after update
      try {
        const fetchResult = await fetchResources();
        console.log('[EditResource] fetchResources result:', fetchResult);
      } catch (err) {
        toast({ title: 'Failed to refresh resources', description: err?.message || String(err), variant: 'destructive' });
      }
      setIsEditResourceOpen(false);
      setEditingResource(null);
      if (!updateError) {
        toast({ title: 'Resource updated', description: 'Resource updated successfully.' });
      } else {
        toast({ title: 'Update failed', description: updateError?.message || String(updateError), variant: 'destructive' });
      }
    }
  };

  // ...existing state...
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  // Error state for resource fetching
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<ResourceWithHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Additional state for other tabs
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocationsError, setAllocationsError] = useState<string | null>(null);
  const [allocationsLoading, setAllocationsLoading] = useState(true);

  const [utilizationHistory, setUtilizationHistory] = useState<any[]>([]);
  const [utilizationError, setUtilizationError] = useState<string | null>(null);
  const [utilizationLoading, setUtilizationLoading] = useState(true);

  const [unavailability, setUnavailability] = useState<any[]>([]);
  const [unavailabilityError, setUnavailabilityError] = useState<string | null>(null);
  const [unavailabilityLoading, setUnavailabilityLoading] = useState(true);
  
  // New resource form state
  const [newResource, setNewResource] = useState<ResourceFormState>({
    name: '',
    role: '',
    availability: 'Available',
    utilization: 0,
    skills: ['']
  });

  // Check if user is authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch resources data from Supabase
  useEffect(() => {
    fetchResources();
  }, [session, toast]);

  // Fetch allocations for calendar & allocation board
  const fetchAllocations = async () => {
    setLoadingAllocations(true);
    try {
      const { data, error } = await dbService.getResourceAllocations();
      if (error) throw error;
      setAllocations(data);
      setAllocationsError(null);
    } catch (error) {
      console.error("Error fetching allocations:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  // Fetch utilization history for reports
  const fetchUtilization = async () => {
    setLoadingUtilization(true);
    try {
      const { data, error } = await dbService.getUtilizationHistory();
      if (error) throw error;
      setUtilizationHistory(data);
      setUtilizationError(null);
    } catch (error) {
      console.error("Error fetching utilization:", error);
    } finally {
      setLoadingUtilization(false);
    }
  };

  // Fetch projects for allocation/calendar
  useEffect(() => {
    if (!session) {
      setProjectsLoading(false);
      return;
    }
    setProjectsLoading(true);
    dbService.getProjects(session.user.id)
      .then((result: any) => {
        if (result && result.data) {
          setProjects(result.data);
          setProjectsError(null);
        } else {
          setProjects([]);
          setProjectsError('No projects found');
        }
      })
      .catch((err: any) => {
        setProjectsError(err?.message || err?.toString() || 'Unknown error');
        setProjects([]);
      })
      .finally(() => setProjectsLoading(false));
  }, [session]);

  // Fetch unavailability for availability tab
  useEffect(() => {
    if (!session) {
      setUnavailabilityLoading(false);
      return;
    }
    setUnavailabilityLoading(true);
    dbService.getUnavailability()
      .then((result: any) => {
        if (result && result.data) {
          setUnavailability(result.data);
          setUnavailabilityError(null);
        } else {
          setUnavailability([]);
          setUnavailabilityError(result?.error?.message || 'No unavailability data');
        }
      })
      .catch((err: any) => {
        setUnavailabilityError(err?.message || err?.toString() || 'Unknown error');
        setUnavailability([]);
      })
      .finally(() => setUnavailabilityLoading(false));
  }, [session]);

  // Add a new resource to the database
  const handleAddResource = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add resources',
        variant: 'destructive'
      });
      return;
    }

    if (!newResource.name || !newResource.role) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Insert new resource using safeQueryTable helper
      const { data: resourceData, error: resourceError } = await safeQueryTable<Resource>(
        'resources',
        (query) => query.insert({
          name: newResource.name,
          role: newResource.role,
          availability: newResource.availability,
          utilization: newResource.utilization,
          user_id: session.user.id
        }).select()
      );
      
      if (resourceError) throw resourceError;
      
      if (resourceData && resourceData.length > 0) {
        // Insert skills for the resource
        const skills = newResource.skills.filter(skill => skill.trim() !== '');
        
        if (skills.length > 0) {
          const skillsToInsert = skills.map(skill => ({
            resource_id: resourceData[0].id,
            skill,
            user_id: session.user.id
          }));
          
          const { error: skillsError } = await safeQueryTable<ResourceSkill>(
            'resource_skills',
            (query) => query.insert(skillsToInsert)
          );
          
          if (skillsError) throw skillsError;
        }
        
        // Add the new resource to state
        const newResourceComplete: Resource = {
          ...resourceData[0],
          skills: skills,
          schedule: [],
          user_id: session.user.id,
          created_at: new Date().toISOString()
        };
        
        setResources(prevResources => [...prevResources, newResourceComplete]);
        
        toast({
          title: 'Resource added',
          description: `${newResource.name} has been added successfully`,
        });
        
        // Reset form
        setNewResource({
          name: '',
          role: '',
          availability: 'Available',
          utilization: 0,
          skills: ['']
        });
        
        setIsAddResourceOpen(false);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        title: 'Failed to add resource',
        description: 'There was a problem saving the resource',
        variant: 'destructive'
      });
    }
  };

  // Filter resources based on search query
  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resource.skills && resource.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Function to determine badge variant based on availability
  const getBadgeVariant = (
    availability: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning' => {
    if (availability === 'Available') return 'outline';
    if (availability === 'Unavailable') return 'destructive';
    if (availability === 'Busy') return 'warning';
    // Add more mappings as needed
    return 'default';
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...newResource.skills];
    updatedSkills[index] = value;
    setNewResource({ ...newResource, skills: updatedSkills });
  };

  const removeSkillField = (index: number) => {
    setNewResource({
      ...newResource,
      skills: newResource.skills.filter((_, i) => i !== index),
    });
  };

  const addSkillField = () => {
    setNewResource({ ...newResource, skills: [...newResource.skills, ''] });
  };

  // Delete a resource by id
  const handleDeleteResource = async (resourceId: string) => {
    if (!session) {
      toast({ title: 'Authentication required', description: 'Please sign in to delete resources', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await safeQueryTable('resources', (query) => query.delete().eq('id', resourceId).eq('user_id', session.user.id));
      if (error) throw error;
      setResources(resources.filter(resource => resource.id !== resourceId));
      toast({ title: 'Resource deleted', description: 'Resource has been deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast({ title: 'Delete failed', description: error?.message || 'Could not delete resource', variant: 'destructive' });
    }
  };

  // Update a resource by id
  const handleUpdateResource = async (resourceId: string, updates: Partial<Resource>) => {
    if (!session) {
      toast({ title: 'Authentication required', description: 'Please sign in to update resources', variant: 'destructive' });
      return;
    }
    try {
      const { data, error } = await safeQueryTable<Resource>('resources', (query) => query.update(updates).eq('id', resourceId).eq('user_id', session.user.id).select());
      if (error) throw error;
      if (data && data.length > 0) {
        setResources(resources.map(resource => resource.id === resourceId ? { ...resource, ...updates } : resource));
        toast({ title: 'Resource updated', description: 'Resource has been updated successfully.' });
      }
    } catch (error: any) {
      console.error('Error updating resource:', error);
      toast({ title: 'Update failed', description: error?.message || 'Could not update resource', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="sticky top-0 z-10 bg-white dark:bg-black">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="directory">Resource Directory</TabsTrigger>
          <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Board</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="reports">Utilization Reports</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        {/* 1. Dashboard */}
        <TabsContent value="dashboard">
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Resource Utilization Overview</CardTitle>
              <CardDescription>Summary of current resource allocation and utilization.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Resource Button */}
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddResourceOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
              </div>
              {/* Add Resource Dialog */}
              <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); handleAddResource(); }}>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={newResource.name} onChange={e => setNewResource({ ...newResource, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input value={newResource.role} onChange={e => setNewResource({ ...newResource, role: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Availability</Label>
                        <Select value={newResource.availability} onValueChange={value => setNewResource({ ...newResource, availability: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Unavailable">Unavailable</SelectItem>
                            <SelectItem value="Busy">Busy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Utilization (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={newResource.utilization}
                          onChange={e => setNewResource({ ...newResource, utilization: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Skills</Label>
                        {newResource.skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center mb-2">
                            <Input
                              value={skill}
                              onChange={e => handleSkillChange(idx, e.target.value)}
                              placeholder="Skill"
                              className="mr-2"
                            />
                            {newResource.skills.length > 1 && (
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeSkillField(idx)}>
                                &times;
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addSkillField} className="mt-2">
                          + Add Skill
                        </Button>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit">Add Resource</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddResourceOpen(false)}>Cancel</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            {/* Resource Utilization Bar Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Resource Utilization</h3>
              <div className="space-y-2">
                {resources.length === 0 && <div className="text-muted-foreground">No resources to display.</div>}
                {resources.map(resource => (
                  <div key={resource.id} className="flex items-center">
                    <span className="w-32 truncate text-sm mr-2">{resource.name}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden mr-2">
                      <div
                        className={`h-4 rounded ${resource.utilization > 90 ? 'bg-red-500' : resource.utilization > 60 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                        style={{ width: `${resource.utilization}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs">{resource.utilization}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Allocations Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Upcoming Allocations</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium">Resource</th>
                    <th className="text-left font-medium">Next Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr><td colSpan={2} className="text-muted-foreground">No resources.</td></tr>
                  ) : (
                    resources.map(resource => (
                      <tr key={resource.id}>
                        <td>{resource.name}</td>
                        <td className="text-muted-foreground">No upcoming allocation</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Overloaded Resources List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Overloaded Resources</h3>
              <ul>
                {resources.filter(r => r.utilization > 90).length === 0 ? (
                  <li className="text-muted-foreground">No overloaded resources.</li>
                ) : (
                  resources.filter(r => r.utilization > 90).map(r => (
                    <li key={r.id} className="text-red-600 font-medium">{r.name} ({r.utilization}%)</li>
                  ))
                )}
              </ul>
            </div>

            {/* Unassigned Resources List */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Unassigned Resources</h3>
              <ul>
                {resources.filter(r => r.utilization === 0).length === 0 ? (
                  <li className="text-muted-foreground">No unassigned resources.</li>
                ) : (
                  resources.filter(r => r.utilization === 0).map(r => (
                    <li key={r.id}>{r.name}</li>
                  ))
                )}
              </ul>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Team Calendar */}
        <TabsContent value="calendar">
          <Card className="my-4">
            {/* Editable Team Calendar: Users can view and edit allocations */}
            <TeamCalendar
              resources={resources}
              allocations={allocations}
              projects={projects}
              editable={true}
            />
          </Card>
        </TabsContent>

        {/* 5. Utilization Reports */}
        <TabsContent value="reports">
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Utilization Reports</CardTitle>
              <CardDescription>Export and analyze utilization data.</CardDescription>
            </CardHeader>
            <CardContent>
              <UtilizationReports resources={resources} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Resource Directory */}
        <TabsContent value="directory">
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Resource Directory</CardTitle>
              <CardDescription>List, search, and filter all resources.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Resource Button */}
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddResourceOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
              </div>
              {/* Add Resource Dialog */}
              <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); handleAddResource(); }}>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={newResource.name} onChange={e => setNewResource({ ...newResource, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input value={newResource.role} onChange={e => setNewResource({ ...newResource, role: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Availability</Label>
                        <Select value={newResource.availability} onValueChange={value => setNewResource({ ...newResource, availability: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Unavailable">Unavailable</SelectItem>
                            <SelectItem value="Busy">Busy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Utilization (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={newResource.utilization}
                          onChange={e => setNewResource({ ...newResource, utilization: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Skills</Label>
                        {newResource.skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center mb-2">
                            <Input
                              value={skill}
                              onChange={e => handleSkillChange(idx, e.target.value)}
                              placeholder="Skill"
                              className="mr-2"
                            />
                            {newResource.skills.length > 1 && (
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeSkillField(idx)}>
                                &times;
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addSkillField} className="mt-2">
                          + Add Skill
                        </Button>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit">Add Resource</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddResourceOpen(false)}>Cancel</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Resource Directory Table - Live Data */}
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading resources...</div>
              ) : resourcesError ? (
                <div className="p-4 text-center text-destructive">{resourcesError}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResources.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">No resources found.</td>
                        </tr>
                      ) : (
                        filteredResources.map(resource => (
                          <tr key={resource.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-2 font-medium">{resource.name}</td>
                            <td className="px-4 py-2">{resource.role}</td>
                            <td className="px-4 py-2">
                              <Badge variant={getBadgeVariant(resource.availability)}>{resource.availability}</Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Progress value={resource.utilization} className="h-2" />
                              <span className="text-xs ml-2 align-middle">{resource.utilization}%</span>
                            </td>
                            <td className="px-4 py-2">
                              {resource.skills && resource.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {resource.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary">{skill}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">None</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="mr-2"
                                onClick={() => {
                                  setEditingResource(resource);
                                  setEditResourceForm({
                                    name: resource.name,
                                    role: resource.role,
                                    availability: resource.availability,
                                    utilization: resource.utilization,
                                    skills: resource.skills || [''],
                                  });
                                  setIsEditResourceOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteResource(resource.id)}>
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {/* End Resource Directory Table - Extend this pattern to other tabs for live data */}

              {/* Edit Resource Dialog */}
              <Dialog open={isEditResourceOpen} onOpenChange={setIsEditResourceOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitEditResource}>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editResourceForm.name}
                          onChange={e => handleEditResourceChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          min={0}
                          max={100}
                          value={editResourceForm.utilization}
                          onChange={e => handleEditResourceChange('utilization', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Skills</Label>
                        {editResourceForm.skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center mb-2">
                            <Input
                              value={skill}
                              onChange={e => handleEditSkillChange(idx, e.target.value)}
                              placeholder="Skill"
                              className="mr-2"
                            />
                            {editResourceForm.skills.length > 1 && (
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeEditSkillField(idx)}>
                                &times;
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addEditSkillField} className="mt-2">
                          + Add Skill
                        </Button>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsEditResourceOpen(false)}>Cancel</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TEAM CALENDAR TAB --- */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>
                <Calendar className="inline w-5 h-5 mr-2" /> Team Calendar
              </CardTitle>
              <CardDescription>
                View resource allocations for the team this week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading || allocationsLoading || isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading calendar...</div>
              ) : projectsError || allocationsError || resourcesError ? (
                <div className="p-4 text-center text-destructive">
                  {projectsError || allocationsError || resourcesError}
                </div>
              ) : (
                <TeamCalendar
                  resources={resources}
                  allocations={allocations}
                  projects={projects}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ALLOCATION BOARD TAB --- */}
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>
                <Briefcase className="inline w-5 h-5 mr-2" /> Allocation Board
              </CardTitle>
              <CardDescription>
                See which resources are allocated to which projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading || allocationsLoading || isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading allocation board...</div>
              ) : projectsError || allocationsError || resourcesError ? (
                <div className="p-4 text-center text-destructive">
                  {projectsError || allocationsError || resourcesError}
                </div>
              ) : (
                <AllocationBoard
                  resources={resources}
                  allocations={allocations}
                  projects={projects}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SKILLS MATRIX TAB --- */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>
                <Users className="inline w-5 h-5 mr-2" /> Skills Matrix
              </CardTitle>
              <CardDescription>
                Overview of skills across all resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading skills matrix...</div>
              ) : resourcesError ? (
                <div className="p-4 text-center text-destructive">{resourcesError}</div>
              ) : (
                <SkillsMatrix resources={resources} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- UTILIZATION REPORTS TAB --- */}
        <TabsContent value="utilization">
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="inline w-5 h-5 mr-2" /> Utilization Reports
              </CardTitle>
              <CardDescription>
                Download and review resource utilization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading utilization data...</div>
              ) : resourcesError ? (
                <div className="p-4 text-center text-destructive">{resourcesError}</div>
              ) : (
                <UtilizationReports resources={resources} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- AVAILABILITY TAB --- */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="inline w-5 h-5 mr-2" /> Availability
              </CardTitle>
              <CardDescription>
                See when resources are unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unavailabilityLoading || isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading availability...</div>
              ) : unavailabilityError || resourcesError ? (
                <div className="p-4 text-center text-destructive">{unavailabilityError || resourcesError}</div>
              ) : (
                <AvailabilityTable resources={resources} unavailability={unavailability} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </AppLayout>
  );
}
export default ResourceHub;
