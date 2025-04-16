
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIntegration } from '@/context/IntegrationContext';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const IntegrationNotifications = () => {
  const { dueTasks, isLoadingIntegrations, refreshIntegrations } = useIntegration();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [processingTasks, setProcessingTasks] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Calculate total number of due tasks
    const count = dueTasks.reduce((sum, item) => sum + item.tasksDue.length, 0);
    setNotificationCount(count);
  }, [dueTasks]);
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      // Add task to processing state to show loading
      setProcessingTasks(prev => [...prev, taskId]);
      
      // Update task status to 'done' in the database
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'done' })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Show success toast
      toast({
        title: 'Task completed',
        description: 'The task has been marked as complete',
      });
      
      // Refresh integrations to update the task list
      if (refreshIntegrations) {
        await refreshIntegrations();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    } finally {
      // Remove task from processing state
      setProcessingTasks(prev => prev.filter(id => id !== taskId));
    }
  };
  
  if (isLoadingIntegrations) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-2" />
        </CardContent>
      </Card>
    );
  }
  
  if (notificationCount === 0) {
    return null;
  }
  
  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-2">
          <CollapsibleTrigger asChild>
            <CardTitle className="text-sm font-medium cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>{notificationCount} Integration {notificationCount === 1 ? 'Alert' : 'Alerts'}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-2">
              {dueTasks.map((item, index) => (
                <div key={index} className="border rounded-md p-2">
                  <div className="font-medium mb-1">{item.project.name}</div>
                  <ul className="space-y-1">
                    {item.tasksDue.map((task) => (
                      <li key={task.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{task.title}</span>
                          {task.due_date && (
                            <span className="text-muted-foreground ml-2">
                              Due: {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={processingTasks.includes(task.id)}
                        >
                          <Check className={`h-4 w-4 ${processingTasks.includes(task.id) ? 'opacity-50' : ''}`} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default IntegrationNotifications;
