
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip, 
  Activity,
  Edit
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  assignee?: string;
  assigned_to?: string[];
  progress?: number;
  estimated_hours?: number;
  comment_count?: number;
  attachment_count?: number;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

const TaskDetailDialog = ({ open, onOpenChange, task }: TaskDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Description */}
            {task.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            )}

            {/* Progress */}
            {task.progress !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Progress</h4>
                  <span className="text-sm text-muted-foreground">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            )}

            <Separator />

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Assignee</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/avatar-${task.assignee}.png`} />
                      <AvatarFallback className="text-xs">
                        {task.assignee.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {task.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Start Date</span>
                    <span className="text-sm">{new Date(task.start_date).toLocaleDateString()}</span>
                  </div>
                )}

                {task.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Estimated</span>
                    <span className="text-sm">{task.estimated_hours}h</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Due Date</span>
                    <span className="text-sm">{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}

                {task.comment_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Comments</span>
                    <span className="text-sm">{task.comment_count}</span>
                  </div>
                )}

                {task.attachment_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Attachments</span>
                    <span className="text-sm">{task.attachment_count}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subtasks">
            <div className="text-center py-8 text-muted-foreground">
              <h4 className="font-medium mb-2">No Subtasks</h4>
              <p className="text-sm">This task doesn't have any subtasks yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-medium mb-2">No Comments</h4>
              <p className="text-sm">Be the first to add a comment on this task.</p>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-medium mb-2">No Activity</h4>
              <p className="text-sm">Task activity will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
