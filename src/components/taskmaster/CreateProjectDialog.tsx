
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskmasterService } from '@/services/taskmasterService';
import { useAuthContext } from '@/context/AuthContext';
import type { Project } from '@/types/taskmaster';

interface CreateProjectDialogProps {
  onProjectCreated: (project: Project) => void;
  children?: React.ReactNode;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  onProjectCreated,
  children
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });

  const generateProjectKey = (name: string) => {
    // Generate a project key from the name
    const cleaned = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 3);
    } else if (cleaned.length > 0) {
      return cleaned.padEnd(3, 'X');
    } else {
      return 'PRJ';
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: generateProjectKey(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create projects',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.key.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project key is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        name: formData.name.trim(),
        key: formData.key.trim().toUpperCase(),
        description: formData.description.trim(),
        status: 'active' as const,
        created_by: user.id,
        user_id: user.id
      };

      console.log('Creating project with data:', projectData);

      const { data: project, error } = await taskmasterService.createProject(projectData);

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: 'Creation Failed',
          description: error.message || 'Failed to create project. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (project) {
        onProjectCreated(project);
        setOpen(false);
        setFormData({
          name: '',
          key: '',
          description: '',
        });
        
        toast({
          title: 'Project Created',
          description: `Project "${project.name}" has been created successfully`,
        });
      }
    } catch (error) {
      console.error('Unexpected error creating project:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while creating the project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="animate-fade-in-up button-hover">
            <Plus className="h-4 w-4 mr-2 icon-bounce" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-gradient">Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter project name"
              required
              disabled={loading}
              className="input-focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Project Key *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
              placeholder="PRJ"
              required
              disabled={loading}
              className="input-focus"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              A short identifier for your project (e.g., TSK, BUG, DEV)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
              rows={3}
              disabled={loading}
              className="input-focus"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="button-hover"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="button-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
