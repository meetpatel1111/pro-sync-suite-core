
import React, { useState, useEffect } from 'react';
import { Bell, X, RefreshCw, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntegration } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface AutomationEvent {
  id: string;
  event_type: string;
  source_module: string;
  target_module: string;
  status: string;
  triggered_at: string;
  processed_at?: string;
  payload: any;
}

const IntegrationNotifications = () => {
  const { 
    dueTasks, 
    isLoadingIntegrations, 
    refreshIntegrations, 
    integrationActions, 
    triggerAutomation 
  } = useIntegration();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [automationEvents, setAutomationEvents] = useState<AutomationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch automation events
  useEffect(() => {
    if (!user) return;

    const fetchAutomationEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const { data, error } = await supabase
          .from('automation_events')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAutomationEvents(data || []);
      } catch (error) {
        console.error('Error fetching automation events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchAutomationEvents();

    // Subscribe to real-time automation events
    const channel = supabase
      .channel('automation_events_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'automation_events'
      }, (payload) => {
        console.log('New automation event:', payload);
        setAutomationEvents(prev => [payload.new as AutomationEvent, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getEventIcon = (eventType: string, status: string) => {
    if (status === 'processed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (status === 'triggered') return <Zap className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'default';
      case 'failed': return 'destructive';
      case 'triggered': return 'secondary';
      default: return 'outline';
    }
  };

  const handleTestAutomation = async () => {
    const testData = {
      id: 'test-' + Date.now(),
      title: 'Test Automation Task',
      description: 'This task was created via automation test',
      project_id: null
    };

    const success = await triggerAutomation('test_event', testData);
    
    if (success) {
      toast({
        title: 'Automation Triggered',
        description: 'Test automation has been triggered successfully',
      });
    } else {
      toast({
        title: 'Automation Failed',
        description: 'Failed to trigger test automation',
        variant: 'destructive'
      });
    }
  };

  const totalDueTasks = dueTasks.reduce((sum, item) => sum + item.tasksDue.length, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Integration Hub</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshIntegrations}
            disabled={isLoadingIntegrations}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingIntegrations ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Real-time integration notifications and automation status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Due Tasks Section */}
        {totalDueTasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Tasks Due Soon</h4>
              <Badge variant="secondary">{totalDueTasks}</Badge>
            </div>
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {dueTasks.map((item) => 
                  item.tasksDue.map((task) => (
                    <div key={task.id} className="text-xs p-2 bg-muted rounded flex justify-between items-center">
                      <span className="truncate">{task.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.project.name}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Integration Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Integrations</h4>
            <Badge variant="secondary">{integrationActions.length}</Badge>
          </div>
          {integrationActions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active integrations configured</p>
          ) : (
            <ScrollArea className="h-20">
              <div className="space-y-1">
                {integrationActions.map((action) => (
                  <div key={action.id} className="text-xs p-2 bg-muted rounded flex justify-between items-center">
                    <span>{action.source_app} → {action.target_app}</span>
                    <Badge variant={action.enabled ? "default" : "secondary"} className="text-xs">
                      {action.action_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Recent Automation Events */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Recent Automation Events</h4>
            <Button variant="ghost" size="sm" onClick={handleTestAutomation}>
              <Zap className="h-3 w-3 mr-1" />
              Test
            </Button>
          </div>
          {isLoadingEvents ? (
            <p className="text-xs text-muted-foreground">Loading events...</p>
          ) : automationEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No automation events yet</p>
          ) : (
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {automationEvents.map((event) => (
                  <div key={event.id} className="text-xs p-2 bg-muted rounded">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {getEventIcon(event.event_type, event.status)}
                        <span className="font-medium">{event.event_type}</span>
                      </div>
                      <Badge variant={getEventStatusColor(event.status)} className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {event.source_module} → {event.target_module}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDistanceToNow(new Date(event.triggered_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Zap className="h-3 w-3 mr-1" />
              Configure
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Bell className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationNotifications;
