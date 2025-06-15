
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Settings, Calendar, Target, BarChart3, 
  Kanban, List, Timer, Users
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import AdvancedTaskBoard from './AdvancedTaskBoard';
import SprintManagement from './SprintManagement';
import BoardConfigDialog from './BoardConfigDialog';
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
  const [activeView, setActiveView] = useState<'board' | 'backlog' | 'sprints' | 'reports'>('board');

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

  const handleBoardUpdate = async (updates: Partial<Board>) => {
    try {
      console.log('Updating board with:', updates);
      // TODO: Implement board update in taskmasterService
      toast({
        title: 'Success',
        description: 'Board configuration updated',
      });
    } catch (error) {
      console.error('Error updating board:', error);
      toast({
        title: 'Error',
        description: 'Failed to update board configuration',
        variant: 'destructive',
      });
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
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
          <p className="text-lg text-gray-600">
            {board.type.charAt(0).toUpperCase() + board.type.slice(1)} workflow for {project.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
          
          <BoardConfigDialog board={board} onBoardUpdate={handleBoardUpdate}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </BoardConfigDialog>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="backlog" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Backlog
          </TabsTrigger>
          {board.type === 'scrum' && (
            <TabsTrigger value="sprints" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Sprints
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <AdvancedTaskBoard 
            project={project} 
            board={board}
          />
        </TabsContent>

        <TabsContent value="backlog" className="mt-6">
          <div className="text-center py-16">
            <List className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Backlog View</h3>
            <p className="text-muted-foreground">
              Prioritized list of tasks and stories ready for development
            </p>
          </div>
        </TabsContent>

        {board.type === 'scrum' && (
          <TabsContent value="sprints" className="mt-6">
            <SprintManagement
              project={project}
              board={board}
              tasks={tasks}
            />
          </TabsContent>
        )}

        <TabsContent value="reports" className="mt-6">
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Board Analytics</h3>
            <p className="text-muted-foreground">
              Burndown charts, velocity tracking, and team performance metrics
            </p>
          </div>
        </TabsContent>
      </Tabs>

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
