
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/dbtypes';
import { Clock, AlertCircle, FileBox, User } from 'lucide-react';
import { format } from 'date-fns';
import TaskIntegrations from './TaskIntegrations';
import IntegrationNotifications from '../IntegrationNotifications';

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
  if (!task) {
    return (
      <div className="space-y-4">
        <IntegrationNotifications />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a task to view details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };
  
  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return '-';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : assigneeId;
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <IntegrationNotifications />
      
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>
            {getProjectName(task.project)}
          </CardDescription>
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
                {`Assigned to: ${getAssigneeName(task.assignee)}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TaskIntegrations task={task} />
    </div>
  );
};

export default TaskDetailWithIntegrations;
