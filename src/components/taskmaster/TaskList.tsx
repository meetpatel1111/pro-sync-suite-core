import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Filter, ArrowUpDown, MoreHorizontal, Check, Clock, ArrowRight, 
  CheckCircle, User, CalendarDays, BarChart2, PencilIcon, Trash2Icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TaskIntegrations from './TaskIntegrations';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: string;
  project?: string;
  createdAt: string;
  user_id?: string;
}

interface TaskListProps {
  view?: 'kanban' | 'list' | 'calendar' | 'gantt';
  onViewChange?: (view: 'kanban' | 'list' | 'calendar' | 'gantt') => void;
  filter?: string;
}

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(['todo', 'inProgress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assignee: z.string().optional(),
  project: z.string().optional(),
});

// Define TaskListItem component
const TaskListItem = ({ task, onEdit, onDelete }: { 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) => {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-orange-100 text-orange-800",
    high: "bg-red-100 text-red-800",
  };

  const statusIcons = {
    todo: <Clock className="h-4 w-4" />,
    inProgress: <ArrowRight className="h-4 w-4" />,
    review: <CheckCircle className="h-4 w-4 text-orange-500" />,
    done: <CheckCircle className="h-4 w-4 text-green-500" />,
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {statusIcons[task.status]}
        </div>
        <div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {task.assignee && (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{task.assignee}</span>
          </div>
        )}
        {task.project && (
          <div className="hidden md:flex items-center">
            <BarChart2 className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{task.project}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}
        <Badge className={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)} 
              className="text-red-600"
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const TaskList = ({ view = 'list', onViewChange, filter }: TaskListProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    },
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedTasks = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: mapStatusValue(task.status),
        priority: task.priority as TaskPriority,
        dueDate: task.due_date,
        assignee: task.assignee,
        project: task.project,
        createdAt: task.created_at,
        user_id: task.user_id
      }));
      
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error fetching tasks',
        description: 'There was a problem fetching your tasks.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mapStatusValue = (status: string): TaskStatus => {
    switch(status) {
      case 'inProgress': return 'inProgress';
      case 'review': return 'review';
      case 'done': return 'done';
      default: return 'todo';
    }
  };

  const openTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      form.reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        assignee: task.assignee,
        project: task.project,
      });
    } else {
      setEditingTask(null);
      form.reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    try {
      const formattedValues = {
        ...values,
        due_date: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : null,
      };
      
      const { dueDate, ...dataToSubmit } = formattedValues;
      
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(dataToSubmit)
          .eq('id', editingTask.id);
          
        if (error) throw error;
        
        toast({
          title: 'Task updated',
          description: 'Your task has been updated successfully.'
        });
        
        setTasks(tasks.map(task => 
          task.id === editingTask.id 
            ? { 
                ...task, 
                ...values, 
                dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : undefined 
              } 
            : task
        ));
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert(dataToSubmit)
          .select('*')
          .single();
          
        if (error) throw error;
        
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: mapStatusValue(data.status),
          priority: data.priority as TaskPriority,
          dueDate: data.due_date,
          assignee: data.assignee,
          project: data.project,
          createdAt: data.created_at,
          user_id: data.user_id
        };
        
        setTasks([newTask, ...tasks]);
        
        toast({
          title: 'Task added',
          description: 'Your task has been added successfully.'
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding/updating task:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your task.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting your task.',
        variant: 'destructive'
      });
    }
  };

  const createTask = async () => {
    if (!newTaskTitle) return;
    
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          description: newTaskDescription,
          status: 'todo',
          priority: newTaskPriority || 'medium',
          due_date: newTaskDueDate,
          assignee: newTaskAssignee,
          project: newTaskProject,
          user_id: user.id
        });
      
      if (error) throw error;
      
      toast({
        title: 'Task created',
        description: 'Your new task has been created successfully.'
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskAssignee('');
      setNewTaskProject('');
      fetchTasks();
    } catch (error: any) {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
      setIsAddingTask(false);
    }
  };

  const openTaskIntegrations = (task: Task) => {
    setCurrentTask(task);
    setShowIntegrations(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex">
          {onViewChange && (
            <div className="bg-background border rounded-md flex mr-2">
              <Button 
                variant={view === 'list' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange('list')}
              >
                List
              </Button>
              <Button 
                variant={view === 'kanban' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange('kanban')}
              >
                Kanban
              </Button>
              <Button 
                variant={view === 'calendar' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange('calendar')}
              >
                Calendar
              </Button>
              <Button 
                variant={view === 'gantt' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange('gantt')}
              >
                Gantt
              </Button>
            </div>
          )}
          <div className="relative w-64">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter tasks..." className="pl-8" />
          </div>
        </div>
        <Button onClick={() => openTaskDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <h3 className="font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first task</p>
          <Button onClick={() => openTaskDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          {tasks.map(task => (
            <TaskListItem 
              key={task.id} 
              task={task} 
              onEdit={openTaskDialog}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update task details' : 'Fill in the details for your new task'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Task description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <FormControl>
                        <Input placeholder="Assignee name" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                {editingTask && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      openTaskIntegrations(editingTask);
                    }}
                    className="mr-auto"
                  >
                    Manage Integrations
                  </Button>
                )}
                <Button type="submit">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Task Integrations dialog */}
      <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Integrations</DialogTitle>
            <DialogDescription>
              Manage integrations for this task across ProSync Suite
            </DialogDescription>
          </DialogHeader>
          {currentTask && <TaskIntegrations task={currentTask} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
