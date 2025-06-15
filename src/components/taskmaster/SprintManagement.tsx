
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, Pause, RotateCcw, Plus, Calendar as CalendarIcon,
  Target, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Sprint, Project, Board, TaskMasterTask } from '@/types/taskmaster';
import { sprintService } from '@/services/sprintService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

interface SprintManagementProps {
  project: Project;
  board: Board;
  tasks: TaskMasterTask[];
}

const SprintManagement: React.FC<SprintManagementProps> = ({
  project,
  board,
  tasks
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchSprints();
  }, [board.id]);

  const fetchSprints = async () => {
    try {
      const { data, error } = await sprintService.getSprints(board.id);
      if (error) {
        console.error('Error fetching sprints:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sprints',
          variant: 'destructive',
        });
        return;
      }
      setSprints(data || []);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    if (!sprintForm.name.trim() || !user) return;

    try {
      const { data, error } = await sprintService.createSprint({
        project_id: project.id,
        board_id: board.id,
        name: sprintForm.name,
        goal: sprintForm.goal,
        start_date: sprintForm.start_date || undefined,
        end_date: sprintForm.end_date || undefined,
        status: 'planned',
        created_by: user.id
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create sprint',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setSprints(prev => [data, ...prev]);
        setSprintForm({ name: '', goal: '', start_date: '', end_date: '' });
        setIsCreateDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Sprint created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  const handleSprintStart = async (sprintId: string) => {
    try {
      const { data, error } = await sprintService.updateSprint(sprintId, { 
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to start sprint',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setSprints(prev => prev.map(s => s.id === sprintId ? data : s));
        toast({
          title: 'Sprint Started',
          description: 'Sprint is now active',
        });
      }
    } catch (error) {
      console.error('Error starting sprint:', error);
    }
  };

  const handleSprintComplete = async (sprintId: string) => {
    try {
      const { data, error } = await sprintService.updateSprint(sprintId, { 
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0]
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to complete sprint',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setSprints(prev => prev.map(s => s.id === sprintId ? data : s));
        toast({
          title: 'Sprint Completed',
          description: 'Sprint has been completed',
        });
      }
    } catch (error) {
      console.error('Error completing sprint:', error);
    }
  };

  const activeSprint = sprints.find(s => s.status === 'active');
  const plannedSprints = sprints.filter(s => s.status === 'planned');
  const completedSprints = sprints.filter(s => s.status === 'completed');

  const getSprintTasks = (sprintId: string) => {
    return tasks.filter(task => task.sprint_id === sprintId);
  };

  const getSprintProgress = (sprintId: string) => {
    const sprintTasks = getSprintTasks(sprintId);
    const completedTasks = sprintTasks.filter(task => task.status === 'done');
    return sprintTasks.length > 0 ? (completedTasks.length / sprintTasks.length) * 100 : 0;
  };

  const SprintCard: React.FC<{ sprint: Sprint }> = ({ sprint }) => {
    const sprintTasks = getSprintTasks(sprint.id);
    const progress = getSprintProgress(sprint.id);
    const isActive = sprint.status === 'active';
    const isCompleted = sprint.status === 'completed';

    return (
      <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {sprint.name}
                <Badge 
                  variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
                  className={
                    isActive ? 'bg-blue-100 text-blue-800' :
                    isCompleted ? 'bg-green-100 text-green-800' : ''
                  }
                >
                  {sprint.status}
                </Badge>
              </CardTitle>
              {sprint.goal && (
                <p className="text-sm text-muted-foreground mt-1">{sprint.goal}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {sprint.status === 'planned' && (
                <Button 
                  size="sm" 
                  onClick={() => handleSprintStart(sprint.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {sprint.status === 'active' && (
                <Button 
                  size="sm" 
                  onClick={() => handleSprintComplete(sprint.id)}
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Sprint Dates */}
          {(sprint.start_date || sprint.end_date) && (
            <div className="flex items-center gap-4 text-sm">
              {sprint.start_date && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(sprint.start_date), 'MMM dd, yyyy')}
                </div>
              )}
              {sprint.start_date && sprint.end_date && <span>→</span>}
              {sprint.end_date && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  {format(new Date(sprint.end_date), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          )}

          {/* Sprint Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{sprintTasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sprintTasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {sprintTasks.reduce((sum, task) => sum + (task.story_points || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Story Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          {sprintTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sprint Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Created {format(new Date(sprint.created_at), 'MMM dd, yyyy')}
            </div>
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sprint Management</h2>
          <p className="text-muted-foreground">Manage sprints for {board.name}</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="sprint-name">Sprint Name</Label>
                <Input
                  id="sprint-name"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sprint 1, Alpha Release"
                />
              </div>
              
              <div>
                <Label htmlFor="sprint-goal">Sprint Goal</Label>
                <Textarea
                  id="sprint-goal"
                  value={sprintForm.goal}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={sprintForm.start_date}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={sprintForm.end_date}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSprint}>
                Create Sprint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Active Sprint
          </h3>
          <SprintCard sprint={activeSprint} />
        </div>
      )}

      {/* Planned Sprints */}
      {plannedSprints.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Planned Sprints
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {plannedSprints.map(sprint => (
              <SprintCard key={sprint.id} sprint={sprint} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed Sprints
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedSprints.slice(0, 6).map(sprint => (
              <SprintCard key={sprint.id} sprint={sprint} />
            ))}
          </div>
          {completedSprints.length > 6 && (
            <Button variant="outline" className="w-full mt-4">
              View All Completed Sprints ({completedSprints.length})
            </Button>
          )}
        </div>
      )}

      {/* Empty State */}
      {sprints.length === 0 && (
        <div className="text-center py-16">
          <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No sprints yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first sprint to start organizing your work into time-boxed iterations.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Sprint
          </Button>
        </div>
      )}
    </div>
  );
};

export default SprintManagement;
