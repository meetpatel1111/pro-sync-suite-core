
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/utils/dbtypes';
import { useIntegrationContext } from '@/context/IntegrationContext';
import { Calendar, Clock, User, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import TaskIntegrations from './TaskIntegrations';

interface TaskDetailWithIntegrationsProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailWithIntegrations: React.FC<TaskDetailWithIntegrationsProps> = ({
  task,
  open,
  onOpenChange
}) => {
  const { assignResourceToTask } = useIntegrationContext();
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (task?.assigned_to) {
      setAssignedUsers(Array.isArray(task.assigned_to) ? task.assigned_to : [task.assigned_to]);
    }
  }, [task]);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'in progress': return 'default';
      case 'todo': return 'secondary';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  const handleAssignResource = async (resourceId: string) => {
    const success = await assignResourceToTask(task.id, resourceId);
    if (success && !assignedUsers.includes(resourceId)) {
      setAssignedUsers([...assignedUsers, resourceId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.title}
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {task.description || 'No description provided'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Due: {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Assigned: {assignedUsers.length > 0 ? `${assignedUsers.length} user(s)` : 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Created: {format(new Date(task.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Task Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusColor(task.status)} className="ml-2">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <TaskIntegrations task={task} />
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Time tracking integration coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Document management integration coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailWithIntegrations;
