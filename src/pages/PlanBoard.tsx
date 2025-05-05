
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, ArrowLeft, Plus, Filter, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import GanttChart from '@/components/GanttChart';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at: string;
}

interface Milestone {
  id: string;
  title: string;
  project_id: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface ResourceAllocation {
  team: string;
  allocation: number;
}

const PlanBoard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState('gantt');
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'active'
  });
  
  useEffect(() => {
    fetchProjects();
    fetchMilestones();
    fetchResourceAllocations();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userData.user.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Failed to load projects",
        description: "An error occurred while loading your projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // This is a placeholder - in a real app, milestones would be in their own table
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('priority', 'high')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      // Map tasks to milestones format
      const milestoneData: Milestone[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        project_id: task.project || '',
        due_date: task.due_date || new Date().toISOString(),
        priority: task.priority as 'low' | 'medium' | 'high',
        completed: task.status === 'done'
      }));
      
      setMilestones(milestoneData);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchResourceAllocations = async () => {
    // In a real app, this would fetch from a resource_allocations table
    // For now, using placeholder data
    setResources([
      { team: 'Design Team', allocation: 80 },
      { team: 'Development', allocation: 95 },
      { team: 'QA Team', allocation: 50 }
    ]);
  };

  const handleCreateProject = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a project",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          description: newProject.description,
          user_id: userData.user.id,
          status: newProject.status
        })
        .select();

      if (error) throw error;

      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      });

      setProjects([...(data || []), ...projects]);
      setNewProjectDialogOpen(false);
      setNewProject({ name: '', description: '', status: 'active' });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Failed to create project",
        description: "An error occurred while creating your project",
        variant: "destructive",
      });
    }
  };

  // Helper to format date
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return 'No dates set';
    
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Helper to determine badge status
  const getBadgeForStatus = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-600">Completed</Badge>;
      default:
        return <Badge variant="secondary">On Track</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">PlanBoard</h1>
          <p className="text-muted-foreground">Visual project planning with interactive Gantt charts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to your PlanBoard.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input 
                    id="projectName" 
                    placeholder="Enter project name" 
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea 
                    id="projectDescription" 
                    placeholder="Enter project description" 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="gantt" onValueChange={setView}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Q2 2025
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Q1 2025</DropdownMenuItem>
                <DropdownMenuItem>Q2 2025</DropdownMenuItem>
                <DropdownMenuItem>Q3 2025</DropdownMenuItem>
                <DropdownMenuItem>Q4 2025</DropdownMenuItem>
                <DropdownMenuItem>Custom Range...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="gantt" className="mt-0">
            <Card className="p-4">
              <GanttChart />
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Visualize project timelines with a focus on milestones and key dates.
                </p>
                <Button>Create Timeline</Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  View projects in a calendar format to better understand daily and weekly commitments.
                </p>
                <Button>Open Calendar</Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="board" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Board View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Organize project tasks in a Kanban-style board for better workflow visualization.
                </p>
                <Button>Setup Board</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Active Projects</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No projects yet</p>
              <Button variant="outline" size="sm" onClick={() => setNewProjectDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 3).map(project => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(project.start_date, project.end_date)}
                    </p>
                  </div>
                  {getBadgeForStatus(project.status)}
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Upcoming Milestones</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading milestones...</div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No milestones yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(milestone.due_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge className={
                    milestone.priority === 'high' ? "bg-amber-600" : 
                    milestone.priority === 'medium' ? "bg-emerald-600" : "bg-blue-600"
                  }>
                    {milestone.priority.charAt(0).toUpperCase() + milestone.priority.slice(1)} Priority
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Resource Allocation</h3>
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{resource.team}</p>
                  <p className="text-sm text-muted-foreground">{resource.allocation}% allocated</p>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      resource.allocation > 90 ? "bg-amber-600" : 
                      resource.allocation > 70 ? "bg-emerald-600" : "bg-blue-600"
                    }`} 
                    style={{ width: `${resource.allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
