
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
  { id: 'task_assigned', label: 'Task Assigned', description: 'When a task is assigned to you' },
  { id: 'task_due', label: 'Task Due Soon', description: 'Reminders for upcoming deadlines' },
  { id: 'task_completed', label: 'Task Completed', description: 'When tasks are marked as done' },
  { id: 'mentions', label: 'Mentions', description: 'When you are mentioned in comments' },
  { id: 'file_shared', label: 'File Shared', description: 'When files are shared with you' },
  { id: 'time_tracker', label: 'Time Tracker', description: 'Session reminders and idle alerts' },
  { id: 'budget_alerts', label: 'Budget Alerts', description: 'When budgets exceed thresholds' },
];

export const NotificationSettingsSection = () => {
  const { settings, updateSetting } = useSettings();

  const handleNotificationToggle = async (type: string, method: 'email' | 'push' | 'inapp', enabled: boolean) => {
    console.log(`Toggle ${type} ${method} notifications:`, enabled);
    // Implementation would update the specific notification setting
  };

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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Push</Label>
                  <p className="text-xs text-muted-foreground">Browser alerts</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">In-App</Label>
                  <p className="text-xs text-muted-foreground">Show in interface</p>
                </div>
              </div>
              <Switch defaultChecked />
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
                  defaultValue="22:00"
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="quiet-end" className="text-sm">To:</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  defaultValue="08:00"
                  className="w-32"
                />
              </div>
              
              <Switch defaultChecked />
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
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center space-x-3">
                <Label className="text-sm">Alert tone:</Label>
                <Select defaultValue="default">
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
                <Button variant="outline" size="sm">
                  Test
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-App Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App-Specific Notifications</CardTitle>
          <CardDescription>
            Fine-tune notifications for each application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {APPS.map((app) => (
              <div key={app.id}>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">{app.icon}</span>
                  <Label className="text-base font-medium">{app.name}</Label>
                  <Badge variant="secondary" className="ml-auto">
                    5 active
                  </Badge>
                </div>
                
                <div className="space-y-2 pl-6">
                  {NOTIFICATION_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-sm font-medium">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Switch 
                            defaultChecked 
                            onCheckedChange={(checked) => 
                              handleNotificationToggle(type.id, 'email', checked)
                            }
                          />
                          <Mail className="h-3 w-3 text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Switch 
                            defaultChecked 
                            onCheckedChange={(checked) => 
                              handleNotificationToggle(type.id, 'push', checked)
                            }
                          />
                          <Smartphone className="h-3 w-3 text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Switch 
                            defaultChecked 
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
                
                {app.id !== APPS[APPS.length - 1].id && <Separator className="mt-4" />}
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
                  Get a summary every Monday morning
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center space-x-3">
              <Label className="text-sm">Send on:</Label>
              <Select defaultValue="monday">
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
                defaultValue="09:00"
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
