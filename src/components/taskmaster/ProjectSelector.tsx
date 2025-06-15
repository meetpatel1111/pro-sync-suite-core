import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Folder, Users, Calendar, Activity } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
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

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await taskmasterService.getProjects(user.id);
      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
        return;
      }
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) return;

    const projectName = prompt('Enter project name:');
    const projectKey = prompt('Enter project key (e.g., TSK, BUG):');
    
    if (!projectName || !projectKey) return;

    try {
      const { data, error } = await taskmasterService.createProject({
        name: projectName,
        key: projectKey.toUpperCase(),
        description: '',
        status: 'active',
        created_by: user.id,
        user_id: user.id
      } as Omit<Project, 'id' | 'created_at' | 'updated_at'>);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create project',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setProjects(prev => [data, ...prev]);
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse modern-card">
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between p-6 modern-card rounded-2xl">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gradient">Projects</h3>
          <p className="text-muted-foreground text-lg">Select a project to manage boards and tasks</p>
        </div>
        <Button 
          onClick={handleCreateProject} 
          className="btn-primary px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`cursor-pointer hover-lift modern-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group ${
              selectedProject?.id === project.id ? 'ring-2 ring-primary shadow-primary/20' : ''
            }`}
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                        {project.key}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'}
                  className={`text-xs ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {project.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Team project</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16 modern-card rounded-2xl">
          <div className="mx-auto max-w-md space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Folder className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gradient">No projects yet</h3>
            <p className="text-muted-foreground text-lg">
              Create your first project to start organizing your work
            </p>
            <Button 
              onClick={handleCreateProject}
              className="btn-primary px-6 py-3 text-base font-medium rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
