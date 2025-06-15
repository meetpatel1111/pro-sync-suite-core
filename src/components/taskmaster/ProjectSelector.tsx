import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Folder, Users } from 'lucide-react';
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
      setProjects(data || []);
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
      });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Projects</h3>
          <p className="text-muted-foreground">Select a project to manage boards and tasks</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{project.key}</Badge>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Team project</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start organizing your work
            </p>
            <Button onClick={handleCreateProject}>
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
