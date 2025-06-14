
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Volume2, Clock, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const APPS = [
  { id: 'taskmaster', name: 'TaskMaster', icon: '✓' },
  { id: 'timetrackpro', name: 'TimeTrackPro', icon: '⏱' },
  { id: 'budgetbuddy', name: 'BudgetBuddy', icon: '💰' },
  { id: 'collabspace', name: 'CollabSpace', icon: '💬' },
  { id: 'filevault', name: 'FileVault', icon: '📁' },
];

const NOTIFICATION_TYPES = [
  { id: 'taskAssigned', label: 'Task Assigned', description: 'When a task is assigned to you' },
  { id: 'taskDue', label: 'Task Due Soon', description: 'Reminders for upcoming deadlines' },
  { id: 'taskCompleted', label: 'Task Completed', description: 'When tasks are marked as done' },
  { id: 'mentions', label: 'Mentions', description: 'When you are mentioned in comments' },
  { id: 'fileShared', label: 'File Shared', description: 'When files are shared with you' },
  { id: 'timeTracker', label: 'Time Tracker', description: 'Session reminders and idle alerts' },
  { id: 'budgetAlerts', label: 'Budget Alerts', description: 'When budgets exceed thresholds' },
];

export const NotificationSettingsSection = () => {
  const { settings, updateSetting, updateNestedSetting, loading } = useSettings();

  const handleGlobalNotificationToggle = async (method: 'email' | 'push' | 'inapp', enabled: boolean) => {
    console.log(`Toggle global ${method} notifications:`, enabled);
    // This would typically disable/enable all notifications of this type
    // For now, we'll just log it
  };

  const handleNotificationToggle = async (type: string, method: 'email' | 'push' | 'inapp', enabled: boolean) => {
    const settingKey = method === 'email' ? 'emailNotifications' : 
                      method === 'push' ? 'pushNotifications' : 'inappNotifications';
    
    await updateNestedSetting(settingKey, type, enabled);
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    await updateSetting('quietHoursEnabled', enabled);
  };

  const handleQuietHoursTimeChange = async (field: 'start' | 'end', time: string) => {
    await updateSetting(`quietHours${field === 'start' ? 'Start' : 'End'}`, time);
  };

  const handleSoundToggle = async (enabled: boolean) => {
    await updateSetting('notificationSounds', enabled);
  };

  const handleAlertToneChange = async (tone: string) => {
    await updateSetting('alertTone', tone);
  };

  const handleWeeklyDigestToggle = async (enabled: boolean) => {
    await updateSetting('weeklyDigest', enabled);
  };

  const handleWeeklyDigestDayChange = async (day: string) => {
    await updateSetting('weeklyDigestDay', day);
  };

  const handleWeeklyDigestTimeChange = async (time: string) => {
    await updateSetting('weeklyDigestTime', time);
  };

  const testSound = () => {
    // Play a test notification sound
    if (settings.notificationSounds) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        console.log('Could not play test sound');
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global Notification Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-xs text-muted-foreground">Send to inbox</p>
                </div>
              </div>
              <Switch 
                checked={Object.values(settings.emailNotifications).some(Boolean)}
                onCheckedChange={(checked) => handleGlobalNotificationToggle('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Push</Label>
                  <p className="text-xs text-muted-foreground">Browser alerts</p>
                </div>
              </div>
              <Switch 
                checked={Object.values(settings.pushNotifications).some(Boolean)}
                onCheckedChange={(checked) => handleGlobalNotificationToggle('push', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">In-App</Label>
                  <p className="text-xs text-muted-foreground">Show in interface</p>
                </div>
              </div>
              <Switch 
                checked={Object.values(settings.inappNotifications).some(Boolean)}
                onCheckedChange={(checked) => handleGlobalNotificationToggle('inapp', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quiet Hours
            </Label>
            <p className="text-sm text-muted-foreground">
              Mute notifications during specified hours
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="quiet-start" className="text-sm">From:</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="quiet-end" className="text-sm">To:</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                  className="w-32"
                />
              </div>
              
              <Switch 
                checked={settings.quietHoursEnabled}
                onCheckedChange={handleQuietHoursToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Sound Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sound Settings
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Play notification sounds</Label>
                <Switch 
                  checked={settings.notificationSounds}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Label className="text-sm">Alert tone:</Label>
                <Select 
                  value={settings.alertTone}
                  onValueChange={handleAlertToneChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={testSound}>
                  Test
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Type Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Fine-tune notifications for each type of activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map((type) => (
              <div key={type.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <Label className="text-sm font-medium">{type.label}</Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Switch 
                      checked={settings.emailNotifications[type.id as keyof typeof settings.emailNotifications] ?? false}
                      onCheckedChange={(checked) => 
                        handleNotificationToggle(type.id, 'email', checked)
                      }
                    />
                    <Mail className="h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Switch 
                      checked={settings.pushNotifications[type.id as keyof typeof settings.pushNotifications] ?? false}
                      onCheckedChange={(checked) => 
                        handleNotificationToggle(type.id, 'push', checked)
                      }
                    />
                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Switch 
                      checked={settings.inappNotifications[type.id as keyof typeof settings.inappNotifications] ?? false}
                      onCheckedChange={(checked) => 
                        handleNotificationToggle(type.id, 'inapp', checked)
                      }
                    />
                    <Bell className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Weekly Digest
          </CardTitle>
          <CardDescription>
            Receive a summary of your productivity and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable weekly digest</Label>
                <p className="text-xs text-muted-foreground">
                  Get a summary every week
                </p>
              </div>
              <Switch 
                checked={settings.weeklyDigest}
                onCheckedChange={handleWeeklyDigestToggle}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Label className="text-sm">Send on:</Label>
              <Select 
                value={settings.weeklyDigestDay}
                onValueChange={handleWeeklyDigestDayChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                </SelectContent>
              </Select>
              
              <Label className="text-sm">at:</Label>
              <Input
                type="time"
                value={settings.weeklyDigestTime}
                onChange={(e) => handleWeeklyDigestTimeChange(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
