
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timer, FileBox, AlertCircle, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIntegration } from '@/context/IntegrationContext';
import { Task } from '@/utils/dbtypes';

interface TaskIntegrationsProps {
  task: Task;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task }) => {
  const { toast } = useToast();
  const { logTimeForTask, linkDocumentToTask } = useIntegration();
  
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false);
  const [showDocumentLinkDialog, setShowDocumentLinkDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  
  const [timeEntry, setTimeEntry] = useState({
    minutes: 30,
    description: '',
  });
  
  const [document, setDocument] = useState({
    name: '',
    url: '',
  });
  
  const [riskInfo, setRiskInfo] = useState({
    severity: 'medium',
    description: '',
  });
  
  const [comment, setComment] = useState('');

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

  const handleAddRisk = () => {
    // This would be implemented with RiskRadar integration
    toast({
      title: 'Risk added',
      description: `Risk added to task: ${task.title}`,
    });
    setShowRiskDialog(false);
  };

  const handleAddComment = () => {
    // This would be implemented with CollabSpace integration
    toast({
      title: 'Comment added',
      description: `Comment added to task: ${task.title}`,
    });
    setShowCommentDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Integrations</CardTitle>
        <CardDescription>Connect this task with other apps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="flex justify-start"
            onClick={() => setShowTimeTrackingDialog(true)}
          >
            <Timer className="mr-2 h-4 w-4" />
            Track Time
          </Button>
          
          <Button 
            variant="outline" 
            className="flex justify-start"
            onClick={() => setShowDocumentLinkDialog(true)}
          >
            <FileBox className="mr-2 h-4 w-4" />
            Link Document
          </Button>
          
          <Button 
            variant="outline" 
            className="flex justify-start"
            onClick={() => setShowRiskDialog(true)}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
          
          <Button 
            variant="outline" 
            className="flex justify-start"
            onClick={() => setShowCommentDialog(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        </div>
      </CardContent>
      
      {/* Time Tracking Dialog */}
      <Dialog open={showTimeTrackingDialog} onOpenChange={setShowTimeTrackingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Time</DialogTitle>
            <DialogDescription>
              Log time spent on this task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="minutes" className="text-right text-sm font-medium">
                Minutes
              </label>
              <Input
                id="minutes"
                type="number"
                className="col-span-3"
                value={timeEntry.minutes}
                onChange={(e) => setTimeEntry({ ...timeEntry, minutes: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="time-description" className="text-right text-sm font-medium">
                Description
              </label>
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
            <Button variant="outline" onClick={() => setShowTimeTrackingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrackTime}>
              Log Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Link Dialog */}
      <Dialog open={showDocumentLinkDialog} onOpenChange={setShowDocumentLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Document</DialogTitle>
            <DialogDescription>
              Attach a document to this task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="doc-name" className="text-right text-sm font-medium">
                Document Name
              </label>
              <Input
                id="doc-name"
                className="col-span-3"
                value={document.name}
                onChange={(e) => setDocument({ ...document, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="doc-url" className="text-right text-sm font-medium">
                Document URL
              </label>
              <Input
                id="doc-url"
                className="col-span-3"
                value={document.url}
                onChange={(e) => setDocument({ ...document, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkDocument}>
              Link Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Risk Dialog */}
      <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Risk</DialogTitle>
            <DialogDescription>
              Flag this task as a risk
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="risk-severity" className="text-right text-sm font-medium">
                Severity
              </label>
              <Select
                value={riskInfo.severity}
                onValueChange={(value) => setRiskInfo({ ...riskInfo, severity: value })}
              >
                <SelectTrigger id="risk-severity" className="col-span-3">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="risk-description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="risk-description"
                className="col-span-3"
                value={riskInfo.description}
                onChange={(e) => setRiskInfo({ ...riskInfo, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRisk}>
              Add Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment to this task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="comment" className="text-right text-sm font-medium">
                Comment
              </label>
              <textarea
                id="comment"
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment}>
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskIntegrations;
