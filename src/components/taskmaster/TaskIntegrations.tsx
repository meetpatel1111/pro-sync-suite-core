
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Link2, 
  Clock, 
  FileText, 
  Users, 
  MessageSquare, 
  Calendar,
  Plus,
  ExternalLink
} from 'lucide-react';
import { integrationService } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface TaskIntegrationsProps {
  taskId: string;
  taskTitle: string;
  projectId?: string;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ 
  taskId, 
  taskTitle, 
  projectId 
}) => {
  const [timeMinutes, setTimeMinutes] = useState<string>('');
  const [timeDescription, setTimeDescription] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [loading, setLoading] = useState<string>('');
  
  const { toast } = useToast();

  const handleLogTime = async () => {
    const minutes = parseInt(timeMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: 'Invalid Time',
        description: 'Please enter a valid number of minutes',
        variant: 'destructive'
      });
      return;
    }

    setLoading('time');
    try {
      const timeEntry = await integrationService.logTimeForTask(
        taskId, 
        minutes, 
        timeDescription || `Time logged for: ${taskTitle}`
      );

      if (timeEntry) {
        toast({
          title: 'Time Logged',
          description: `${minutes} minutes logged successfully`
        });
        setTimeMinutes('');
        setTimeDescription('');
      } else {
        throw new Error('Failed to log time');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log time entry',
        variant: 'destructive'
      });
    } finally {
      setLoading('');
    }
  };

  const handleLinkDocument = async () => {
    if (!fileUrl || !fileName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both file URL and name',
        variant: 'destructive'
      });
      return;
    }

    setLoading('document');
    try {
      const success = await integrationService.linkDocumentToTask(taskId, fileUrl, fileName);
      
      if (success) {
        toast({
          title: 'Document Linked',
          description: `${fileName} has been linked to this task`
        });
        setFileUrl('');
        setFileName('');
      } else {
        throw new Error('Failed to link document');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link document',
        variant: 'destructive'
      });
    } finally {
      setLoading('');
    }
  };

  const handleShareInChat = async () => {
    if (!chatMessage.trim()) {
      toast({
        title: 'Missing Message',
        description: 'Please enter a message to share',
        variant: 'destructive'
      });
      return;
    }

    setLoading('chat');
    try {
      const success = await integrationService.shareFileInChat(
        'task-file-id', 
        'general-channel', 
        chatMessage
      );
      
      if (success) {
        toast({
          title: 'Shared in Chat',
          description: 'Task has been shared in the team chat'
        });
        setChatMessage('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share in chat',
        variant: 'destructive'
      });
    } finally {
      setLoading('');
    }
  };

  const handleSyncToPlanBoard = async () => {
    if (!projectId) {
      toast({
        title: 'No Project',
        description: 'This task must be associated with a project to sync',
        variant: 'destructive'
      });
      return;
    }

    setLoading('planboard');
    try {
      const success = await integrationService.syncTaskToPlanBoard(taskId, projectId);
      
      if (success) {
        toast({
          title: 'Synced to PlanBoard',
          description: 'Task has been synced to project timeline'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync to PlanBoard',
        variant: 'destructive'
      });
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Task Integrations</h3>
      </div>

      {/* Time Tracking Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Log Time Entry
          </CardTitle>
          <CardDescription>
            Automatically create a time entry in TimeTrackPro for this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Minutes</label>
              <Input
                type="number"
                placeholder="60"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Working on feature implementation"
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleLogTime}
            disabled={loading === 'time'}
            className="w-full"
          >
            {loading === 'time' ? 'Logging...' : 'Log Time Entry'}
          </Button>
        </CardContent>
      </Card>

      {/* Document Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Link Document
          </CardTitle>
          <CardDescription>
            Link a document from FileVault to this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Document URL</label>
              <Input
                placeholder="https://filevault.com/document/123"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Document Name</label>
              <Input
                placeholder="Requirements Document.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleLinkDocument}
            disabled={loading === 'document'}
            className="w-full"
          >
            {loading === 'document' ? 'Linking...' : 'Link Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Chat Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Share in Team Chat
          </CardTitle>
          <CardDescription>
            Share this task in CollabSpace team chat with a message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Message</label>
            <Input
              placeholder="Need help with this task - any ideas?"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleShareInChat}
            disabled={loading === 'chat'}
            className="w-full"
          >
            {loading === 'chat' ? 'Sharing...' : 'Share in Chat'}
          </Button>
        </CardContent>
      </Card>

      {/* PlanBoard Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sync to PlanBoard
          </CardTitle>
          <CardDescription>
            Add this task to the project timeline in PlanBoard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSyncToPlanBoard}
            disabled={loading === 'planboard' || !projectId}
            className="w-full"
          >
            {loading === 'planboard' ? 'Syncing...' : 'Sync to Timeline'}
          </Button>
          {!projectId && (
            <p className="text-sm text-muted-foreground mt-2">
              Task must be associated with a project to sync to timeline
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connected apps that can integrate with this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="secondary" className="justify-center">
              <Clock className="h-3 w-3 mr-1" />
              TimeTrackPro
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <FileText className="h-3 w-3 mr-1" />
              FileVault
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              CollabSpace
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <Calendar className="h-3 w-3 mr-1" />
              PlanBoard
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskIntegrations;
