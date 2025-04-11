
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, ArrowUpDown, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const TaskList = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        // Ensure status is one of the allowed values
        const validTasks = parsedTasks.map((task: any) => ({
          ...task,
          status: validateStatus(task.status),
          priority: validatePriority(task.priority)
        }));
        setTasks(validTasks as Task[]);
      } catch (error) {
        console.error("Error parsing tasks:", error);
        setTasks([]);
      }
    }
  }, []);

  // Helper function to validate status
  const validateStatus = (status: string): 'todo' | 'inProgress' | 'review' | 'done' => {
    const validStatuses = ['todo', 'inProgress', 'review', 'done'];
    return validStatuses.includes(status) ? status as 'todo' | 'inProgress' | 'review' | 'done' : 'todo';
  };

  // Helper function to validate priority
  const validatePriority = (priority: string): 'low' | 'medium' | 'high' => {
    const validPriorities = ['low', 'medium', 'high'];
    return validPriorities.includes(priority) ? priority as 'low' | 'medium' | 'high' : 'medium';
  };

  useEffect(() => {
    // Apply filters and search
    let result = [...tasks];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(task => task.status === filterStatus);
    }
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(task => task.priority === filterPriority);
    }
    
    // Apply project filter
    if (filterProject !== 'all') {
      result = result.filter(task => task.project === filterProject);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          compareB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'dueDate':
          compareA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          compareB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'status':
          const statusOrder = { todo: 1, inProgress: 2, review: 3, done: 4 };
          compareA = statusOrder[a.status as keyof typeof statusOrder];
          compareB = statusOrder[b.status as keyof typeof statusOrder];
          break;
        default:
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
      }
      
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, filterStatus, filterPriority, filterProject, sortBy, sortOrder]);

  const handleToggleStatus = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    toast({
      title: "Task updated",
      description: "Task status has been updated"
    });
  };

  const handleEditTask = () => {
    if (!editingTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    );
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setIsEditDialogOpen(false);
    
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully"
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'inProgress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const getPriorityBadge = (priority: string) => {
    let bgColor, textColor;
    
    switch (priority) {
      case 'high':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'medium':
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-800';
        break;
      case 'low':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-800';
    }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bgColor} ${textColor} capitalize`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'todo':
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-800';
        break;
      case 'inProgress':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'review':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'done':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-800';
    }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
        {getStatusText(status)}
      </span>
    );
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Task List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="w-full md:w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {Object.entries(projectMap).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort by
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>
                    Title (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }}>
                    Title (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('dueDate'); setSortOrder('asc'); }}>
                    Due Date (Earliest)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('dueDate'); setSortOrder('desc'); }}>
                    Due Date (Latest)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('priority'); setSortOrder('desc'); }}>
                    Priority (Highest)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('priority'); setSortOrder('asc'); }}>
                    Priority (Lowest)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('status'); setSortOrder('asc'); }}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground w-10">
                        <span className="sr-only">Complete</span>
                      </th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Task</th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Project</th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Priority</th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Due Date</th>
                      <th className="h-10 px-2 text-left text-xs font-medium text-muted-foreground">Assignee</th>
                      <th className="h-10 px-2 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-muted-foreground">
                          No tasks found that match your filters
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="border-b">
                          <td className="p-2 align-middle">
                            <Checkbox
                              checked={task.status === 'done'}
                              onCheckedChange={() => handleToggleStatus(task.id)}
                            />
                          </td>
                          <td className="p-2 align-middle font-medium">
                            {task.title}
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </td>
                          <td className="p-2 align-middle text-sm">
                            {projectMap[task.project || ''] || '-'}
                          </td>
                          <td className="p-2 align-middle">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="p-2 align-middle">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="p-2 align-middle text-sm">
                            {task.dueDate ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatDate(task.dueDate)}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-2 align-middle text-sm">
                            {task.assignee ? assigneeMap[task.assignee] || task.assignee : '-'}
                          </td>
                          <td className="p-2 align-middle text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <textarea
                  id="edit-description"
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value as any })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
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
                  <label htmlFor="edit-priority" className="text-sm font-medium">Priority</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as any })}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
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
                  <label htmlFor="edit-duedate" className="text-sm font-medium">Due Date</label>
                  <input
                    id="edit-duedate"
                    type="date"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={editingTask.dueDate ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-assignee" className="text-sm font-medium">Assignee</label>
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
                <label htmlFor="edit-project" className="text-sm font-medium">Project</label>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
