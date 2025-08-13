
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  Users, 
  Calendar, 
  Link,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuthContext } from '@/context/AuthContext';
import type { Task } from '@/utils/dbtypes';

interface TaskIntegrationsProps {
  task: Task;
  onUpdate: () => void;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task, onUpdate }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [timeLogMinutes, setTimeLogMinutes] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [isLoggingTime, setIsLoggingTime] = useState(false);
  const [isLinkingDocument, setIsLinkingDocument] = useState(false);
  const [isSyncingBoard, setIsSyncingBoard] = useState(false);

  const handleLogTime = async () => {
    if (!user || !timeLogMinutes) return;

    const minutes = parseInt(timeLogMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number of minutes',
        variant: 'destructive'
      });
      return;
    }

    setIsLoggingTime(true);
    try {
      const result = await integrationService.logTimeForTask(
        task.id, 
        minutes, 
        timeDescription || `Time logged for: ${task.title}`
      );

      if (result) {
        toast({
          title: 'Time Logged',
          description: `${minutes} minutes logged for "${task.title}"`
        });
        setTimeLogMinutes('');
        setTimeDescription('');
        onUpdate();
      } else {
        throw new Error('Failed to log time');
      }
    } catch (error) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error',
        description: 'Failed to log time for task',
        variant: 'destructive'
      });
    } finally {
      setIsLoggingTime(false);
    }
  };

  const handleLinkDocument = async () => {
    if (!user || !documentUrl || !documentName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both document URL and name',
        variant: 'destructive'
      });
      return;
    }

    setIsLinkingDocument(true);
    try {
      const success = await integrationService.linkDocumentToTask(
        task.id,
        documentUrl,
        documentName
      );

      if (success) {
        toast({
          title: 'Document Linked',
          description: `"${documentName}" has been linked to this task`
        });
        setDocumentUrl('');
        setDocumentName('');
        onUpdate();
      } else {
        throw new Error('Failed to link document');
      }
    } catch (error) {
      console.error('Error linking document:', error);
      toast({
        title: 'Error',
        description: 'Failed to link document to task',
        variant: 'destructive'
      });
    } finally {
      setIsLinkingDocument(false);
    }
  };

  const handleSyncToBoard = async () => {
    if (!user || !selectedBoard) {
      toast({
        title: 'No Board Selected',
        description: 'Please select a board to sync to',
        variant: 'destructive'
      });
      return;
    }

    setIsSyncingBoard(true);
    try {
      const success = await integrationService.syncTaskToPlanBoard(
        user.id,
        task.id,
        selectedBoard
      );

      if (success) {
        toast({
          title: 'Task Synced',
          description: 'Task has been synced to PlanBoard'
        });
        setSelectedBoard('');
        onUpdate();
      } else {
        throw new Error('Failed to sync task');
      }
    } catch (error) {
      console.error('Error syncing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync task to board',
        variant: 'destructive'
      });
    } finally {
      setIsSyncingBoard(false);
    }
  };

  const integrationCards = [
    {
      title: 'Time Tracking',
      description: 'Log time spent on this task',
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      status: 'available',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="time-minutes">Minutes</Label>
              <Input
                id="time-minutes"
                type="number"
                placeholder="60"
                value={timeLogMinutes}
                onChange={(e) => setTimeLogMinutes(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="time-description">Description (Optional)</Label>
              <Input
                id="time-description"
                placeholder="Working on features..."
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleLogTime} 
            disabled={isLoggingTime || !timeLogMinutes}
            className="w-full"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isLoggingTime ? 'Logging...' : 'Log Time'}
          </Button>
        </div>
      )
    },
    {
      title: 'Document Linking',
      description: 'Link documents from KnowledgeNest',
      icon: <FileText className="h-5 w-5 text-green-600" />,
      status: 'available',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              placeholder="Requirements Document"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="doc-url">Document URL</Label>
            <Input
              id="doc-url"
              placeholder="https://..."
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleLinkDocument}
            disabled={isLinkingDocument || !documentUrl || !documentName}
            className="w-full"
          >
            <Link className="mr-2 h-4 w-4" />
            {isLinkingDocument ? 'Linking...' : 'Link Document'}
          </Button>
        </div>
      )
    },
    {
      title: 'PlanBoard Sync',
      description: 'Sync task to project boards',
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      status: 'available',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="board-select">Select Board</Label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger>
                <SelectValue placeholder="Choose board..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board-1">Main Project Board</SelectItem>
                <SelectItem value="board-2">Sprint Planning</SelectItem>
                <SelectItem value="board-3">Bug Tracking</SelectItem>
                <SelectItem value="board-4">Feature Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSyncToBoard}
            disabled={isSyncingBoard || !selectedBoard}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isSyncingBoard ? 'Syncing...' : 'Sync to Board'}
          </Button>
        </div>
      )
    },
    {
      title: 'Team Collaboration',
      description: 'Share task in team channels',
      icon: <Users className="h-5 w-5 text-orange-600" />,
      status: 'coming_soon',
      content: (
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground">
            Coming soon! Share tasks directly in team channels and get instant feedback.
          </div>
        </div>
      )
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="text-xs">Available</Badge>;
      case 'connected':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Connected</Badge>;
      case 'coming_soon':
        return <Badge variant="secondary" className="text-xs">Coming Soon</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect this task with other apps for enhanced productivity
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrationCards.map((integration, index) => (
          <Card key={index} className={integration.status === 'coming_soon' ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-base">{integration.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent>
              {integration.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>
            Commonly used integration actions for this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Start Timer
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Create Note
            </Button>
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Notify Team
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Status</CardTitle>
          <CardDescription>
            Current status of connected integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">TimeTrackPro</span>
              </div>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">KnowledgeNest</span>
              </div>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">PlanBoard</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Partial
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskIntegrations;
