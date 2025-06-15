
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import AppLayout from '@/components/AppLayout';
import ProjectSidebar from '@/components/planboard/ProjectSidebar';
import ViewSelector from '@/components/planboard/ViewSelector';
import FilterPanel from '@/components/planboard/FilterPanel';
import BoardView from '@/components/planboard/BoardView';
import TimelineView from '@/components/planboard/TimelineView';
import GanttChart from '@/components/GanttChart';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ViewType = 'gantt' | 'timeline' | 'calendar' | 'board';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
  created_at: string;
  member_count?: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  assignee?: string;
  project_id?: string;
  progress?: number;
  comment_count?: number;
  attachment_count?: number;
}

const PlanBoard = () => {
  const { session } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('gantt');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [teamMembers] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
  ]);

  useEffect(() => {
    if (session?.user?.id) {
      loadProjects();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      console.log('Loading projects for user:', session?.user?.id);
      
      // Use direct query instead of dbService to avoid complex policy issues
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      const projectsWithDefaults = (data || []).map(project => ({
        ...project,
        color: project.color || '#3b82f6',
        status: project.status || 'active',
        member_count: Math.floor(Math.random() * 5) + 1, // Mock data
      }));
      
      console.log('Loaded projects:', projectsWithDefaults);
      setProjects(projectsWithDefaults);
      
      if (projectsWithDefaults.length > 0 && !selectedProject) {
        setSelectedProject(projectsWithDefaults[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!selectedProject) return;
    
    try {
      console.log('Loading tasks for project:', selectedProject.id);
      
      // Use direct query and use created_by instead of user_id
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      const tasksWithMockData = (data || []).map(task => ({
        ...task,
        start_date: task.start_date || new Date().toISOString().split('T')[0],
        progress: Math.floor(Math.random() * 100),
        comment_count: Math.floor(Math.random() * 5),
        attachment_count: Math.floor(Math.random() * 3),
      }));
      
      console.log('Loaded tasks:', tasksWithMockData);
      setTasks(tasksWithMockData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProject = () => {
    // This would open a project creation modal
    toast({
      title: 'Create Project',
      description: 'Project creation modal would open here',
    });
  };

  const handleEditProject = (project: Project) => {
    toast({
      title: 'Edit Project',
      description: `Edit modal for ${project.name} would open here`,
    });
  };

  const handleArchiveProject = (project: Project) => {
    toast({
      title: 'Archive Project',
      description: `${project.name} would be archived`,
    });
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleTaskMove = (taskId: string, newStatus: string, newIndex: number) => {
    // Update task status in database
    toast({
      title: 'Task Moved',
      description: `Task moved to ${newStatus}`,
    });
  };

  const handleTaskClick = (task: Task) => {
    toast({
      title: 'Task Details',
      description: `Task details modal for "${task.title}" would open here`,
    });
  };

  // Prepare board columns
  const boardColumns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in-progress'),
    },
    {
      id: 'review',
      title: 'Review',
      tasks: tasks.filter(task => task.status === 'review'),
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(task => task.status === 'done'),
    },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'board':
        return (
          <BoardView
            columns={boardColumns}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            dateRange={{
              start: new Date(),
              end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }}
          />
        );
      case 'calendar':
        return (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Calendar View</h3>
            <p className="text-muted-foreground">Calendar view will be implemented here</p>
          </div>
        );
      case 'gantt':
      default:
        return <GanttChart />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full">
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onArchiveProject={handleArchiveProject}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedProject?.name || 'Select a Project'}
                </h1>
                {selectedProject?.description && (
                  <p className="text-muted-foreground mt-1">
                    {selectedProject.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {selectedProject && (
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              teamMembers={teamMembers}
            />
          )}

          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            {selectedProject ? (
              renderCurrentView()
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a project from the sidebar to start planning
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
