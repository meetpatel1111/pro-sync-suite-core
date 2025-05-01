import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/utils/dbtypes';
import { supabase } from '@/integrations/supabase/client';

interface QuickTaskCreateProps {
  projects: Project[];
  onTaskCreated?: (task: any) => void;
}

const QuickTaskCreate: React.FC<QuickTaskCreateProps> = ({ projects, onTaskCreated }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle) {
      setError('Task title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskTitle,
          status: 'todo',
          priority: taskPriority || 'medium',
          user_id: user?.id,
          project: selectedProject || null,
          due_date: dueDate ? dueDate.toISOString() : null
        })
        .select()
        .single();
      
      if (error) {
        setError(error.message || 'Failed to create task');
      } else if (data) {
        setTaskTitle('');
        setTaskPriority('medium');
        setSelectedProject('');
        setDueDate(null);
        toast({
          title: 'Task created',
          description: 'Your task has been created successfully'
        });
        
        if (onTaskCreated) {
          onTaskCreated(data);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateTask} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-1">
          <Label htmlFor="taskTitle">Task Title</Label>
          <Input
            type="text"
            id="taskTitle"
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
        </div>

        <div className="col-span-1 md:col-span-1">
          <Label htmlFor="taskPriority">Priority</Label>
          <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as 'low' | 'medium' | 'high')}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 md:col-span-1">
          <Label htmlFor="project">Project</Label>
          <Select value={selectedProject || ''} onValueChange={(value) => setSelectedProject(value === '' ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !dueDate && 'text-muted-foreground'
              )}
            >
              {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
    </form>
  );
};

export default QuickTaskCreate;
