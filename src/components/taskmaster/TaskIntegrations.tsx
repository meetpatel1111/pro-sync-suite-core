
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Users, AlertTriangle, Link, Zap } from 'lucide-react';
import { useIntegrationContext } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';

// Define Task interface locally since it's not exported from types
interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
}

interface TaskIntegrationsProps {
  task: Task;
  onUpdate?: () => void;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task, onUpdate }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { 
    assignResourceToTask, 
    shareFileWithUser, 
    triggerAutomation,
    logTimeForTask,
    linkDocumentToTask 
  } = useIntegrationContext();
  const { toast } = useToast();

  const handleAction = async (actionType: string, action: () => Promise<boolean>) => {
    setLoading(prev => ({ ...prev, [actionType]: true }));
    try {
      const success = await action();
      if (success) {
        toast({
          title: 'Success',
          description: `${actionType} completed successfully`
        });
        onUpdate?.();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${actionType.toLowerCase()}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const integrationActions = [
    {
      id: 'time-tracking',
      title: 'Log Time',
      description: 'Track time spent on this task',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50',
      action: () => logTimeForTask(task.id, 2) // Log 2 hours as example
    },
    {
      id: 'assign-resource',
      title: 'Assign Resource',
      description: 'Assign team member to task',
      icon: Users,
      color: 'text-green-600 bg-green-50',
      action: () => assignResourceToTask(task.id, 'user-123')
    },
    {
      id: 'link-document',
      title: 'Link Document',
      description: 'Attach relevant documentation',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50',
      action: () => linkDocumentToTask(task.id, 'doc-123')
    },
    {
      id: 'create-risk',
      title: 'Create Risk',
      description: 'Identify potential risks',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      action: () => Promise.resolve(true) // Placeholder for risk creation
    },
    {
      id: 'trigger-automation',
      title: 'Run Automation',
      description: 'Execute workflow automation',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50',
      action: () => triggerAutomation('auto-123')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Link className="h-5 w-5" />
        <h3 className="font-semibold">Quick Integrations</h3>
        <Badge variant="secondary" className="text-xs">
          Auto-sync enabled
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {integrationActions.map((integration) => {
          const Icon = integration.icon;
          const isLoading = loading[integration.id];

          return (
            <Card key={integration.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${integration.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{integration.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {integration.description}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => handleAction(integration.title, integration.action)}
                  >
                    {isLoading ? 'Processing...' : 'Execute'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TaskIntegrations;
