import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Workflow,
  Database,
  Bell,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';
import IntegrationHealthChecker from './IntegrationHealthChecker';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // New form states
  const [bulkSyncForm, setBulkSyncForm] = useState({
    sourceApp: '',
    targetApp: '',
    dataType: '',
    filters: ''
  });

  const [notificationForm, setNotificationForm] = useState({
    triggerApp: '',
    event: '',
    recipients: '',
    template: ''
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    trigger: '',
    condition: '',
    action: '',
    enabled: true
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

  // New handlers
  const handleBulkSync = async () => {
    if (!bulkSyncForm.sourceApp || !bulkSyncForm.targetApp) {
      toast({
        title: 'Error',
        description: 'Please select both source and target apps',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await integrationService.createIntegrationAction(
        bulkSyncForm.sourceApp,
        bulkSyncForm.targetApp,
        'bulk_sync',
        {
          dataType: bulkSyncForm.dataType,
          filters: bulkSyncForm.filters
        }
      );

      if (success) {
        toast({
          title: 'Bulk Sync Started',
          description: `Syncing ${bulkSyncForm.dataType} from ${bulkSyncForm.sourceApp} to ${bulkSyncForm.targetApp}`
        });
        setBulkSyncForm({ sourceApp: '', targetApp: '', dataType: '', filters: '' });
        setActiveAction(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start bulk sync',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!notificationForm.triggerApp || !notificationForm.event) {
      toast({
        title: 'Error',
        description: 'Please select trigger app and event',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await integrationService.createIntegrationAction(
        notificationForm.triggerApp,
        'NotificationService',
        'send_notification',
        {
          event: notificationForm.event,
          recipients: notificationForm.recipients.split(','),
          template: notificationForm.template
        }
      );

      if (success) {
        toast({
          title: 'Notification Rule Created',
          description: 'Notification automation has been set up'
        });
        setNotificationForm({ triggerApp: '', event: '', recipients: '', template: '' });
        setActiveAction(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create notification rule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!automationForm.name || !automationForm.trigger) {
      toast({
        title: 'Error',
        description: 'Please enter automation name and trigger',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await integrationService.createIntegrationAction(
        'AutomationEngine',
        'WorkflowManager',
        'create_automation',
        automationForm
      );

      if (success) {
        toast({
          title: 'Automation Created',
          description: `Automation "${automationForm.name}" has been created`
        });
        setAutomationForm({ name: '', trigger: '', condition: '', action: '', enabled: true });
        setActiveAction(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automation',
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
      id: 'bulk-sync',
      title: 'Bulk Data Sync',
      description: 'Synchronize data between applications',
      icon: <Database className="h-5 w-5" />,
      color: 'text-cyan-500',
      action: handleBulkSync
    },
    {
      id: 'notification-setup',
      title: 'Setup Notifications',
      description: 'Create notification rules for events',
      icon: <Bell className="h-5 w-5" />,
      color: 'text-orange-500',
      action: handleCreateNotification
    },
    {
      id: 'create-automation',
      title: 'Create Automation',
      description: 'Build custom automation workflows',
      icon: <Workflow className="h-5 w-5" />,
      color: 'text-indigo-500',
      action: handleCreateAutomation
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
    },
    {
      id: 'health-check',
      title: 'Health Monitor',
      description: 'Monitor integration health status',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      action: () => setActiveAction('health-check')
    }
  ];

  const renderActionForm = () => {
    switch (activeAction) {
      case 'health-check':
        return <IntegrationHealthChecker />;

      case 'link-file':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Link File to Task</CardTitle>
              <CardDescription>Attach a file to an existing task using simple IDs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use simple reference IDs. For files, check FileVault for the file name or ID. For tasks, use the task key (e.g., "PROJ-123") or check TaskMaster.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="fileId">File ID or Name</Label>
                <Input
                  id="fileId"
                  value={fileLinkForm.fileId}
                  onChange={(e) => setFileLinkForm(prev => ({ ...prev, fileId: e.target.value }))}
                  placeholder="e.g., document.pdf, file123, or report-2024"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the file name, ID, or reference from FileVault
                </p>
              </div>
              
              <div>
                <Label htmlFor="taskId">Task ID or Key</Label>
                <Input
                  id="taskId"
                  value={fileLinkForm.taskId}
                  onChange={(e) => setFileLinkForm(prev => ({ ...prev, taskId: e.target.value }))}
                  placeholder="e.g., PROJ-123, task456, or Feature Implementation"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the task key, ID, or title from TaskMaster
                </p>
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

      case 'log-time':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Log Time to Task</CardTitle>
              <CardDescription>Record time spent on a specific task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use the task key (e.g., "PROJ-123") or task title from TaskMaster to identify the task.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="taskId">Task ID or Key</Label>
                <Input
                  id="taskId"
                  value={timeLogForm.taskId}
                  onChange={(e) => setTimeLogForm(prev => ({ ...prev, taskId: e.target.value }))}
                  placeholder="e.g., PROJ-123, Bug Fix, or task456"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the task key, ID, or title from TaskMaster
                </p>
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

      case 'task-from-chat':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Create Task from Chat Message</CardTitle>
              <CardDescription>Convert a chat message into a structured task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use channel names (e.g., "general", "development") and project keys (e.g., "PROJ") for easy reference.
                </AlertDescription>
              </Alert>
              
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
                <Label htmlFor="channelId">Channel Name (optional)</Label>
                <Input
                  id="channelId"
                  value={taskFromChatForm.channelId}
                  onChange={(e) => setTaskFromChatForm(prev => ({ ...prev, channelId: e.target.value }))}
                  placeholder="e.g., general, development, support"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the channel name from CollabSpace
                </p>
              </div>
              
              <div>
                <Label htmlFor="projectId">Project Key (optional)</Label>
                <Input
                  id="projectId"
                  value={taskFromChatForm.projectId}
                  onChange={(e) => setTaskFromChatForm(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="e.g., PROJ, WEB, MOBILE"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the project key from TaskMaster/PlanBoard
                </p>
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

      case 'bulk-sync':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Data Synchronization</CardTitle>
              <CardDescription>Synchronize data between different applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sourceApp">Source App</Label>
                  <Select value={bulkSyncForm.sourceApp} onValueChange={(value) => setBulkSyncForm(prev => ({ ...prev, sourceApp: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source app" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TaskMaster">TaskMaster</SelectItem>
                      <SelectItem value="TimeTrackPro">TimeTrackPro</SelectItem>
                      <SelectItem value="BudgetBuddy">BudgetBuddy</SelectItem>
                      <SelectItem value="FileVault">FileVault</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetApp">Target App</Label>
                  <Select value={bulkSyncForm.targetApp} onValueChange={(value) => setBulkSyncForm(prev => ({ ...prev, targetApp: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target app" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TaskMaster">TaskMaster</SelectItem>
                      <SelectItem value="TimeTrackPro">TimeTrackPro</SelectItem>
                      <SelectItem value="BudgetBuddy">BudgetBuddy</SelectItem>
                      <SelectItem value="InsightIQ">InsightIQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="dataType">Data Type</Label>
                <Input
                  id="dataType"
                  value={bulkSyncForm.dataType}
                  onChange={(e) => setBulkSyncForm(prev => ({ ...prev, dataType: e.target.value }))}
                  placeholder="e.g., tasks, time_entries, expenses"
                />
              </div>
              <div>
                <Label htmlFor="filters">Filters (optional)</Label>
                <Input
                  id="filters"
                  value={bulkSyncForm.filters}
                  onChange={(e) => setBulkSyncForm(prev => ({ ...prev, filters: e.target.value }))}
                  placeholder="e.g., status=completed, date>2024-01-01"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleBulkSync} disabled={loading}>
                  {loading ? 'Starting Sync...' : 'Start Sync'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'notification-setup':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Setup Notification Rules</CardTitle>
              <CardDescription>Create automated notification rules for specific events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="triggerApp">Trigger App</Label>
                <Select value={notificationForm.triggerApp} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, triggerApp: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select app" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TaskMaster">TaskMaster</SelectItem>
                    <SelectItem value="BudgetBuddy">BudgetBuddy</SelectItem>
                    <SelectItem value="RiskRadar">RiskRadar</SelectItem>
                    <SelectItem value="ClientConnect">ClientConnect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event">Event Type</Label>
                <Select value={notificationForm.event} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, event: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_overdue">Task Overdue</SelectItem>
                    <SelectItem value="budget_exceeded">Budget Exceeded</SelectItem>
                    <SelectItem value="risk_detected">Risk Detected</SelectItem>
                    <SelectItem value="client_message">Client Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="recipients"
                  value={notificationForm.recipients}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
              <div>
                <Label htmlFor="template">Message Template</Label>
                <Textarea
                  id="template"
                  value={notificationForm.template}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Alert: {{event}} occurred in {{app}} - {{details}}"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateNotification} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Rule'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'create-automation':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Automation</CardTitle>
              <CardDescription>Build a custom automation workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="automationName">Automation Name</Label>
                <Input
                  id="automationName"
                  value={automationForm.name}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter automation name"
                />
              </div>
              <div>
                <Label htmlFor="trigger">Trigger Event</Label>
                <Input
                  id="trigger"
                  value={automationForm.trigger}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, trigger: e.target.value }))}
                  placeholder="e.g., task_created, expense_added"
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition (optional)</Label>
                <Input
                  id="condition"
                  value={automationForm.condition}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., amount > 1000, priority = high"
                />
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={automationForm.action}
                  onChange={(e) => setAutomationForm(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="e.g., send_notification, create_task"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={automationForm.enabled}
                  onCheckedChange={(enabled) => setAutomationForm(prev => ({ ...prev, enabled }))}
                />
                <Label htmlFor="enabled">Enable automation</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateAutomation} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Automation'}
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
          Perform common integration tasks across your ProSync Suite apps using simple, human-readable IDs
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
