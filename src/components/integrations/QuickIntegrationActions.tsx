
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

const QuickIntegrationActions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states for different actions
  const [taskFromChatForm, setTaskFromChatForm] = useState({
    message: '',
    channelId: '',
    projectId: ''
  });

  const [timeLogForm, setTimeLogForm] = useState({
    taskId: '',
    minutes: 30,
    description: ''
  });

  const [fileLinkForm, setFileLinkForm] = useState({
    fileId: '',
    taskId: ''
  });

  const handleCreateTaskFromChat = async () => {
    if (!taskFromChatForm.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message to create task from',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const task = await integrationService.createTaskFromChatMessage(
        taskFromChatForm.message,
        taskFromChatForm.channelId || 'general',
        taskFromChatForm.projectId || undefined
      );

      if (task) {
        toast({
          title: 'Task Created',
          description: `Task "${task.title}" created successfully`
        });
        setTaskFromChatForm({ message: '', channelId: '', projectId: '' });
        setActiveAction(null);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task from chat message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogTime = async () => {
    if (!timeLogForm.taskId) {
      toast({
        title: 'Error',
        description: 'Please enter a task ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const timeEntry = await integrationService.logTimeForTask(
        timeLogForm.taskId,
        timeLogForm.minutes,
        timeLogForm.description
      );

      if (timeEntry) {
        toast({
          title: 'Time Logged',
          description: `${timeLogForm.minutes} minutes logged successfully`
        });
        setTimeLogForm({ taskId: '', minutes: 30, description: '' });
        setActiveAction(null);
      } else {
        throw new Error('Failed to log time');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log time for task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkFile = async () => {
    if (!fileLinkForm.fileId || !fileLinkForm.taskId) {
      toast({
        title: 'Error',
        description: 'Please enter both file ID and task ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await integrationService.linkFileToTask(
        fileLinkForm.fileId,
        fileLinkForm.taskId
      );

      if (success) {
        toast({
          title: 'File Linked',
          description: 'File successfully linked to task'
        });
        setFileLinkForm({ fileId: '', taskId: '' });
        setActiveAction(null);
      } else {
        throw new Error('Failed to link file');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link file to task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'task-from-chat',
      title: 'Create Task from Chat',
      description: 'Convert a chat message into a task',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-blue-500',
      action: handleCreateTaskFromChat
    },
    {
      id: 'log-time',
      title: 'Log Time to Task',
      description: 'Quickly log time against a specific task',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-green-500',
      action: handleLogTime
    },
    {
      id: 'link-file',
      title: 'Link File to Task',
      description: 'Attach a file to an existing task',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-purple-500',
      action: handleLinkFile
    },
    {
      id: 'budget-check',
      title: 'Check Budget Status',
      description: 'View current budget utilization',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-yellow-500',
      action: () => toast({ title: 'Feature Coming Soon', description: 'Budget checking will be available soon' })
    },
    {
      id: 'resource-check',
      title: 'Check Resource Allocation',
      description: 'View team resource utilization',
      icon: <Users className="h-5 w-5" />,
      color: 'text-cyan-500',
      action: () => toast({ title: 'Feature Coming Soon', description: 'Resource checking will be available soon' })
    },
    {
      id: 'risk-scan',
      title: 'Scan for Risks',
      description: 'Run a quick risk assessment',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-500',
      action: () => toast({ title: 'Feature Coming Soon', description: 'Risk scanning will be available soon' })
    }
  ];

  const renderActionForm = () => {
    switch (activeAction) {
      case 'task-from-chat':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Create Task from Chat Message</CardTitle>
              <CardDescription>Convert a chat message into a structured task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">Chat Message</Label>
                <Textarea
                  id="message"
                  value={taskFromChatForm.message}
                  onChange={(e) => setTaskFromChatForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter the chat message to convert to a task..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="channelId">Channel ID (optional)</Label>
                <Input
                  id="channelId"
                  value={taskFromChatForm.channelId}
                  onChange={(e) => setTaskFromChatForm(prev => ({ ...prev, channelId: e.target.value }))}
                  placeholder="Enter channel ID"
                />
              </div>
              <div>
                <Label htmlFor="projectId">Project ID (optional)</Label>
                <Input
                  id="projectId"
                  value={taskFromChatForm.projectId}
                  onChange={(e) => setTaskFromChatForm(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="Enter project ID"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateTaskFromChat} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'log-time':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Log Time to Task</CardTitle>
              <CardDescription>Record time spent on a specific task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taskId">Task ID</Label>
                <Input
                  id="taskId"
                  value={timeLogForm.taskId}
                  onChange={(e) => setTimeLogForm(prev => ({ ...prev, taskId: e.target.value }))}
                  placeholder="Enter task ID"
                />
              </div>
              <div>
                <Label htmlFor="minutes">Time (minutes)</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={timeLogForm.minutes}
                  onChange={(e) => setTimeLogForm(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter minutes"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={timeLogForm.description}
                  onChange={(e) => setTimeLogForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleLogTime} disabled={loading}>
                  {loading ? 'Logging...' : 'Log Time'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'link-file':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Link File to Task</CardTitle>
              <CardDescription>Attach a file to an existing task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fileId">File ID</Label>
                <Input
                  id="fileId"
                  value={fileLinkForm.fileId}
                  onChange={(e) => setFileLinkForm(prev => ({ ...prev, fileId: e.target.value }))}
                  placeholder="Enter file ID"
                />
              </div>
              <div>
                <Label htmlFor="taskId">Task ID</Label>
                <Input
                  id="taskId"
                  value={fileLinkForm.taskId}
                  onChange={(e) => setFileLinkForm(prev => ({ ...prev, taskId: e.target.value }))}
                  placeholder="Enter task ID"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleLinkFile} disabled={loading}>
                  {loading ? 'Linking...' : 'Link File'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Integration Actions</h3>
        <p className="text-muted-foreground">
          Perform common integration tasks across your ProSync Suite apps
        </p>
      </div>

      {activeAction ? (
        renderActionForm()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={action.color}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (action.id.includes('-')) {
                          setActiveAction(action.id);
                        } else {
                          action.action();
                        }
                      }}
                    >
                      {action.id.includes('-') ? 'Configure' : 'Run'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickIntegrationActions;
