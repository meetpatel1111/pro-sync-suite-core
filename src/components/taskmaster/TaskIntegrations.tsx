import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrationContext } from '@/context/IntegrationContext';
import { Task } from '@/utils/dbtypes';
import { Clock, DollarSign, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskIntegrationsProps {
  task: Task;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task }) => {
  const { logTimeForTask, linkDocumentToTask, assignResourceToTask } = useIntegrationContext();
  const { toast } = useToast();
  const [timeHours, setTimeHours] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [resourceId, setResourceId] = useState('');

  const handleLogTime = async () => {
    const timeEntry = {
      description: `Time logged for task: ${task.title}`,
      time_spent: parseFloat(timeHours),
      project_id: task.project || '',
      billable: true
    };

    const success = await logTimeForTask(task.id, parseFloat(timeHours));
    if (success) {
      toast({ title: 'Success', description: 'Time logged successfully' });
      setTimeHours('');
    } else {
      toast({ title: 'Error', description: 'Failed to log time', variant: 'destructive' });
    }
  };

  const handleLinkDocument = async () => {
    const success = await linkDocumentToTask(task.id, documentId);
    if (success) {
      toast({ title: 'Success', description: 'Document linked successfully' });
      setDocumentId('');
    } else {
      toast({ title: 'Error', description: 'Failed to link document', variant: 'destructive' });
    }
  };

  const handleAssignResource = async () => {
    const success = await assignResourceToTask(task.id, resourceId);
    if (success) {
      toast({ title: 'Success', description: 'Resource assigned successfully' });
      setResourceId('');
    } else {
      toast({ title: 'Error', description: 'Failed to assign resource', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Integrations</CardTitle>
        <CardDescription>Connect this task with other apps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm">Log Time</h4>
          <p className="text-muted-foreground text-sm">Record time spent on this task</p>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="number"
              placeholder="Hours"
              value={timeHours}
              onChange={(e) => setTimeHours(e.target.value)}
            />
            <Button onClick={handleLogTime}><Clock className="h-4 w-4 mr-2" /> Log Time</Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm">Link Document</h4>
          <p className="text-muted-foreground text-sm">Attach a document to this task</p>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="text"
              placeholder="Document ID"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            />
            <Button onClick={handleLinkDocument}><FileText className="h-4 w-4 mr-2" /> Link Document</Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm">Assign Resource</h4>
          <p className="text-muted-foreground text-sm">Assign a resource to this task</p>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="text"
              placeholder="Resource ID"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            />
            <Button onClick={handleAssignResource}><Users className="h-4 w-4 mr-2" /> Assign Resource</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskIntegrations;
