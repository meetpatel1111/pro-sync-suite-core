import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GeneralSetting,
  AppearanceSetting,
  NotificationSetting,
  SecuritySetting,
  DataSetting,
  GeneralSettingKey
} from '@/utils/dbtypes';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/hooks/useAuth';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

interface SettingsFormProps {
  defaultTab?: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ defaultTab = 'general' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Settings state
  const [generalSettings, setGeneralSettings] = React.useState<GeneralSetting[]>([]);
  const [appearanceSettings, setAppearanceSettings] = React.useState<AppearanceSetting | null>(null);
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSetting[]>([]);
  const [securitySettings, setSecuritySettings] = React.useState<SecuritySetting[]>([]);
  const [dataSettings, setDataSettings] = React.useState<DataSetting[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      setLoading(true);
      try {
        const [
          general,
          appearance,
          notifications,
          security,
          data
        ] = await Promise.all([
          settingsService.getGeneralSettings(user.id),
          settingsService.getAppearanceSettings(user.id),
          settingsService.getNotificationSettings(user.id),
          settingsService.getSecuritySettings(user.id),
          settingsService.getDataSettings(user.id)
        ]);

        setGeneralSettings(general.data || []);
        setAppearanceSettings(appearance);
        setNotificationSettings(notifications.data || []);
        setSecuritySettings(security.data || []);
        setDataSettings(data.data || []);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  const handleGeneralSettingChange = async (key: GeneralSettingKey, value: string) => {
    if (!user) return;
    try {
      await settingsService.updateGeneralSetting(user.id, key, value);
      setGeneralSettings(prev =>
        prev.map(setting =>
          setting.setting_key === key ? { ...setting, setting_value: value } : setting
        )
      );
      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  const handleAppearanceSettingChange = async (settings: Partial<AppearanceSetting>) => {
    if (!user) return;
    try {
      await settingsService.updateAppearanceSettings(user.id, settings);
      setAppearanceSettings(prev => prev ? { ...prev, ...settings } : null);
      toast({
        title: 'Success',
        description: 'Appearance settings updated',
      });
    } catch (error) {
      console.error('Error updating appearance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appearance settings',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationSettingChange = async (
    app: string,
    key: string,
    enabled: boolean,
    deliveryMethod: 'email' | 'push' | 'in-app'
  ) => {
    if (!user) return;
    try {
      await settingsService.updateNotificationSetting(user.id, app, key, enabled, deliveryMethod);
      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.app === app &&
          setting.setting_key === key &&
          setting.delivery_method === deliveryMethod
            ? { ...setting, enabled }
            : setting
        )
      );
      toast({
        title: 'Success',
        description: 'Notification setting updated',
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification setting',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading settings...</div>;
  }

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="data">Data Management</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure basic settings for your ProSync Suite experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingsSection title="Organization">
              <div className="grid gap-4">
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      value={generalSettings.find(s => s.setting_key === 'organization_name')?.setting_value || ''}
                      onChange={(e) => handleGeneralSettingChange('organization_name', e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title="Localization">
              <div className="grid gap-4">
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    value={generalSettings.find(s => s.setting_key === 'timezone')?.setting_value || ''}
                    onValueChange={(value) => handleGeneralSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={generalSettings.find(s => s.setting_key === 'language')?.setting_value || ''}
                    onValueChange={(value) => handleGeneralSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance Settings</CardTitle>
            <CardDescription>
              Customize the look and feel of ProSync Suite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingsSection title="Theme">
              <div className="grid gap-4">
                <FormItem>
                  <FormLabel>Color Theme</FormLabel>
                  <Select
                    value={appearanceSettings?.theme || 'light'}
                    onValueChange={(value) => handleAppearanceSettingChange({ theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      value={appearanceSettings?.primary_color || '#2563eb'}
                      onChange={(e) => handleAppearanceSettingChange({ primary_color: e.target.value })}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title="Layout">
              <div className="grid gap-4">
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Animations</FormLabel>
                    <Switch
                      checked={appearanceSettings?.animations_enabled}
                      onCheckedChange={(checked) =>
                        handleAppearanceSettingChange({ animations_enabled: checked })
                      }
                    />
                  </div>
                </FormItem>

                <FormItem>
                  <FormLabel>Interface Density</FormLabel>
                  <Select
                    value={appearanceSettings?.ui_density || 'standard'}
                    onValueChange={(value) => handleAppearanceSettingChange({ ui_density: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage your notification preferences for each app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {/* Group notifications by app */}
              {['CollabSpace', 'TaskMaster', 'TimeTrackPro', 'BudgetBuddy'].map((app) => (
                <SettingsSection key={app} title={app}>
                  <div className="space-y-4">
                    {notificationSettings
                      .filter((setting) => setting.app === app)
                      .map((setting) => (
                        <FormItem key={`${setting.app}-${setting.setting_key}-${setting.delivery_method}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel>{setting.setting_key}</FormLabel>
                              <Badge variant="secondary" className="ml-2">
                                {setting.delivery_method}
                              </Badge>
                            </div>
                            <Switch
                              checked={setting.enabled}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingChange(
                                  setting.app,
                                  setting.setting_key,
                                  checked,
                                  setting.delivery_method
                                )
                              }
                            />
                          </div>
                        </FormItem>
                      ))}
                  </div>
                  <Separator className="my-4" />
                </SettingsSection>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security and Data Management tabs would follow similar patterns */}
    </Tabs>
  );
};

export default SettingsForm;
