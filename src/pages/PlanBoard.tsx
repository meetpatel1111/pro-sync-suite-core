
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';
import AppLayout from '@/components/AppLayout';
import ProjectSidebar from '@/components/planboard/ProjectSidebar';
import ViewSelector from '@/components/planboard/ViewSelector';
import FilterPanel from '@/components/planboard/FilterPanel';
import BoardView from '@/components/planboard/BoardView';
import TimelineView from '@/components/planboard/TimelineView';
import GanttChart from '@/components/GanttChart';
import CreateProjectDialog from '@/components/planboard/CreateProjectDialog';
import ProjectMembersDialog from '@/components/planboard/ProjectMembersDialog';
import TaskDetailDialog from '@/components/planboard/TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, Users, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ViewType = 'gantt' | 'timeline' | 'calendar' | 'board';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  start_date?: string;
  end_date?: string;
  owner_id: string;
  user_id: string;
  created_at: string;
  member_count?: number;
  user_role?: string;
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
  assigned_to?: string[];
  project_id?: string;
  progress?: number;
  estimated_hours?: number;
  comment_count?: number;
  attachment_count?: number;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'manager';
  user_name?: string;
}

const PlanBoard = () => {
  const { session } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('gantt');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showProjectMembers, setShowProjectMembers] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
      loadUserProjectView();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await dbService.getProjectsWithMembers(session!.user.id);
      if (error) throw error;
      
      const projectsWithDefaults = (data || []).map(project => ({
        ...project,
        color: project.color || '#3b82f6',
        status: project.status || 'active',
        member_count: Math.floor(Math.random() * 5) + 1, // Mock data for now
        user_role: 'manager', // Will be determined by project_members query
      }));
      
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
      const { data, error } = await dbService.getProjectTasks(selectedProject.id, filters);
      
      if (error) throw error;
      
      const tasksWithMockData = (data || []).map(task => ({
        ...task,
        start_date: task.start_date || new Date().toISOString().split('T')[0],
        progress: task.progress || Math.floor(Math.random() * 100),
        comment_count: Math.floor(Math.random() * 5),
        attachment_count: Math.floor(Math.random() * 3),
      }));
      
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

  const loadUserProjectView = async () => {
    if (!selectedProject) return;
    
    try {
      const { data, error } = await dbService.getUserProjectView(selectedProject.id, session!.user.id);
      if (!error && data && data.length > 0) {
        setCurrentView(data[0].default_view as ViewType);
      }
    } catch (error) {
      console.error('Error loading user project view:', error);
    }
  };

  const handleCreateProject = async (projectData: { name: string; description?: string; color: string }) => {
    try {
      const { data, error } = await dbService.createProject({
        ...projectData,
        user_id: session!.user.id,
        status: 'active',
      });
      
      if (error) throw error;
      
      // Add the creator as a manager
      if (data && data[0]) {
        await dbService.addProjectMember(data[0].id, session!.user.id, 'manager');
      }
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      loadProjects();
      setShowCreateProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleEditProject = (project: Project) => {
    toast({
      title: 'Edit Project',
      description: `Edit modal for ${project.name} would open here`,
    });
  };

  const handleArchiveProject = async (project: Project) => {
    try {
      const { error } = await dbService.updateProject(project.id, { status: 'archived' });
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${project.name} has been archived`,
      });
      
      loadProjects();
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive project',
        variant: 'destructive',
      });
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleViewChange = async (view: ViewType) => {
    setCurrentView(view);
    
    // Save user preference
    if (selectedProject) {
      try {
        await dbService.updateUserProjectView(selectedProject.id, session!.user.id, {
          default_view: view,
        });
      } catch (error) {
        console.error('Error saving view preference:', error);
      }
    }
  };

  const handleTaskMove = (taskId: string, newStatus: string, newIndex: number) => {
    // Update task status in database
    toast({
      title: 'Task Moved',
      description: `Task moved to ${newStatus}`,
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleManageMembers = () => {
    setShowProjectMembers(true);
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
          onCreateProject={() => setShowCreateProject(true)}
          onEditProject={handleEditProject}
          onArchiveProject={handleArchiveProject}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
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
                  {selectedProject && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManageMembers}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Members
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ViewSelector currentView={currentView} onViewChange={handleViewChange} />
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
                  <Button onClick={() => setShowCreateProject(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onCreateProject={handleCreateProject}
      />

      {selectedProject && (
        <ProjectMembersDialog
          open={showProjectMembers}
          onOpenChange={setShowProjectMembers}
          project={selectedProject}
        />
      )}

      {selectedTask && (
        <TaskDetailDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </AppLayout>
  );
};

export default PlanBoard;
