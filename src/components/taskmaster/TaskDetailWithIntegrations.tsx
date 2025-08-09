import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/dbtypes';
import { Clock, AlertCircle, FileBox, User, Share, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import TaskIntegrations from './TaskIntegrations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIntegration } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailWithIntegrationsProps {
  task: Task | null;
  projects: { id: string; name: string }[];
  teamMembers: { id: string; name: string }[];
}

const TaskDetailWithIntegrations: React.FC<TaskDetailWithIntegrationsProps> = ({ 
  task, 
  projects, 
  teamMembers 
}) => {
  const { assignResourceToTask, shareFileWithUser, triggerAutomation } = useIntegration();
  const { toast } = useToast();

  if (!task) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a task to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };
  
  const getAssigneeName = (assignedTo?: string[]) => {
    if (!assignedTo || assignedTo.length === 0) return '-';
    const member = teamMembers.find(m => m.id === assignedTo[0]);
    return member ? member.name : assignedTo[0];
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  const handleAssignResource = async (resourceId: string) => {
    const success = await assignResourceToTask(task.id, resourceId);
    if (success) {
      toast({
        title: 'Resource Assigned',
        description: 'Resource has been successfully assigned to the task.',
      });
    } else {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to assign resource to the task.',
        variant: 'destructive',
      });
    }
  };

  const handleQuickAction = async (actionType: string) => {
    const success = await triggerAutomation(actionType, { task_id: task.id });
    if (success) {
      toast({
        title: 'Action Triggered',
        description: `${actionType} action has been triggered for this task.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>
                {getProjectName(task.project_id)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={task.status === 'done' ? 'success' : 'secondary'}>
                {task.status === 'inProgress' ? 'In Progress' : 
                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <div className="rounded-md bg-secondary p-2 text-sm">
                {task.status === 'inProgress' ? 'In Progress' : 
                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Priority</div>
              <div className={`rounded-md bg-secondary p-2 text-sm ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Description</div>
            <div className="rounded-md bg-secondary p-2 text-sm">
              {task.description || 'No description provided'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {task.due_date 
                  ? `Due: ${format(new Date(task.due_date), 'MMM d, yyyy')}`
                  : 'No due date'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {`Assigned to: ${getAssigneeName(task.assigned_to)}`}
              </span>
            </div>
          </div>

          {/* Quick Integration Actions */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Quick Actions</div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickAction('sync_planboard')}
              >
                <Share className="h-3 w-3 mr-1" />
                Sync to PlanBoard
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickAction('notify_team')}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Notify Team
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickAction('create_time_log')}
              >
                <Clock className="h-3 w-3 mr-1" />
                Log Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TaskIntegrations 
        taskId={task.id}
        taskTitle={task.title}
        projectId={task.project_id}
      />
    </div>
  );
};

export default TaskDetailWithIntegrations;
