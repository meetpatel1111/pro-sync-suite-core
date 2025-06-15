import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, AlertCircle } from 'lucide-react';
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
    if (!user) return;

    try {
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
        toast({
          title: 'Error',
          description: 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setTasks(prev => [...prev, data]);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
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
          <h3 className="text-xl font-semibold">{board.name}</h3>
          <p className="text-muted-foreground">Manage your tasks using {board.type} workflow</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.config.columns.map((column) => (
          <Card key={column.id} className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{column.name}</CardTitle>
                <Badge variant="secondary">{getTasksByStatus(column.id).length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-sm transition-shadow p-3"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{getTypeIcon(task.type)}</span>
                      <span className="text-xs text-muted-foreground">{task.task_key}</span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
                    {task.assignee_id && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Assigned</span>
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.estimate_hours && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>{task.estimate_hours}h</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full border-dashed border-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task to start organizing your work
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        </div>
      )}

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
