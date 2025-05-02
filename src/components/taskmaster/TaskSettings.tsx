import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const defaultSettings = {
  auto_assign: true,
  task_auto_numbering: true,
  default_priority: 'medium',
  default_view: 'kanban',
  notifications_enabled: true,
  due_date_reminders: true,
  reminder_time: '1d',
  show_completed_tasks: true,
  task_sorting: 'priority',
};

const TaskSettings = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await dbService.getUserSettings(user.id);
      if (error) throw error;
      
      if (data) {
        setSettings(data);
      } else {
        const { data: newSettings, error: createError } = await dbService.createUserSettings(user.id, defaultSettings);
        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching task settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !settings) return;
    
    setSaving(true);
    try {
      const { error } = await dbService.updateUserSettings(user.id, settings);
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Settings</CardTitle>
        <CardDescription>Configure your task management preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">General Settings</h3>
            <p className="text-sm text-muted-foreground">Configure how tasks are created and displayed</p>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Auto-assign to me</h3>
                  <p className="text-sm text-muted-foreground">New tasks are automatically assigned to you</p>
                </div>
                <Switch 
                  checked={settings?.auto_assign || false}
                  onCheckedChange={(checked: boolean) => updateSetting('auto_assign', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Auto-number tasks</h3>
                  <p className="text-sm text-muted-foreground">Tasks are automatically numbered sequentially</p>
                </div>
                <Switch 
                  checked={settings?.task_auto_numbering || false}
                  onCheckedChange={(checked: boolean) => updateSetting('task_auto_numbering', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-priority">Default Priority</Label>
                <Select 
                  value={settings?.default_priority || 'medium'} 
                  onValueChange={(value) => updateSetting('default_priority', value)}
                >
                  <SelectTrigger id="default-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select 
                  value={settings?.default_view || 'kanban'} 
                  onValueChange={(value) => updateSetting('default_view', value)}
                >
                  <SelectTrigger id="default-view">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="gantt">Gantt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-sorting">Default Sorting</Label>
                <Select 
                  value={settings?.task_sorting || 'priority'} 
                  onValueChange={(value) => updateSetting('task_sorting', value)}
                >
                  <SelectTrigger id="task-sorting">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="created_at">Creation Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">Configure task notifications and reminders</p>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Task notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications for task updates</p>
                </div>
                <Switch 
                  checked={settings?.notifications_enabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting('notifications_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Due date reminders</h3>
                  <p className="text-sm text-muted-foreground">Receive reminders before tasks are due</p>
                </div>
                <Switch 
                  checked={settings?.due_date_reminders || false}
                  onCheckedChange={(checked: boolean) => updateSetting('due_date_reminders', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Select 
                  value={settings?.reminder_time || '1d'} 
                  onValueChange={(value) => updateSetting('reminder_time', value)}
                  disabled={!settings?.due_date_reminders}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30m">30 minutes before</SelectItem>
                    <SelectItem value="1h">1 hour before</SelectItem>
                    <SelectItem value="3h">3 hours before</SelectItem>
                    <SelectItem value="1d">1 day before</SelectItem>
                    <SelectItem value="2d">2 days before</SelectItem>
                    <SelectItem value="1w">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Display</h3>
            <p className="text-sm text-muted-foreground">Configure how tasks are displayed</p>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Show completed tasks</h3>
                  <p className="text-sm text-muted-foreground">Display completed tasks in task lists</p>
                </div>
                <Switch 
                  checked={settings?.show_completed_tasks || false}
                  onCheckedChange={(checked: boolean) => updateSetting('show_completed_tasks', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskSettings;
