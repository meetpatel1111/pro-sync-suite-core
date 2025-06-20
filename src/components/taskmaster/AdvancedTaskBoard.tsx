
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, User, Calendar, Clock, Flag, CheckSquare, Filter, Settings, 
  MoreHorizontal, Search, Layout, Eye, Users, Target, Zap
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import TaskDetailDialog from './TaskDetailDialog';
import CreateTaskDialog from './CreateTaskDialog';
import type { Project, Board, TaskMasterTask, Sprint } from '@/types/taskmaster';

interface AdvancedTaskBoardProps {
  project: Project;
  board: Board;
}

const AdvancedTaskBoard: React.FC<AdvancedTaskBoardProps> = ({ project, board }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<TaskMasterTask[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskMasterTask | undefined>();
  
  // View and filter state
  const [viewType, setViewType] = useState<'board' | 'backlog' | 'sprint'>('board');
  const [swimlaneType, setSwimlaneType] = useState<'none' | 'assignee' | 'priority' | 'epic'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // Board configuration
  const [wipLimits, setWipLimits] = useState<Record<string, number>>(board.wip_limits || {});
  const [boardColumns, setBoardColumns] = useState(board.config.columns);

  useEffect(() => {
    fetchTasks();
    if (board.type === 'scrum') {
      fetchSprints();
    }
  }, [board.id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await taskmasterService.getTasks(board.id);
      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive',
        });
        return;
      }
      setTasks((data || []) as TaskMasterTask[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      // This will be implemented when we add sprint service methods
      console.log('Fetching sprints for board:', board.id);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task || !user) return;

    // Update task status if moved between columns
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId;
      await handleTaskUpdate(task.id, { status: newStatus });
    }

    // Update task position
    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);
    
    setTasks(newTasks);
  }, [tasks, user]);

  const handleTaskCreated = (task: TaskMasterTask) => {
    setTasks(prev => [...prev, task]);
    fetchTasks(); // Refresh to get the latest data
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<TaskMasterTask>) => {
    if (!user) return;

    try {
      const { data, error } = await taskmasterService.updateTask(taskId, updates, user.id);
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update task',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setTasks(prev => prev.map(task => task.id === taskId ? data : task));
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(task => {
          switch (key) {
            case 'assignee':
              return task.assignee_id === value;
            case 'priority':
              return task.priority === value;
            case 'type':
              return task.type === value;
            case 'sprint':
              return task.sprint_id === value;
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  };

  const getTasksByStatus = (status: string) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  const getSwimlaneGroups = () => {
    const filtered = getFilteredTasks();
    if (swimlaneType === 'none') return { 'All Tasks': filtered };

    const groups: Record<string, TaskMasterTask[]> = {};
    
    filtered.forEach(task => {
      let groupKey = 'Unassigned';
      
      switch (swimlaneType) {
        case 'assignee':
          groupKey = task.assignee_id || 'Unassigned';
          break;
        case 'priority':
          groupKey = task.priority || 'No Priority';
          break;
        case 'epic':
          groupKey = task.epic_id || 'No Epic';
          break;
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
    });

    return groups;
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'story': return '📖';
      case 'epic': return '🚀';
      default: return '✓';
    }
  };

  const renderTaskCard = (task: TaskMasterTask, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${
            snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 animate-pulse-soft' : ''
          } ${
            selectedTasks.has(task.id) ? 'ring-2 ring-primary animate-glow' : ''
          } interactive-card`}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              const newSelected = new Set(selectedTasks);
              if (newSelected.has(task.id)) {
                newSelected.delete(task.id);
              } else {
                newSelected.add(task.id);
              }
              setSelectedTasks(newSelected);
            } else {
              setSelectedTask(task);
            }
          }}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Task Header */}
              <div className="flex items-center justify-between animate-fade-in-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm animate-bounce-soft">{getTypeIcon(task.type)}</span>
                  <Badge variant="outline" className="text-xs badge-pulse">
                    {task.task_key}
                  </Badge>
                </div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-150 ${getPriorityColor(task.priority)}`} />
              </div>
              
              {/* Task Title */}
              <h4 className="text-sm font-medium line-clamp-2 animate-fade-in text-shimmer">
                {task.title}
              </h4>
              
              {/* Task Meta */}
              <div className="flex flex-wrap gap-2 text-xs stagger-container">
                {task.assignee_id && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 animate-scale-in hover:scale-110 transition-transform">
                    <User className="h-3 w-3 mr-1 icon-bounce" />
                    Assigned
                  </Badge>
                )}
                {task.due_date && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 animate-scale-in hover:scale-110 transition-transform">
                    <Calendar className="h-3 w-3 mr-1 icon-bounce" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </Badge>
                )}
                {task.story_points && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 animate-scale-in hover:scale-110 transition-transform">
                    <Target className="h-3 w-3 mr-1 icon-bounce" />
                    {task.story_points} SP
                  </Badge>
                )}
                {task.labels && task.labels.length > 0 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 animate-scale-in hover:scale-110 transition-transform">
                    {task.labels[0]}
                  </Badge>
                )}
              </div>

              {/* Task Indicators */}
              <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in-up">
                <div className="flex items-center gap-2">
                  {task.watchers && task.watchers.length > 0 && (
                    <span className="flex items-center gap-1 hover:scale-110 transition-transform">
                      <Eye className="h-3 w-3 icon-bounce" />
                      {task.watchers.length}
                    </span>
                  )}
                  {task.blocked_by && task.blocked_by.length > 0 && (
                    <span className="text-red-500 animate-shake">🚫</span>
                  )}
                </div>
                {task.estimate_hours && (
                  <span className="flex items-center gap-1 hover:scale-110 transition-transform">
                    <Clock className="h-3 w-3 icon-bounce" />
                    {task.estimate_hours}h
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const renderColumn = (column: any, tasks: TaskMasterTask[]) => {
    const wipLimit = wipLimits[column.id];
    const isOverLimit = wipLimit && tasks.length > wipLimit;

    return (
      <div key={column.id} className="flex-1 min-w-80 animate-fade-in-up" style={{ animationDelay: `${column.order * 0.1}s` }}>
        <Card className="h-full interactive-card hover:shadow-2xl transition-all duration-500 morphing-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 animate-slide-in-right">
                {column.name}
                <Badge 
                  variant={isOverLimit ? "destructive" : "secondary"}
                  className={`ml-2 transition-all duration-300 ${
                    isOverLimit ? 'animate-shake badge-pulse' : 'hover:scale-110'
                  }`}
                >
                  {tasks.length}
                  {wipLimit && ` / ${wipLimit}`}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="button-hover">
                <MoreHorizontal className="h-4 w-4 icon-bounce" />
              </Button>
            </div>
            {isOverLimit && (
              <div className="text-sm text-destructive animate-wiggle">
                WIP limit exceeded!
              </div>
            )}
          </CardHeader>
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <CardContent
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-96 pb-4 transition-all duration-300 ${
                  snapshot.isDraggingOver ? 'bg-primary/5 scale-[1.02] animate-glow' : ''
                }`}
              >
                <div className="stagger-container">
                  {tasks.map((task, index) => renderTaskCard(task, index))}
                </div>
                {provided.placeholder}
                <CreateTaskDialog
                  boardId={board.id}
                  projectId={project.id}
                  onTaskCreated={handleTaskCreated}
                  defaultStatus={column.id}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full border-2 border-dashed border-gray-300 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg button-hover"
                  >
                    <Plus className="h-4 w-4 mr-2 icon-bounce" />
                    Add task
                  </Button>
                </CreateTaskDialog>
              </CardContent>
            )}
          </Droppable>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-container">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse animate-fade-in loading-shimmer">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-2/3 skeleton" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded skeleton" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Board Header */}
      <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border glass-morphism animate-slide-in-down">
        <div className="flex items-center gap-4">
          <div className="animate-fade-in-right">
            <h2 className="text-2xl font-bold text-shimmer">{board.name}</h2>
            <p className="text-muted-foreground animate-fade-in-up">
              {board.type.charAt(0).toUpperCase() + board.type.slice(1)} Board
            </p>
          </div>
          {board.type === 'scrum' && activeSprint && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 animate-bounce-soft pulse-ring">
              Sprint: {activeSprint.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 animate-fade-in-left stagger-container">
          <CreateTaskDialog
            boardId={board.id}
            projectId={project.id}
            onTaskCreated={handleTaskCreated}
          >
            <Button variant="outline" size="sm" className="button-hover">
              <Plus className="h-4 w-4 mr-2 icon-bounce" />
              Create
            </Button>
          </CreateTaskDialog>
          <Button variant="outline" size="sm" className="button-hover">
            <Settings className="h-4 w-4 icon-bounce" />
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg glass-morphism animate-slide-in-up">
        <div className="flex items-center gap-2 animate-scale-in">
          <Search className="h-4 w-4 icon-bounce" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 input-focus"
          />
        </div>
        
        <Select value={swimlaneType} onValueChange={(value: any) => setSwimlaneType(value)}>
          <SelectTrigger className="w-48 input-focus dropdown-enter">
            <Layout className="h-4 w-4 mr-2 icon-bounce" />
            <SelectValue placeholder="Swimlanes" />
          </SelectTrigger>
          <SelectContent className="dropdown-enter bg-white/95 backdrop-blur-md z-50">
            <SelectItem value="none">No Swimlanes</SelectItem>
            <SelectItem value="assignee">By Assignee</SelectItem>
            <SelectItem value="priority">By Priority</SelectItem>
            <SelectItem value="epic">By Epic</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.priority || 'all'} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger className="w-40 input-focus dropdown-enter">
            <Flag className="h-4 w-4 mr-2 icon-bounce" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="dropdown-enter bg-white/95 backdrop-blur-md z-50">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.type || 'all'} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="w-40 input-focus dropdown-enter">
            <CheckSquare className="h-4 w-4 mr-2 icon-bounce" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="dropdown-enter bg-white/95 backdrop-blur-md z-50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
          </SelectContent>
        </Select>

        {selectedTasks.size > 0 && (
          <Badge variant="secondary" className="ml-auto animate-tada badge-pulse">
            {selectedTasks.size} selected
          </Badge>
        )}
      </div>

      {/* Board Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {Object.entries(getSwimlaneGroups()).map(([groupName, groupTasks], groupIndex) => (
            <div key={groupName} className="space-y-4 animate-fade-in-up" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
              {swimlaneType !== 'none' && (
                <div className="flex items-center gap-2 px-4 animate-slide-in-right">
                  <h3 className="font-semibold text-lg text-gradient">{groupName}</h3>
                  <Badge variant="outline" className="badge-pulse">{groupTasks.length} tasks</Badge>
                </div>
              )}
              
              <div className="flex gap-6 overflow-x-auto pb-4">
                {boardColumns.map(column => 
                  renderColumn(
                    column, 
                    groupTasks.filter(task => task.status === column.id)
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {getFilteredTasks().length === 0 && (
        <div className="text-center py-16 animate-zoom-in">
          <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
          <h3 className="text-xl font-semibold mb-2 animate-fade-in-up">No tasks found</h3>
          <p className="text-muted-foreground mb-4 animate-fade-in-up">
            {searchQuery || Object.values(filters).some(v => v && v !== 'all')
              ? 'Try adjusting your filters or search terms'
              : 'Create your first task to get started'
            }
          </p>
          <CreateTaskDialog
            boardId={board.id}
            projectId={project.id}
            onTaskCreated={handleTaskCreated}
          >
            <Button className="animate-bounce-soft button-hover">
              <Plus className="h-4 w-4 mr-2 icon-bounce" />
              Create Task
            </Button>
          </CreateTaskDialog>
        </div>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(undefined)}
        onTaskUpdate={handleTaskUpdate}
        project={project}
        board={board}
      />
    </div>
  );
};

export default AdvancedTaskBoard;
