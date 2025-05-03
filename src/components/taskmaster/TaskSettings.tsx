
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthContext } from '@/context/AuthContext';
import settingsService from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

const TaskSettings = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    autoNumbering: false,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user settings
  useEffect(() => {
    if (!user?.id) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await settingsService.getUserSettings(user.id);
        if (response?.data) {
          setSettings({
            autoSave: response.data.auto_save || true,
            notifications: true,
            autoNumbering: false,
            darkMode: response.data.theme === 'dark',
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Error loading settings',
          description: 'Failed to load your task settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id, toast]);

  // Update settings
  const updateSettings = async (key: string, value: boolean) => {
    if (!user?.id) return;

    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      // Map our UI settings to the backend's expected format
      const updatedSettings: any = {};
      
      if (key === 'autoSave') {
        updatedSettings.auto_save = value;
      } else if (key === 'darkMode') {
        updatedSettings.theme = value ? 'dark' : 'light';
      }
      
      // Only update if we have a setting to update
      if (Object.keys(updatedSettings).length > 0) {
        await settingsService.updateUserSettings(user.id, updatedSettings);
        toast({
          title: 'Settings updated',
          description: 'Your task settings have been saved.',
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error updating settings',
        description: 'Failed to save your task settings.',
        variant: 'destructive',
      });
      // Revert the UI change
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Settings</CardTitle>
          <CardDescription>Configure how TaskMaster works for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-save">Auto-save task drafts</Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSettings('autoSave', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifications">Task notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings('notifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-numbering">Auto-number tasks</Label>
            <Switch
              id="auto-numbering"
              checked={settings.autoNumbering}
              onCheckedChange={(checked) => updateSettings('autoNumbering', checked)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSettings('darkMode', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskSettings;
