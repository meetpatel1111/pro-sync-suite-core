
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Users, MessageSquare, Calendar, Zap, AlertCircle } from 'lucide-react';
import { useIntegration } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/dbtypes';

interface TaskIntegrationsProps {
  task: Task;
  projectId?: string;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task, projectId }) => {
  const { logTimeForTask, linkDocumentToTask, shareFileWithUser } = useIntegration();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeLog = async () => {
    setIsLoading(true);
    try {
      const success = await logTimeForTask(task.id, {
        description: `Work on ${task.title}`,
        time_spent: 1, // 1 hour default
        project_id: projectId || '',
        billable: true
      });
      
      if (success) {
        toast({
          title: 'Time Logged',
          description: 'Time entry has been created successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to log time for this task.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while logging time.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkDocument = async () => {
    setIsLoading(true);
    try {
      const success = await linkDocumentToTask(task.id, 'sample-doc-id');
      
      if (success) {
        toast({
          title: 'Document Linked',
          description: 'Document has been linked to this task.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to link document to task.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while linking document.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareFile = async () => {
    setIsLoading(true);
    try {
      const success = await shareFileWithUser('sample-file-id', 'sample-user-id');
      
      if (success) {
        toast({
          title: 'File Shared',
          description: 'File has been shared successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to share file.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while sharing file.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Task Integrations
        </CardTitle>
        <CardDescription>
          Cross-app actions and workflows for this task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TimeTrackPro Integration */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">TimeTrackPro</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleTimeLog}
              disabled={isLoading}
            >
              Log Time
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically log time spent on this task
          </p>
        </div>

        {/* FileVault Integration */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span className="font-medium">FileVault</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleLinkDocument}
                disabled={isLoading}
              >
                Link Document
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleShareFile}
                disabled={isLoading}
              >
                Share File
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Link relevant documents and files to this task
          </p>
        </div>

        {/* CollabSpace Integration */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-pink-600" />
              <span className="font-medium">CollabSpace</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <Button size="sm" variant="outline" disabled={isLoading}>
              Create Channel
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create dedicated discussion channels for this task
          </p>
        </div>

        {/* PlanBoard Integration */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="font-medium">PlanBoard</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <Button size="sm" variant="outline" disabled={isLoading}>
              Update Timeline
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Sync task progress with project timeline
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskIntegrations;
