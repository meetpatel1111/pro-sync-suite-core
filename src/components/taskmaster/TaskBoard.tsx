import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, AlertCircle, Clock, Flag } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import TaskDetailDialog from './TaskDetailDialog';
import CreateTaskDialog from './CreateTaskDialog';
import type { Project, Board, TaskMasterTask } from '@/types/taskmaster';

interface TaskBoardProps {
  project: Project;
  board: Board;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ project, board }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskMasterTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskMasterTask | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
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

  const handleTaskCreate = async (taskData: Partial<TaskMasterTask>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tasks',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating task with data:', taskData);
      
      const { data, error } = await taskmasterService.createTask({
        ...taskData,
        board_id: board.id,
        project_id: project.id,
        created_by: user.id,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        type: taskData.type || 'task',
        visibility: taskData.visibility || 'team',
        position: tasks.length,
        actual_hours: 0
      } as Omit<TaskMasterTask, 'id' | 'task_number' | 'task_key' | 'created_at' | 'updated_at'>);

      if (error) {
        console.error('Task creation error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        console.log('Task created successfully:', data);
        setTasks(prev => [...prev, data]);
        toast({
          title: 'Success',
          description: `Task ${data.task_key} created successfully`,
        });
      }
    } catch (error) {
      console.error('Unexpected error creating task:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the task',
        variant: 'destructive',
      });
    }
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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 shadow-red-500/30';
      case 'high': return 'bg-orange-500 shadow-orange-500/30';
      case 'medium': return 'bg-yellow-500 shadow-yellow-500/30';
      case 'low': return 'bg-green-500 shadow-green-500/30';
      default: return 'bg-gray-500 shadow-gray-500/30';
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse modern-card">
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                ))}
              </div>
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
          <h3 className="text-2xl font-bold text-gradient">{board.name}</h3>
          <p className="text-muted-foreground text-lg">
            Manage your tasks using {board.type.replace('_', ' ')} workflow
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          className="btn-primary px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.config.columns.map((column) => (
          <Card key={column.id} className="modern-card h-fit border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gradient">
                  {column.name}
                </CardTitle>
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 px-3 py-1 font-medium"
                >
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTasksByStatus(column.id).map((task) => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover-lift modern-card border-0 shadow-md hover:shadow-2xl transition-all duration-300 p-4 group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="space-y-3">
                    {/* Task Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(task.type)}</span>
                        <span className="text-xs font-mono text-muted-foreground bg-gray-100 px-2 py-1 rounded-md">
                          {task.task_key}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full shadow-lg ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    
                    {/* Task Title */}
                    <h4 className="text-sm font-semibold line-clamp-2 text-gray-800 group-hover:text-gray-900 transition-colors">
                      {task.title}
                    </h4>
                    
                    {/* Task Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {task.assignee_id && (
                        <div className="flex items-center gap-1 text-muted-foreground bg-blue-50 px-2 py-1 rounded-md">
                          <User className="h-3 w-3" />
                          <span>Assigned</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-muted-foreground bg-amber-50 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.estimate_hours && (
                        <div className="flex items-center gap-1 text-muted-foreground bg-emerald-50 px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimate_hours}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Add Task Button */}
              <Button 
                variant="ghost" 
                className="w-full border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 rounded-xl py-6 transition-all duration-200"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-16 modern-card rounded-2xl">
          <div className="mx-auto max-w-md space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gradient">No tasks yet</h3>
            <p className="text-muted-foreground text-lg">
              Create your first task to start organizing your work
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn-primary px-6 py-3 text-base font-medium rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreate={handleTaskCreate}
        project={project}
        board={board}
      />

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

export default TaskBoard;
