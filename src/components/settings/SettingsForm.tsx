
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
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

const settingsSchema = z.object({
  organization_name: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
  primary_color: z.string().optional(),
  animations_enabled: z.boolean().optional(),
  ui_density: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

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

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      organization_name: '',
      timezone: '',
      language: '',
      theme: 'light',
      primary_color: '#2563eb',
      animations_enabled: true,
      ui_density: 'standard',
    },
  });

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

        // Update form with loaded values
        const formData: SettingsFormData = {
          organization_name: general.data?.find(s => s.setting_key === 'organization_name')?.setting_value || '',
          timezone: general.data?.find(s => s.setting_key === 'timezone')?.setting_value || '',
          language: general.data?.find(s => s.setting_key === 'language')?.setting_value || '',
          theme: appearance?.theme || 'light',
          primary_color: appearance?.primary_color || '#2563eb',
          animations_enabled: appearance?.animations_enabled ?? true,
          ui_density: appearance?.ui_density || 'standard',
        };
        
        form.reset(formData);
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
  }, [user, toast, form]);

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
    <Form {...form}>
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
                  <FormField
                    control={form.control}
                    name="organization_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleGeneralSettingChange('organization_name', e.target.value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Localization">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleGeneralSettingChange('timezone', value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleGeneralSettingChange('language', value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Theme</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAppearanceSettingChange({ theme: value });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleAppearanceSettingChange({ primary_color: e.target.value });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Layout">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="animations_enabled"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Animations</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                handleAppearanceSettingChange({ animations_enabled: checked });
                              }}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ui_density"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interface Density</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAppearanceSettingChange({ ui_density: value });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select density" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
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
                          <div key={`${setting.app}-${setting.setting_key}-${setting.delivery_method}`} className="flex items-center justify-between">
                            <div>
                              <Label>{setting.setting_key}</Label>
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
                        ))}
                    </div>
                    <Separator className="my-4" />
                  </SettingsSection>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your data and export options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data management options will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Form>
  );
};

export default SettingsForm;
