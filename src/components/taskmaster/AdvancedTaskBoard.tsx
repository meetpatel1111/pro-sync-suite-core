
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import type { Project, Board } from '@/types/taskmaster';

// Define types and interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  due_date?: string;
  project_id?: string;
  board_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
  story_points?: number;
  labels?: string[];
}

interface Column {
  id: string;
  name: string;
  color?: string;
}

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => Promise<void>;
  projectId?: string;
  boardId?: string;
  status?: string;
}

interface AdvancedTaskBoardProps {
  project: Project;
  board: Board;
}

const AdvancedTaskBoard: React.FC<AdvancedTaskBoardProps> = ({ project, board }) => {
  // State variables
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Get columns from board config with proper type handling
  const getColumns = (): Column[] => {
    if (!board?.config) {
      return [
        { id: 'todo', name: 'To Do', color: '#6b7280' },
        { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
        { id: 'review', name: 'Review', color: '#8b5cf6' },
        { id: 'done', name: 'Done', color: '#10b981' }
      ];
    }

    // Handle config as Json type
    const config = typeof board.config === 'string' 
      ? JSON.parse(board.config) 
      : board.config;

    if (config && typeof config === 'object' && 'columns' in config) {
      return config.columns as Column[];
    }

    return [
      { id: 'todo', name: 'To Do', color: '#6b7280' },
      { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
      { id: 'review', name: 'Review', color: '#8b5cf6' },
      { id: 'done', name: 'Done', color: '#10b981' }
    ];
  };

  const columns = getColumns();

  useEffect(() => {
    if (project && board) {
      loadTasks();
    }
  }, [project, board]);

  const loadTasks = async () => {
    if (!project || !board) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .eq('board_id', board.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = result.draggableId;
    const newStatus = destination.droppableId;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          position: destination.index 
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, position: destination.index }
          : task
      );
      setTasks(updatedTasks);

      toast({
        title: 'Success',
        description: 'Task moved successfully'
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          <p className="text-muted-foreground">Project: {project.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {columns.map(column => (
                <SelectItem key={column.id} value={column.id}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Board Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Card key={column.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: column.color }}
                  />
                  {column.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{columnTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {columnTasks.reduce((acc, task) => acc + (task.story_points || 0), 0)} points
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <Card key={column.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: column.color }}
                    />
                    {column.name}
                  </div>
                  <Badge variant="secondary">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <CardContent 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-3 min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {task.title}
                                  </h4>
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {task.story_points && (
                                      <Badge variant="outline" className="text-xs">
                                        {task.story_points} pts
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  
                                  {task.assignee_id && (
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {task.assignee_id.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                                
                                {task.due_date && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {task.labels && task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.labels.slice(0, 2).map((label, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {label}
                                      </Badge>
                                    ))}
                                    {task.labels.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{task.labels.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>
                )}
              </Droppable>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onTaskCreated={loadTasks}
        projectId={project?.id}
        boardId={board?.id}
      />
    </div>
  );
};

// Create Task Dialog Component
const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  boardId,
  status = 'todo'
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: status,
    story_points: '',
    due_date: '',
    labels: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) return;

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        project_id: projectId,
        board_id: boardId,
        created_by: user.id,
        story_points: formData.story_points ? parseInt(formData.story_points) : null,
        due_date: formData.due_date || null,
        labels: formData.labels ? formData.labels.split(',').map(l => l.trim()) : [],
        position: 0
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Task created successfully'
      });

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: status,
        story_points: '',
        due_date: '',
        labels: ''
      });
      
      onClose();
      await onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="story_points">Story Points</Label>
              <Input
                id="story_points"
                type="number"
                value={formData.story_points}
                onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels (comma-separated)</Label>
            <Input
              id="labels"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="frontend, urgent, bug"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedTaskBoard;
