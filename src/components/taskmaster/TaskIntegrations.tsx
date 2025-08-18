
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Plus, Link2, Calendar, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import type { Task } from '@/types/taskmaster';

interface TaskIntegrationsProps {
  task: Task;
}

const TaskIntegrations: React.FC<TaskIntegrationsProps> = ({ task }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [timeEntry, setTimeEntry] = useState({ hours: '', description: '' });
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  const logTimeForTask = async () => {
    if (!user || !timeEntry.hours) return;

    try {
      setIsLoggingTime(true);
      
      // Create time entry object with proper structure
      const timeEntryData = {
        description: timeEntry.description || `Work on ${task.title}`,
        time_spent: parseFloat(timeEntry.hours),
        project_id: task.project_id || '',
        billable: true,
      };

      // Mock time logging - replace with actual service call
      console.log('Logging time entry:', timeEntryData);
      
      toast({
        title: 'Time Logged',
        description: `${timeEntry.hours} hours logged for ${task.title}`,
      });

      setTimeEntry({ hours: '', description: '' });
    } catch (error) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error',
        description: 'Failed to log time entry',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingTime(false);
    }
  };

  const integrations = [
    {
      id: 'timetrack',
      name: 'TimeTrackPro',
      icon: Clock,
      status: 'connected',
      description: 'Track time spent on this task'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      status: 'available',
      description: 'Schedule work sessions'
    },
    {
      id: 'team',
      name: 'Team Chat',
      icon: Users,
      status: 'connected',
      description: 'Discuss task in team channels'
    },
    {
      id: 'docs',
      name: 'Documentation',
      icon: FileText,
      status: 'available',
      description: 'Create related documentation'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Time Tracking Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
          <CardDescription>
            Log time spent working on this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                placeholder="2.5"
                value={timeEntry.hours}
                onChange={(e) => setTimeEntry(prev => ({ ...prev, hours: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What did you work on?"
                value={timeEntry.description}
                onChange={(e) => setTimeEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <Button 
            onClick={logTimeForTask}
            disabled={!timeEntry.hours || isLoggingTime}
            className="w-full"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isLoggingTime ? 'Logging Time...' : 'Log Time'}
          </Button>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Available Integrations
          </CardTitle>
          <CardDescription>
            Connect this task with other apps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={integration.status === 'connected' ? 'default' : 'secondary'}
                    >
                      {integration.status}
                    </Badge>
                    {integration.status === 'available' && (
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskIntegrations;
