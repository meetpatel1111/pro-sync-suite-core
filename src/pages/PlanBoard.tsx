import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import AppLayout from '@/components/AppLayout';
import ProjectSidebar from '@/components/planboard/ProjectSidebar';
import ProjectEditDialog from '@/components/planboard/ProjectEditDialog';
import CreateProjectDialog from '@/components/taskmaster/CreateProjectDialog';
import ViewSelector from '@/components/planboard/ViewSelector';
import FilterPanel from '@/components/planboard/FilterPanel';
import BoardView from '@/components/planboard/BoardView';
import TimelineView from '@/components/planboard/TimelineView';
import GanttChart from '@/components/GanttChart';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, FileText, Sparkles, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Project, Task } from '@/utils/dbtypes';

type ViewType = 'gantt' | 'timeline' | 'calendar' | 'board';

// Extend the database Project type to include required UI properties
interface UIProject extends Project {
  color: string;
  status: string;
  member_count?: number;
}

const PlanBoard = () => {
  const { session } = useAuthContext();
  const [projects, setProjects] = useState<UIProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<UIProject | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('gantt');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UIProject | null>(null);
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
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      const projectsWithDefaults: UIProject[] = (data || []).map(project => ({
        ...project,
        color: '#3b82f6',
        status: project.status || 'active',
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
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      // Map the database response to match our Task interface
      const tasksWithDefaults: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        start_date: task.start_date,
        due_date: task.due_date,
        assigned_to: task.assigned_to,
        project_id: task.project_id,
        created_by: task.created_by,
        parent_task_id: task.parent_task_id,
        reviewer_id: task.reviewer_id,
        recurrence_rule: task.recurrence_rule,
        visibility: task.visibility,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));
      
      console.log('Loaded tasks:', tasksWithDefaults);
      setTasks(tasksWithDefaults);
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
    setCreateProjectDialogOpen(true);
  };

  const handleProjectCreated = (project: any) => {
    // Convert the project to UIProject format
    const uiProject: UIProject = {
      ...project,
      color: '#3b82f6',
      status: project.status || 'active',
    };
    
    setProjects(prev => [uiProject, ...prev]);
    setSelectedProject(uiProject);
    setCreateProjectDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Project "${project.name}" created successfully`,
    });
  };

  const handleEditProject = (project: UIProject) => {
    setProjectToEdit(project);
    setEditDialogOpen(true);
  };

  const handleArchiveProject = async (project: UIProject) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', project.id);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, status: 'archived' } : p
      ));

      toast({
        title: 'Success',
        description: `Project "${project.name}" has been archived`,
      });
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive project',
        variant: 'destructive',
      });
    }
  };

  const handleSelectProject = (project: UIProject) => {
    setSelectedProject(project);
  };

  const handleProjectUpdated = () => {
    loadProjects();
  };

  const handleTaskMove = async (taskId: string, newStatus: string, newIndex: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          position: newIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: 'Success',
        description: `Task moved to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive',
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    // For now, just show task info - could be expanded to open a task detail modal
    toast({
      title: 'Task Selected',
      description: `Task: "${task.title}"`,
    });
  };

  const handleAddTask = () => {
    if (!selectedProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project first',
        variant: 'destructive',
      });
      return;
    }

    // This could open a create task dialog
    toast({
      title: 'Add Task',
      description: 'Task creation functionality to be implemented',
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
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">PlanBoard</h1>
            </div>
            <p className="text-sm text-amber-100 max-w-2xl mb-3 leading-relaxed">
              Project planning and Gantt charts for organized workflow management
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Target className="h-3 w-3 mr-1" />
                Project Planning
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Gantt Charts
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Timeline Views
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>

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
                  <Button size="sm" onClick={handleAddTask}>
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

        {/* Dialogs */}
        <CreateProjectDialog
          onProjectCreated={handleProjectCreated}
          open={createProjectDialogOpen}
          onOpenChange={setCreateProjectDialogOpen}
        />

        <ProjectEditDialog
          project={projectToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onProjectUpdated={handleProjectUpdated}
        />
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
