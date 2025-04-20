
import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { dbService } from '@/services/dbService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  Key,
  Download,
  Trash2
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/useAuth';

const UserSettings = () => {
  // Move all hooks to the top
  const { settings, setSettings, saveSettings } = useSettings();
  const [settingsLoading, setSettingsLoading] = React.useState(false);
  const { user, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug logging
  // console.log('UserSettings context:', { settings, loading });

  if (settingsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span>Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: 32 }}>
        <h2>Error loading settings</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!settings || Object.keys(settings).length === 0) {
    return (
      <div style={{ color: 'orange', padding: 32 }}>
        <h2>No settings found for your account.</h2>
        <p>Please contact support or try reloading the page.</p>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setError(null);
    try {
      await saveSettings(settings);
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully',
      });
    } catch (e) {
      setError('Failed to save settings.');
      toast({
        title: 'Save failed',
        description: 'Could not save your settings.',
        variant: 'destructive',
      });
    }
  };

  // Export actions
  const handleExport = async (type: 'csv' | 'json') => {
    if (!user?.id) return;
    setSettingsLoading(true);
    setError(null);
    try {
      // Fetch user profile, settings, and tasks
      const [settingsRes, tasksRes, profileRes] = await Promise.all([
        dbService.getUserSettings(user.id),
        dbService.getTaskSettings ? dbService.getTaskSettings(user.id) : { data: null },
        dbService.getUserProfile ? dbService.getUserProfile(user.id) : { data: null },
      ]);
      const exportData = {
        settings: settingsRes.data,
        tasks: tasksRes.data,
        profile: profileRes.data,
      };
      let fileContent = '', mime = '', fileName = '';
      if (type === 'json') {
        fileContent = JSON.stringify(exportData, null, 2);
        mime = 'application/json';
        fileName = 'user_data.json';
      } else {
        // CSV: flatten settings/tasks/profile for CSV export
        const flatten = (obj: any) => Object.entries(obj || {}).map(([k, v]) => `${k},${v}`).join('\n');
        fileContent =
          'Settings\n' + flatten(exportData.settings) +
          '\n\nTasks\n' + flatten(exportData.tasks) +
          '\n\nProfile\n' + flatten(exportData.profile);
        mime = 'text/csv';
        fileName = 'user_data.csv';
      }
      // Download
      const blob = new Blob([fileContent], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Export', description: `Exported your data as ${type.toUpperCase()}.` });
    } catch (err) {
      setError('Failed to export data.');
      toast({ title: 'Export failed', description: 'Could not export your data.', variant: 'destructive' });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Account deletion
  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setSettingsLoading(true);
    setError(null);
    try {
      // Remove from user_settings, task_settings, user_profiles, and Supabase auth
      await dbService.updateUserSettings(user.id, { deleted: true });
      if (dbService.updateTaskSettings) await dbService.updateTaskSettings(user.id, { deleted: true });
      // No 'deleted' field in user_profiles; skip this update.
// if (dbService.updateUserProfile) await dbService.updateUserProfile(user.id, { deleted: true });
      // Remove from Supabase auth
      if (window && window.supabase) {
        await window.supabase.auth.admin.deleteUser(user.id);
      }
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been deleted.',
        variant: 'destructive',
      });
      setTimeout(() => window.location.href = '/', 2000);
    } catch (err) {
      setError('Failed to delete account.');
      toast({ title: 'Delete failed', description: 'Could not delete your account.', variant: 'destructive' });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Security actions
  const handleUpdatePassword = async () => {
    if (!user?.id) return;
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSettingsLoading(true);
    try {
      if (window && window.supabase) {
        const { error } = await window.supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      toast({ title: 'Password Updated', description: 'Your password has been updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password.');
      toast({ title: 'Update failed', description: 'Could not update your password.', variant: 'destructive' });
    } finally {
      setSettingsLoading(false);
    }
  };
  const handleSignOutAll = () => {
    toast({ title: 'Signed Out', description: 'Signed out from all other devices.' });
  };

  if (settingsLoading || loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences and account settings
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your general settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" type="text" value={settings.organizationName || ''} onChange={e => setSettings({ ...settings, organizationName: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="defaultDashboard">Default Dashboard</Label>
                  <Input id="defaultDashboard" type="text" value={settings.defaultDashboard || ''} onChange={e => setSettings({ ...settings, defaultDashboard: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input id="defaultCurrency" type="text" value={settings.defaultCurrency || ''} onChange={e => setSettings({ ...settings, defaultCurrency: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="enableClientPortal" checked={!!settings.enableClientPortal} onCheckedChange={checked => setSettings({ ...settings, enableClientPortal: !!checked })} />
                  <Label htmlFor="enableClientPortal">Enable Client Portal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="autoSaveInterval">Auto Save Interval</Label>
                  <Input id="autoSaveInterval" type="number" value={settings.autoSaveInterval || 0} onChange={e => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) || 0 })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme Mode</h3>
                  <Select
  value={settings.themeMode || 'system'}
  onValueChange={v => {
    if (v === 'system' || v === 'light' || v === 'dark') {
      setSettings({ ...settings, themeMode: v });
    }
  }}
>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Theme Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">
                        <Moon className="inline h-4 w-4 mr-1" /> System
                      </SelectItem>
                      <SelectItem value="light">
                        <Sun className="inline h-4 w-4 mr-1" /> Light
                      </SelectItem>
                      <SelectItem value="dark">
                        <Moon className="inline h-4 w-4 mr-1" /> Dark
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4 pt-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" type="color" value={settings.primaryColor || '#000000'} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 p-0 border-none bg-transparent" />
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Input id="accentColor" type="color" value={settings.accentColor || '#000000'} onChange={e => setSettings({ ...settings, accentColor: e.target.value })} className="w-10 h-10 p-0 border-none bg-transparent" />
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="sidebarLayout">Sidebar Layout</Label>
                  <Select value={settings.sidebarLayout || 'compact'} onValueChange={val => setSettings({ ...settings, sidebarLayout: val })}>
                    <SelectTrigger id="sidebarLayout">
                      <SelectValue placeholder="Select sidebar layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="fontSelection">Font</Label>
                  <Select value={settings.fontSelection || 'system'} onValueChange={val => setSettings({ ...settings, fontSelection: val })}>
                    <SelectTrigger id="fontSelection">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="avatarDisplayOption">Avatar Display</Label>
                  <Select value={settings.avatarDisplayOption || 'image'} onValueChange={val => setSettings({ ...settings, avatarDisplayOption: val })}>
                    <SelectTrigger id="avatarDisplayOption">
                      <SelectValue placeholder="Select avatar display" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="initials">Initials</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="interfaceAnimation" checked={!!settings.interfaceAnimation} onCheckedChange={checked => setSettings({ ...settings, interfaceAnimation: !!checked })} />
                  <Label htmlFor="interfaceAnimation">Enable Interface Animation</Label>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="interfaceSpacing">Interface Spacing</Label>
                  <Select value={settings.interfaceSpacing || 'comfortable'} onValueChange={val => setSettings({ ...settings, interfaceSpacing: val })}>
                    <SelectTrigger id="interfaceSpacing">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="headerBehavior">Header Behavior</Label>
                  <Select value={settings.headerBehavior || 'fixed'} onValueChange={val => setSettings({ ...settings, headerBehavior: val })}>
                    <SelectTrigger id="headerBehavior">
                      <SelectValue placeholder="Select header behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="scroll">Scroll with Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notificationEmail">Email Notifications</Label>
                  <Switch id="notificationEmail" checked={!!settings.notificationEmail} onCheckedChange={async checked => { setSettings({ ...settings, notificationEmail: !!checked }); await saveSettings({ notificationEmail: !!checked }); }} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notificationPush">Push Notifications</Label>
                  <Switch id="notificationPush" checked={!!settings.notificationPush} onCheckedChange={async checked => { setSettings({ ...settings, notificationPush: !!checked }); await saveSettings({ notificationPush: !!checked }); }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword-settings">Current Password</Label>
                    <Input type="password" id="currentPassword-settings" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword-settings">New Password</Label>
                    <Input type="password" id="newPassword-settings" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword-settings">Confirm New Password</Label>
                    <Input type="password" id="confirmPassword-settings" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={loading}>
                    <Key className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhance your account security by enabling two-factor authentication.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require a verification code when logging in
                      </p>
                    </div>
                    <Switch id="twoFactor" checked={!!settings.twoFactor} onCheckedChange={checked => setSettings({ ...settings, twoFactor: !!checked })} />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions and sign out from other devices.
                  </p>
                  <Button variant="outline" onClick={handleSignOutAll} disabled={settingsLoading}>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign Out From All Other Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your data and exports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Export Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in standard formats for backup or transfer.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => handleExport('csv')} disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('json')} disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as JSON
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Data Privacy</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dataCollection" checked={!!settings.dataCollection} onCheckedChange={checked => setSettings({ ...settings, dataCollection: !!checked })} />
                    <Label htmlFor="dataCollection">Allow usage data collection to improve services</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="thirdPartySharing" checked={!!settings.thirdPartySharing} onCheckedChange={checked => setSettings({ ...settings, thirdPartySharing: !!checked })} />
                    <Label htmlFor="thirdPartySharing">Share data with third-party services</Label>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserSettings;
