
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Plus, Users, Calendar, Clock, Briefcase, Search, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { safeQueryTable } from '@/utils/db-helpers';
import { Resource, ResourceSkill } from '@/utils/dbtypes';
import ResourceAllocation from '@/components/resourcehub/ResourceAllocation';
import UtilizationDashboard from '@/components/resourcehub/UtilizationDashboard';
import SkillMatrix from '@/components/resourcehub/SkillMatrix';

interface ResourceFormState {
  name: string;
  role: string;
  availability: string;
  utilization: number;
  skills: string[];
}

const ResourceHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  
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
    const fetchResources = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch resources using safeQueryTable helper
        const { data: resourcesData, error: resourcesError } = await safeQueryTable<Resource>(
          'resources',
          (query) => query.select('*').eq('user_id', session.user.id)
        );
        
        if (resourcesError) throw resourcesError;
        
        // Fetch allocations
        const { data: allocationsData, error: allocationsError } = await safeQueryTable(
          'allocations',
          (query) => query.select('*')
        );
        
        if (allocationsError) {
          console.error('Error fetching allocations:', allocationsError);
        } else {
          setAllocations(allocationsData || []);
        }
        
        if (resourcesData) {
          // For each resource, fetch their skills
          const resourcesWithSkills = await Promise.all(
            resourcesData.map(async (resource) => {
              // Fetch skills using safeQueryTable helper
              const { data: skillsData, error: skillsError } = await safeQueryTable<ResourceSkill>(
                'resource_skills',
                (query) => query.select('skill').eq('resource_id', resource.id)
              );
              
              if (skillsError) {
                console.error('Error fetching skills:', skillsError);
                return {
                  ...resource,
                  skills: [],
                  schedule: [] // Placeholder for future schedule data
                };
              }
              
              return {
                ...resource,
                skills: skillsData ? skillsData.map(s => s.skill) : [],
                schedule: [] // Placeholder for future schedule data
              };
            })
          );
          
          setResources(resourcesWithSkills as Resource[]);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: 'Failed to load resources',
          description: 'There was a problem fetching resource data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [session, toast]);

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
  const getBadgeVariant = (availability: string) => {
    if (availability === 'Available') return 'outline';
    if (availability === 'Limited') return 'secondary';
    return 'destructive';
  };

  // Add/remove skill fields in the form
  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...newResource.skills];
    updatedSkills[index] = value;
    setNewResource({ ...newResource, skills: updatedSkills });
  };

  const addSkillField = () => {
    setNewResource({ ...newResource, skills: [...newResource.skills, ''] });
  };

  const removeSkillField = (index: number) => {
    const updatedSkills = [...newResource.skills];
    updatedSkills.splice(index, 1);
    setNewResource({ ...newResource, skills: updatedSkills });
  };

  // Get all unique skills from resources
  const allSkills = [...new Set(resources.flatMap(resource => resource.skills || []))];

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-full mb-2" />
              <div className="flex flex-wrap gap-1 mt-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout>
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
            <h1 className="text-3xl font-bold tracking-tight">Resource Hub</h1>
            <p className="text-muted-foreground">
              Manage team resources, availability, and allocation
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Resource</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={newResource.name} 
                      onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      value={newResource.role} 
                      onChange={(e) => setNewResource({...newResource, role: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select 
                      value={newResource.availability} 
                      onValueChange={(value) => setNewResource({...newResource, availability: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Limited">Limited</SelectItem>
                        <SelectItem value="Unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="utilization">Utilization (%)</Label>
                    <Input 
                      id="utilization" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={newResource.utilization.toString()} 
                      onChange={(e) => setNewResource({...newResource, utilization: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Skills</Label>
                    {newResource.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={skill} 
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          placeholder="Enter a skill"
                        />
                        {newResource.skills.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeSkillField(index)}
                          >
                            -
                          </Button>
                        )}
                        {index === newResource.skills.length - 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={addSkillField}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddResourceOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddResource}>
                    Add Resource
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="utilization" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Utilization</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Allocation</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Skills</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="team">
            {isLoading ? (
              renderSkeleton()
            ) : (
              session ? (
                filteredResources.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                      <Card key={resource.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar>
                            <AvatarImage src={resource.avatar_url} alt={resource.name} />
                            <AvatarFallback>{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{resource.name}</CardTitle>
                            <CardDescription>{resource.role}</CardDescription>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={getBadgeVariant(resource.availability)}>
                                {resource.availability}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Utilization</p>
                            <div className="flex items-center gap-2">
                              <Progress value={resource.utilization} className="h-2" />
                              <span className="text-sm">{resource.utilization}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Availability This Week</p>
                            <div className="flex items-center gap-2">
                              <Progress value={100 - resource.utilization} className="h-2" />
                              <span className="text-sm">{100 - resource.utilization}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Skills</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {resource.skills && resource.skills.map((skill, idx) => (
                                <Badge key={idx} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No resources found. Add your first resource to get started.</p>
                    <Button 
                      onClick={() => setIsAddResourceOpen(true)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </Card>
                )
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Please sign in to manage resources.</p>
                  <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </Card>
              )
            )}
          </TabsContent>

          <TabsContent value="utilization">
            <UtilizationDashboard resources={resources} allocations={allocations} />
          </TabsContent>

          <TabsContent value="allocation">
            <ResourceAllocation />
          </TabsContent>

          <TabsContent value="skills">
            <SkillMatrix 
              resources={resources} 
              skills={allSkills}
              onSkillUpdate={() => {
                // Refresh resources when skills are updated
                if (session) {
                  // Re-fetch resources to get updated skills
                }
              }}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Resource Schedule</CardTitle>
                <CardDescription>View and manage team member schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Schedule content will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ResourceHub;
