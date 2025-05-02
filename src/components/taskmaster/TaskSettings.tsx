import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import dbService from '@/services/dbService';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TaskSettingsProps {
  // Define any props here
}

const TaskSettings: React.FC<TaskSettingsProps> = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    auto_assign: false,
    task_auto_numbering: false,
    default_priority: 'medium',
    default_view: 'board',
    notifications_enabled: true,
    due_date_reminders: true,
    reminder_time: '9:00',
    show_completed_tasks: true,
    task_sorting: 'priority'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data: userSettings, error } = await dbService.getUserSettings(user.id);
        
        if (error) {
          throw error;
        }
        
        if (userSettings) {
          // Extract task-related settings or set defaults
          setSettings({
            auto_assign: userSettings.task_auto_numbering || false,
            task_auto_numbering: userSettings.task_auto_numbering || false,
            default_priority: 'medium',
            default_view: 'board',
            notifications_enabled: true,
            due_date_reminders: true,
            reminder_time: '9:00',
            show_completed_tasks: true,
            task_sorting: 'priority'
          });
        }
      } catch (err) {
        console.error('Error fetching task settings:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load task settings',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Save settings to the database
      await dbService.updateUserSettings(user.id, {
        task_auto_numbering: settings.task_auto_numbering,
        // Include other settings as needed
      });
      
      toast({
        title: 'Success',
        description: 'Task settings saved successfully!',
      });
    } catch (err) {
      console.error('Error saving task settings:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save task settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Settings</CardTitle>
        <CardDescription>Configure your task management preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto_assign">Auto Assign Tasks</Label>
          <Switch
            id="auto_assign"
            checked={settings.auto_assign}
            onCheckedChange={(checked) => handleSettingsChange('auto_assign', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="task_auto_numbering">Task Auto Numbering</Label>
          <Switch
            id="task_auto_numbering"
            checked={settings.task_auto_numbering}
            onCheckedChange={(checked) => handleSettingsChange('task_auto_numbering', checked)}
          />
        </div>
        <div>
          <Label htmlFor="default_priority">Default Priority</Label>
          <Select onValueChange={(value) => handleSettingsChange('default_priority', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" defaultValue={settings.default_priority} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="default_view">Default View</Label>
          <Select onValueChange={(value) => handleSettingsChange('default_view', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" defaultValue={settings.default_view} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="board">Board</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskSettings;
