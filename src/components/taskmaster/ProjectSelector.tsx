
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, Users, Calendar, Activity, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import CreateProjectDialog from './CreateProjectDialog';
import type { Project } from '@/types/taskmaster';

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
  selectedProject?: Project;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onProjectSelect, selectedProject }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching projects for user:', user.id);
      const { data, error } = await taskmasterService.getProjects(user.id);
      
      if (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Fetched projects:', data);
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Unexpected error fetching projects:', error);
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setCreateDialogOpen(false);
    console.log('Project created successfully:', project);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between p-6 modern-card rounded-2xl loading-shimmer">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-32 skeleton"></div>
            <div className="h-5 bg-gray-200 rounded w-64 skeleton"></div>
          </div>
          <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-container">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse modern-card loading-shimmer" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 skeleton"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full skeleton"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 modern-card rounded-2xl animate-fade-in-up">
        <div className="mx-auto max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto animate-bounce-soft">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-red-600">Error Loading Projects</h3>
          <p className="text-muted-foreground text-lg">{error}</p>
          <Button 
            onClick={fetchProjects}
            className="btn-primary px-6 py-3 text-base font-medium rounded-xl button-hover"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-page-enter">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 modern-card rounded-2xl animate-slide-in-down">
        <div className="space-y-2 animate-fade-in-right">
          <h3 className="text-2xl font-bold text-gradient">Projects</h3>
          <p className="text-muted-foreground text-lg">Select a project to manage boards and tasks</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="btn-primary px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 button-hover animate-fade-in-left"
        >
          <Folder className="h-5 w-5 mr-2 icon-bounce" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-container">
        {projects.map((project, index) => (
          <Card 
            key={project.id} 
            className={`cursor-pointer hover-lift modern-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group interactive-card ${
              selectedProject?.id === project.id ? 'ring-2 ring-primary shadow-primary/20 animate-glow' : ''
            }`}
            onClick={() => onProjectSelect(project)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 animate-fade-in-right">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110 duration-300">
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors text-shimmer">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700 badge-pulse">
                        {project.key}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'}
                  className={`text-xs animate-bounce-soft ${
                    project.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="animate-fade-in-up">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {project.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground stagger-container">
                <div className="flex items-center gap-1 hover-glow transition-all duration-300">
                  <Users className="h-3 w-3 icon-bounce" />
                  <span>Team project</span>
                </div>
                <div className="flex items-center gap-1 hover-glow transition-all duration-300">
                  <Activity className="h-3 w-3 icon-bounce" />
                  <span>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16 modern-card rounded-2xl animate-zoom-in">
          <div className="mx-auto max-w-md space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto animate-float">
              <Folder className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gradient animate-fade-in-up">No projects yet</h3>
            <p className="text-muted-foreground text-lg animate-fade-in-up">
              Create your first project to start organizing your work
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="btn-primary px-6 py-3 text-base font-medium rounded-xl button-hover animate-bounce-soft"
            >
              <Folder className="h-4 w-4 mr-2 icon-bounce" />
              Create First Project
            </Button>
          </div>
        </div>
      )}

      <CreateProjectDialog
        onProjectCreated={handleProjectCreated}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default ProjectSelector;
