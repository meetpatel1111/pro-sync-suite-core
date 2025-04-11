
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Clock, Calendar, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  project?: string;
  createdAt: string;
}

const initialData: Task[] = [
  {
    id: '1',
    title: 'Create project plan',
    description: 'Develop a comprehensive project plan for the new website redesign',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'user1',
    project: 'project1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Design homepage mockup',
    description: 'Create initial mockups for the homepage design',
    status: 'inProgress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'user2',
    project: 'project1',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Setup analytics',
    description: 'Implement Google Analytics tracking code',
    status: 'review',
    priority: 'low',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'user3',
    project: 'project1',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Launch website',
    description: 'Deploy website to production server',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'user1',
    project: 'project1',
    createdAt: new Date().toISOString()
  }
];

const TaskBoard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project: 'project1'
  });

  useEffect(() => {
    // Load tasks from localStorage or use initial data
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(initialData);
      localStorage.setItem('tasks', JSON.stringify(initialData));
    }
  }, []);

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast({
        title: "Title required",
        description: "Please provide a title for the task",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      status: newTask.status as 'todo' | 'inProgress' | 'review' | 'done',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      dueDate: newTask.dueDate,
      assignee: newTask.assignee,
      project: newTask.project,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project: 'project1'
    });
    
    setIsNewTaskDialogOpen(false);
    
    toast({
      title: "Task created",
      description: "Your new task has been created"
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editingTask.title) return;

    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    );
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setIsEditTaskDialogOpen(false);
    
    toast({
      title: "Task updated",
      description: "The task has been updated successfully"
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    toast({
      title: "Task deleted",
      description: "The task has been removed"
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: 'todo' | 'inProgress' | 'review' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusColumnTasks = (status: 'todo' | 'inProgress' | 'review' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const assigneeMap: Record<string, string> = {
    'user1': 'Alex Johnson',
    'user2': 'Jamie Smith',
    'user3': 'Taylor Lee',
    'user4': 'Morgan Chen'
  };

  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration'
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div
      className="mb-3 rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium mb-1">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => {
                setEditingTask(task);
                setIsEditTaskDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1">
          <span className={`inline-block h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
          <span className="capitalize">{task.priority}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
      
      {task.assignee && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Assigned to: {assigneeMap[task.assignee] || task.assignee}</span>
        </div>
      )}
    </div>
  );

  const StatusColumn = ({ title, status, icon: Icon }: { title: string; status: 'todo' | 'inProgress' | 'review' | 'done'; icon: any }) => (
    <div className="w-full min-w-[250px]">
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center">
            <Icon className="mr-2 h-4 w-4" />
            {title} ({getStatusColumnTasks(status).length})
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="px-3 py-2 min-h-[300px]" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          {getStatusColumnTasks(status).map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add details for your new task below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) => setNewTask({ ...newTask, status: value as any })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inProgress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? formatDate(newTask.dueDate) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {/* Calendar component would go here but for simplicity, we're using a date input */}
                      <input
                        type="date"
                        className="w-full p-2"
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select
                    value={newTask.assignee}
                    onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                  >
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">Alex Johnson</SelectItem>
                      <SelectItem value="user2">Jamie Smith</SelectItem>
                      <SelectItem value="user3">Taylor Lee</SelectItem>
                      <SelectItem value="user4">Morgan Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={newTask.project}
                  onValueChange={(value) => setNewTask({ ...newTask, project: value })}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Website Redesign</SelectItem>
                    <SelectItem value="project2">Mobile App</SelectItem>
                    <SelectItem value="project3">Marketing Campaign</SelectItem>
                    <SelectItem value="project4">Database Migration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        <StatusColumn title="To Do" status="todo" icon={ListTodo} />
        <StatusColumn title="In Progress" status="inProgress" icon={Clock} />
        <StatusColumn title="Review" status="review" icon={Edit} />
        <StatusColumn title="Done" status="done" icon={Calendar} />
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update your task details below.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Task description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value as any })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inProgress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as any })}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {editingTask.dueDate ? formatDate(editingTask.dueDate) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <input
                        type="date"
                        className="w-full p-2"
                        defaultValue={editingTask.dueDate ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd') : ''}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-assignee">Assignee</Label>
                  <Select
                    value={editingTask.assignee}
                    onValueChange={(value) => setEditingTask({ ...editingTask, assignee: value })}
                  >
                    <SelectTrigger id="edit-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">Alex Johnson</SelectItem>
                      <SelectItem value="user2">Jamie Smith</SelectItem>
                      <SelectItem value="user3">Taylor Lee</SelectItem>
                      <SelectItem value="user4">Morgan Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-project">Project</Label>
                <Select
                  value={editingTask.project}
                  onValueChange={(value) => setEditingTask({ ...editingTask, project: value })}
                >
                  <SelectTrigger id="edit-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Website Redesign</SelectItem>
                    <SelectItem value="project2">Mobile App</SelectItem>
                    <SelectItem value="project3">Marketing Campaign</SelectItem>
                    <SelectItem value="project4">Database Migration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
