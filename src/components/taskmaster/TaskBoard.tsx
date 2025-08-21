
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

  const handleTaskCreated = () => {
    fetchTasks(); // Refresh to get the latest data
    toast({
      title: 'Success',
      description: 'Task created successfully',
    });
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

  const handleBoardUpdated = async () => {
    try {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-container">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse modern-card animate-fade-in loading-shimmer">
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl skeleton"></div>
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
      <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border glass-morphism animate-slide-in-down">
        <div className="space-y-1 animate-fade-in-right">
          <h1 className="text-3xl font-bold text-gray-900 text-shimmer">{board.name}</h1>
          <p className="text-lg text-gray-600 animate-fade-in-up">
            {board.type.charAt(0).toUpperCase() + board.type.slice(1)} workflow for {project.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3 animate-fade-in-left stagger-container">
          <CreateTaskDialog
            boardId={board.id}
            projectId={project.id}
            onTaskCreated={handleTaskCreated}
          >
            <Button className="bg-blue-600 hover:bg-blue-700 button-hover">
              <Plus className="h-4 w-4 mr-2 icon-bounce" />
              Create Task
            </Button>
          </CreateTaskDialog>
          
          <BoardConfigDialog 
            board={board} 
            onBoardUpdated={handleBoardUpdated}
            trigger={
              <Button variant="outline" className="button-hover">
                <Settings className="h-4 w-4 mr-2 icon-bounce" />
                Configure
              </Button>
            }
          />
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="animate-fade-in-up">
        <TabsList className="grid w-full grid-cols-4 glass-morphism">
          <TabsTrigger value="board" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 tab-enter">
            <Kanban className="h-4 w-4 icon-bounce" />
            Board
          </TabsTrigger>
          <TabsTrigger value="backlog" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 tab-enter">
            <List className="h-4 w-4 icon-bounce" />
            Backlog
          </TabsTrigger>
          {board.type === 'scrum' && (
            <TabsTrigger value="sprints" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 tab-enter">
              <Timer className="h-4 w-4 icon-bounce" />
              Sprints
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 tab-enter">
            <BarChart3 className="h-4 w-4 icon-bounce" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6 tab-content-enter">
          <AdvancedTaskBoard 
            project={project} 
            board={board}
          />
        </TabsContent>

        <TabsContent value="backlog" className="mt-6 tab-content-enter">
          <div className="text-center py-16 animate-zoom-in">
            <List className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
            <h3 className="text-xl font-semibold mb-2 animate-fade-in-up">Backlog View</h3>
            <p className="text-muted-foreground animate-fade-in-up">
              Prioritized list of tasks and stories ready for development
            </p>
          </div>
        </TabsContent>

        {board.type === 'scrum' && (
          <TabsContent value="sprints" className="mt-6 tab-content-enter">
            <SprintManagement
              project={project}
              board={board}
              tasks={tasks}
            />
          </TabsContent>
        )}

        <TabsContent value="reports" className="mt-6 tab-content-enter">
          <div className="text-center py-16 animate-zoom-in">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
            <h3 className="text-xl font-semibold mb-2 animate-fade-in-up">Board Analytics</h3>
            <p className="text-muted-foreground animate-fade-in-up">
              Burndown charts, velocity tracking, and team performance metrics
            </p>
          </div>
        </TabsContent>
      </Tabs>

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

export default TaskBoard;
