
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timer, FileBox, AlertCircle, MessageSquare, Users, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIntegration } from '@/context/IntegrationContext';
import { integrationService } from '@/services/integrationService';
import { Task } from '@/utils/dbtypes';

interface TaskIntegrationsProps {
  task: Task;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task }) => {
  const { toast } = useToast();
  const { logTimeForTask, linkDocumentToTask } = useIntegration();
  
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false);
  const [showDocumentLinkDialog, setShowDocumentLinkDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const [showPlanBoardDialog, setShowPlanBoardDialog] = useState(false);
  
  const [timeEntry, setTimeEntry] = useState({
    minutes: 30,
    description: '',
  });
  
  const [document, setDocument] = useState({
    name: '',
    url: '',
  });

  const [resourceAssignment, setResourceAssignment] = useState({
    resourceId: '',
    notes: ''
  });

  const [budgetAllocation, setBudgetAllocation] = useState({
    amount: 0,
    category: 'development'
  });

  const [collabMessage, setCollabMessage] = useState({
    channelId: '',
    message: ''
  });

  const handleTrackTime = async () => {
    try {
      const result = await logTimeForTask(
        task.id,
        timeEntry.minutes,
        timeEntry.description || `Work on task: ${task.title}`
      );
      
      if (result) {
        toast({
          title: 'Time tracked',
          description: `${timeEntry.minutes} minutes logged for task: ${task.title}`,
        });
        setShowTimeTrackingDialog(false);
        setTimeEntry({ minutes: 30, description: '' });
      } else {
        toast({
          title: 'Error tracking time',
          description: 'Unable to log time for this task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error tracking time:', error);
      toast({
        title: 'Error tracking time',
        description: 'An error occurred while logging time',
        variant: 'destructive',
      });
    }
  };

  const handleLinkDocument = async () => {
    if (!document.name || !document.url) {
      toast({
        title: 'Missing information',
        description: 'Please provide both document name and URL',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await linkDocumentToTask(task.id, document.url, document.name);
      
      if (result) {
        toast({
          title: 'Document linked',
          description: `Document "${document.name}" linked to task: ${task.title}`,
        });
        setShowDocumentLinkDialog(false);
        setDocument({ name: '', url: '' });
      } else {
        toast({
          title: 'Error linking document',
          description: 'Unable to link document to this task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error linking document:', error);
      toast({
        title: 'Error linking document',
        description: 'An error occurred while linking document',
        variant: 'destructive',
      });
    }
  };

  const handleAssignResource = async () => {
    try {
      const success = await integrationService.assignResourceToTask(task.id, resourceAssignment.resourceId);
      if (success) {
        toast({
          title: 'Resource assigned',
          description: 'Resource has been assigned to this task',
        });
        setShowResourceDialog(false);
        setResourceAssignment({ resourceId: '', notes: '' });
      }
    } catch (error) {
      toast({
        title: 'Error assigning resource',
        description: 'Failed to assign resource to task',
        variant: 'destructive',
      });
    }
  };

  const handleShareInCollab = async () => {
    try {
      const success = await integrationService.shareFileInChat(
        task.id,
        collabMessage.channelId || 'general',
        collabMessage.message || `Task update: ${task.title}`
      );
      if (success) {
        toast({
          title: 'Shared in CollabSpace',
          description: 'Task has been shared in the collaboration channel',
        });
        setShowCollabDialog(false);
        setCollabMessage({ channelId: '', message: '' });
      }
    } catch (error) {
      toast({
        title: 'Error sharing task',
        description: 'Failed to share task in CollabSpace',
        variant: 'destructive',
      });
    }
  };

  const handleSyncToPlanBoard = async () => {
    try {
      const success = await integrationService.syncTaskToPlanBoard(task.id);
      if (success) {
        toast({
          title: 'Synced to PlanBoard',
          description: 'Task has been synced to project timeline',
        });
        setShowPlanBoardDialog(false);
      }
    } catch (error) {
      toast({
        title: 'Error syncing task',
        description: 'Failed to sync task to PlanBoard',
        variant: 'destructive',
      });
    }
  };

  const integrationActions = [
    {
      icon: <Timer className="h-4 w-4" />,
      label: 'Track Time',
      description: 'Log time spent on this task',
      color: 'text-green-600',
      onClick: () => setShowTimeTrackingDialog(true)
    },
    {
      icon: <FileBox className="h-4 w-4" />,
      label: 'Link Document',
      description: 'Attach files from FileVault',
      color: 'text-blue-600',
      onClick: () => setShowDocumentLinkDialog(true)
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Assign Resource',
      description: 'Assign team members from ResourceHub',
      color: 'text-purple-600',
      onClick: () => setShowResourceDialog(true)
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: 'Budget Allocation',
      description: 'Set budget limits in BudgetBuddy',
      color: 'text-yellow-600',
      onClick: () => setShowBudgetDialog(true)
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Share in CollabSpace',
      description: 'Discuss task in team channels',
      color: 'text-cyan-600',
      onClick: () => setShowCollabDialog(true)
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Sync to PlanBoard',
      description: 'Update project timeline',
      color: 'text-orange-600',
      onClick: () => setShowPlanBoardDialog(true)
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Risk Assessment',
      description: 'Check for potential risks',
      color: 'text-red-600',
      onClick: () => toast({ title: 'Coming Soon', description: 'Risk assessment integration will be available soon' })
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Generate Report',
      description: 'Create insights in InsightIQ',
      color: 'text-indigo-600',
      onClick: () => toast({ title: 'Coming Soon', description: 'Report generation integration will be available soon' })
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">App Integrations</CardTitle>
          <CardDescription>Connect this task with other ProSync Suite apps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {integrationActions.map((action, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={action.onClick}
              >
                <div className={action.color}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking Dialog */}
      <Dialog open={showTimeTrackingDialog} onOpenChange={setShowTimeTrackingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Time - TimeTrackPro</DialogTitle>
            <DialogDescription>Log time spent on this task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="minutes" className="text-right text-sm font-medium">Minutes</label>
              <Input
                id="minutes"
                type="number"
                className="col-span-3"
                value={timeEntry.minutes}
                onChange={(e) => setTimeEntry({ ...timeEntry, minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="time-description" className="text-right text-sm font-medium">Description</label>
              <Input
                id="time-description"
                className="col-span-3"
                value={timeEntry.description}
                onChange={(e) => setTimeEntry({ ...timeEntry, description: e.target.value })}
                placeholder={`Work on task: ${task.title}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeTrackingDialog(false)}>Cancel</Button>
            <Button onClick={handleTrackTime}>Log Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Link Dialog */}
      <Dialog open={showDocumentLinkDialog} onOpenChange={setShowDocumentLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Document - FileVault</DialogTitle>
            <DialogDescription>Attach a document to this task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="doc-name" className="text-right text-sm font-medium">Document Name</label>
              <Input
                id="doc-name"
                className="col-span-3"
                value={document.name}
                onChange={(e) => setDocument({ ...document, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="doc-url" className="text-right text-sm font-medium">Document URL</label>
              <Input
                id="doc-url"
                className="col-span-3"
                value={document.url}
                onChange={(e) => setDocument({ ...document, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleLinkDocument}>Link Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Assignment Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Resource - ResourceHub</DialogTitle>
            <DialogDescription>Assign a team member to this task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="resource-id" className="text-right text-sm font-medium">Resource ID</label>
              <Input
                id="resource-id"
                className="col-span-3"
                value={resourceAssignment.resourceId}
                onChange={(e) => setResourceAssignment({ ...resourceAssignment, resourceId: e.target.value })}
                placeholder="Enter resource/user ID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="resource-notes" className="text-right text-sm font-medium">Notes</label>
              <Input
                id="resource-notes"
                className="col-span-3"
                value={resourceAssignment.notes}
                onChange={(e) => setResourceAssignment({ ...resourceAssignment, notes: e.target.value })}
                placeholder="Assignment notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResourceDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignResource}>Assign Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CollabSpace Dialog */}
      <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share in CollabSpace</DialogTitle>
            <DialogDescription>Share this task in a collaboration channel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="channel-id" className="text-right text-sm font-medium">Channel ID</label>
              <Input
                id="channel-id"
                className="col-span-3"
                value={collabMessage.channelId}
                onChange={(e) => setCollabMessage({ ...collabMessage, channelId: e.target.value })}
                placeholder="general (leave empty for default)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="collab-message" className="text-right text-sm font-medium">Message</label>
              <Input
                id="collab-message"
                className="col-span-3"
                value={collabMessage.message}
                onChange={(e) => setCollabMessage({ ...collabMessage, message: e.target.value })}
                placeholder={`Task update: ${task.title}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollabDialog(false)}>Cancel</Button>
            <Button onClick={handleShareInCollab}>Share Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PlanBoard Dialog */}
      <Dialog open={showPlanBoardDialog} onOpenChange={setShowPlanBoardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync to PlanBoard</DialogTitle>
            <DialogDescription>Update this task in the project timeline</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will sync the current task status, dates, and assignments to the PlanBoard timeline view.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanBoardDialog(false)}>Cancel</Button>
            <Button onClick={handleSyncToPlanBoard}>Sync to PlanBoard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget Allocation - BudgetBuddy</DialogTitle>
            <DialogDescription>Set budget limits for this task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="budget-amount" className="text-right text-sm font-medium">Amount</label>
              <Input
                id="budget-amount"
                type="number"
                className="col-span-3"
                value={budgetAllocation.amount}
                onChange={(e) => setBudgetAllocation({ ...budgetAllocation, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter budget amount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="budget-category" className="text-right text-sm font-medium">Category</label>
              <Select
                value={budgetAllocation.category}
                onValueChange={(value) => setBudgetAllocation({ ...budgetAllocation, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: 'Coming Soon', description: 'Budget allocation integration will be available soon' });
              setShowBudgetDialog(false);
            }}>
              Set Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskIntegrations;
