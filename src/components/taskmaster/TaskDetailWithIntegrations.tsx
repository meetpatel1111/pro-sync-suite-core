import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ClipboardList, UserPlus, FileText, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskComment } from '@/components/taskmaster/TaskComment';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIntegrationContext } from '@/context/IntegrationContext';

interface TaskDetailWithIntegrationsProps {
  task: any;
  onUpdate?: () => void;
}

const TaskDetailWithIntegrations: React.FC<TaskDetailWithIntegrationsProps> = ({ task, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: '1', author: 'John Doe', content: 'Initial task discussion', createdAt: '2024-07-15T10:00:00Z' },
  ]);
  const { toast } = useToast();
  const { assignResourceToTask } = useIntegrationContext();

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments(prev => [...prev, {
        id: String(Date.now()),
        author: 'Current User',
        content: comment,
        createdAt: new Date().toISOString()
      }]);
      setComment('');
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added to the task.'
      });
    }
  };

  const handleAssignResource = async (resourceId: string) => {
    try {
      const success = await assignResourceToTask(task.id, resourceId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Resource assigned successfully'
        });
        onUpdate?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign resource',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Task Details */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                <ClipboardList className="h-3 w-3 mr-1" />
                Task
              </Badge>
              <Badge variant="outline">
                {task.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {task.description || 'No description provided.'}
            </p>

            {/* Task Assignees */}
            <div>
              <h4 className="font-medium text-sm mb-2">Assigned To</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatars/01.png" alt="Assignee" />
                  <AvatarFallback>TS</AvatarFallback>
                </Avatar>
                <span className="text-sm">Taylor Swift</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAssignResource('resource-456')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Resource
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Task Comments */}
            <div>
              <h4 className="font-medium text-sm mb-2">Comments</h4>
              <ScrollArea className="h-[200px] pr-2">
                <div className="space-y-3">
                  {comments.map(comment => (
                    <TaskComment key={comment.id} comment={comment} />
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-3 flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatars/02.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="border rounded-md text-sm"
                    rows={1}
                  />
                </div>
                <Button size="sm" onClick={handleAddComment}>Post</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Link to Documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Create Risk Assessment</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailWithIntegrations;
