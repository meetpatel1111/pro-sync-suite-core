
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIntegration } from '@/context/IntegrationContext';
import { format } from 'date-fns';

const IntegrationNotifications = () => {
  const { dueTasks, isLoadingIntegrations } = useIntegration();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    // Calculate total number of due tasks
    const count = dueTasks.reduce((sum, item) => sum + item.tasksDue.length, 0);
    setNotificationCount(count);
  }, [dueTasks]);
  
  if (isLoadingIntegrations) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Loading notifications...
            </div>
          </CardTitle>
        </CardHeader>
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
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Check className="h-4 w-4" />
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
