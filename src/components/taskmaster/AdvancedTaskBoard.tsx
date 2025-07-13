import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Clock, AlertCircle, User, Calendar, Flag,
  MessageSquare, Paperclip, Eye, MoreVertical, Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Project, Board } from '@/types/taskmaster';
import CreateTaskDialog from './CreateTaskDialog';
import TaskDetailDialog from './TaskDetailDialog';

interface AdvancedTaskBoardProps {
  project: Project;
  board: Board;
}

interface Column {
  id: string;
  name: string;
  color?: string;
  wipLimit?: number;
  tasks: any[];
}

const AdvancedTaskBoard: React.FC<AdvancedTaskBoardProps> = ({ project, board }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  useEffect(() => {
    if (user && board) {
      loadBoardData();
      subscribeToTasks();
    }
  }, [user, board]);

  const loadBoardData = async () => {
    setIsLoading(true);
    try {
      // Load tasks for this board
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('board_id', board.id)
        .order('position', { ascending: true });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
      
      // Initialize columns based on board config
      const boardColumns = board.config?.columns || [
        { id: 'todo', name: 'To Do', color: '#6b7280' },
        { id: 'in_progress', name: 'In Progress', color: '#3b82f6' },
        { id: 'review', name: 'Review', color: '#f59e0b' },
        { id: 'done', name: 'Done', color: '#10b981' }
      ];

      const columnsWithTasks = boardColumns.map(col => ({
        ...col,
        tasks: (tasksData || []).filter(task => task.status === col.id)
      }));

      setColumns(columnsWithTasks);
    } catch (error) {
      console.error('Error loading board data:', error);
      toast({
        title: "Failed to load board",
        description: "An error occurred while loading the board data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToTasks = () => {
    const channel = supabase
      .channel('board-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `board_id=eq.${board.id}`
        },
        () => {
          loadBoardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Same position, no change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const draggedTask = sourceColumn.tasks[source.index];

    try {
      // Update task status and position
      const { error } = await supabase
        .from('tasks')
        .update({
          status: destination.droppableId,
          position: destination.index,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', draggableId);

      if (error) throw error;

      // Optimistic update
      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          const newTasks = [...col.tasks];
          newTasks.splice(source.index, 1);
          return { ...col, tasks: newTasks };
        }
        if (col.id === destination.droppableId) {
          const newTasks = [...col.tasks];
          newTasks.splice(destination.index, 0, {
            ...draggedTask,
            status: destination.droppableId
          });
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      setColumns(newColumns);

      toast({
        title: "Task moved",
        description: `Task moved to ${destColumn.name}`,
      });
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: "Failed to move task",
        description: "An error occurred while moving the task",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setCreateTaskDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <Flag className="h-3 w-3" />;
      default: return null;
    }
  };

  const getFilteredTasks = (columnTasks: any[]) => {
    return columnTasks.filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const assigneeMatch = filterAssignee === 'all' || 
        (task.assigned_to && task.assigned_to.includes(filterAssignee));
      return statusMatch && assigneeMatch;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{board.name}</h2>
          <p className="text-muted-foreground">{board.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Board Stats */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <Card key={column.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{column.name}</h3>
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
              {column.wipLimit && (
                <Progress 
                  value={(column.tasks.length / column.wipLimit) * 100} 
                  className="h-1 mt-2"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-medium">{column.name}</h3>
                  <Badge variant="secondary">{getFilteredTasks(column.tasks).length}</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCreateTask(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {getFilteredTasks(column.tasks).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                            }`}
                            onClick={() => setSelectedTask(task)}
                          >
                            <CardContent className="p-4 space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {task.title}
                                </h4>
                                {getPriorityIcon(task.priority) && (
                                  <div className={getPriorityColor(task.priority)}>
                                    {getPriorityIcon(task.priority)}
                                  </div>
                                )}
                              </div>

                              {/* Task Details */}
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Labels */}
                              {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {task.labels.slice(0, 2).map((label, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                      {label}
                                    </Badge>
                                  ))}
                                  {task.labels.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      +{task.labels.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Progress */}
                              {task.story_points && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{Math.round((task.actual_hours || 0) / (task.estimate_hours || 1) * 100)}%</span>
                                  </div>
                                  <Progress 
                                    value={Math.min((task.actual_hours || 0) / (task.estimate_hours || 1) * 100, 100)} 
                                    className="h-1"
                                  />
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {/* Assignee */}
                                  {task.assigned_to && task.assigned_to.length > 0 && (
                                    <div className="flex -space-x-1">
                                      {task.assigned_to.slice(0, 2).map((_, idx) => (
                                        <Avatar key={idx} className="w-5 h-5 border-2 border-background">
                                          <AvatarFallback className="text-xs">
                                            {String.fromCharCode(65 + idx)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {task.assigned_to.length > 2 && (
                                        <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                          <span className="text-xs">+{task.assigned_to.length - 2}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Due Date */}
                                  {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {/* Comments */}
                                  <MessageSquare className="h-3 w-3" />
                                  <span>0</span>
                                  
                                  {/* Attachments */}
                                  <Paperclip className="h-3 w-3 ml-1" />
                                  <span>0</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Dialogs */}
      <CreateTaskDialog
        project={project}
        board={board}
        onTaskCreated={loadBoardData}
      />

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          project={project}
          board={board}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdate={loadBoardData}
        />
      )}
    </div>
  );
};

export default AdvancedTaskBoard;