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
import { Globe, Clock } from 'lucide-react';
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

// Comprehensive timezone list
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'America/Toronto', label: 'Toronto, Canada' },
  { value: 'America/Vancouver', label: 'Vancouver, Canada' },
  { value: 'America/Mexico_City', label: 'Mexico City, Mexico' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina' },
  { value: 'Europe/London', label: 'London, UK' },
  { value: 'Europe/Paris', label: 'Paris, France' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany' },
  { value: 'Europe/Rome', label: 'Rome, Italy' },
  { value: 'Europe/Madrid', label: 'Madrid, Spain' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam, Netherlands' },
  { value: 'Europe/Brussels', label: 'Brussels, Belgium' },
  { value: 'Europe/Zurich', label: 'Zurich, Switzerland' },
  { value: 'Europe/Vienna', label: 'Vienna, Austria' },
  { value: 'Europe/Warsaw', label: 'Warsaw, Poland' },
  { value: 'Europe/Prague', label: 'Prague, Czech Republic' },
  { value: 'Europe/Budapest', label: 'Budapest, Hungary' },
  { value: 'Europe/Bucharest', label: 'Bucharest, Romania' },
  { value: 'Europe/Sofia', label: 'Sofia, Bulgaria' },
  { value: 'Europe/Athens', label: 'Athens, Greece' },
  { value: 'Europe/Istanbul', label: 'Istanbul, Turkey' },
  { value: 'Europe/Moscow', label: 'Moscow, Russia' },
  { value: 'Europe/Kiev', label: 'Kiev, Ukraine' },
  { value: 'Europe/Stockholm', label: 'Stockholm, Sweden' },
  { value: 'Europe/Oslo', label: 'Oslo, Norway' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen, Denmark' },
  { value: 'Europe/Helsinki', label: 'Helsinki, Finland' },
  { value: 'Africa/Cairo', label: 'Cairo, Egypt' },
  { value: 'Africa/Lagos', label: 'Lagos, Nigeria' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi, Kenya' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE' },
  { value: 'Asia/Riyadh', label: 'Riyadh, Saudi Arabia' },
  { value: 'Asia/Tehran', label: 'Tehran, Iran' },
  { value: 'Asia/Karachi', label: 'Karachi, Pakistan' },
  { value: 'Asia/Mumbai', label: 'Mumbai, India' },
  { value: 'Asia/Delhi', label: 'Delhi, India' },
  { value: 'Asia/Kolkata', label: 'Kolkata, India' },
  { value: 'Asia/Dhaka', label: 'Dhaka, Bangladesh' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Thailand' },
  { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur, Malaysia' },
  { value: 'Asia/Manila', label: 'Manila, Philippines' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China' },
  { value: 'Asia/Beijing', label: 'Beijing, China' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
  { value: 'Asia/Seoul', label: 'Seoul, South Korea' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia' },
  { value: 'Australia/Melbourne', label: 'Melbourne, Australia' },
  { value: 'Australia/Brisbane', label: 'Brisbane, Australia' },
  { value: 'Australia/Perth', label: 'Perth, Australia' },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
];

// Comprehensive language list
const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
  { value: 'fr', label: 'Français (French)', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano (Italian)', flag: '🇮🇹' },
  { value: 'pt', label: 'Português (Portuguese)', flag: '🇵🇹' },
  { value: 'ru', label: 'Русский (Russian)', flag: '🇷🇺' },
  { value: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
  { value: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { value: 'ko', label: '한국어 (Korean)', flag: '🇰🇷' },
  { value: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { value: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { value: 'th', label: 'ไทย (Thai)', flag: '🇹🇭' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { value: 'id', label: 'Bahasa Indonesia (Indonesian)', flag: '🇮🇩' },
  { value: 'ms', label: 'Bahasa Melayu (Malay)', flag: '🇲🇾' },
  { value: 'tl', label: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { value: 'nl', label: 'Nederlands (Dutch)', flag: '🇳🇱' },
  { value: 'sv', label: 'Svenska (Swedish)', flag: '🇸🇪' },
  { value: 'no', label: 'Norsk (Norwegian)', flag: '🇳🇴' },
  { value: 'da', label: 'Dansk (Danish)', flag: '🇩🇰' },
  { value: 'fi', label: 'Suomi (Finnish)', flag: '🇫🇮' },
  { value: 'pl', label: 'Polski (Polish)', flag: '🇵🇱' },
  { value: 'cs', label: 'Čeština (Czech)', flag: '🇨🇿' },
  { value: 'sk', label: 'Slovenčina (Slovak)', flag: '🇸🇰' },
  { value: 'hu', label: 'Magyar (Hungarian)', flag: '🇭🇺' },
  { value: 'ro', label: 'Română (Romanian)', flag: '🇷🇴' },
  { value: 'bg', label: 'Български (Bulgarian)', flag: '🇧🇬' },
  { value: 'hr', label: 'Hrvatski (Croatian)', flag: '🇭🇷' },
  { value: 'sr', label: 'Српски (Serbian)', flag: '🇷🇸' },
  { value: 'sl', label: 'Slovenščina (Slovenian)', flag: '🇸🇮' },
  { value: 'et', label: 'Eesti (Estonian)', flag: '🇪🇪' },
  { value: 'lv', label: 'Latviešu (Latvian)', flag: '🇱🇻' },
  { value: 'lt', label: 'Lietuvių (Lithuanian)', flag: '🇱🇹' },
  { value: 'el', label: 'Ελληνικά (Greek)', flag: '🇬🇷' },
  { value: 'tr', label: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { value: 'he', label: 'עברית (Hebrew)', flag: '🇮🇱' },
  { value: 'fa', label: 'فارسی (Persian)', flag: '🇮🇷' },
  { value: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
  { value: 'bn', label: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { value: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { value: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { value: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { value: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { value: 'ne', label: 'नेपाली (Nepali)', flag: '🇳🇵' },
  { value: 'si', label: 'සිංහල (Sinhala)', flag: '🇱🇰' },
  { value: 'my', label: 'မြန်မာ (Myanmar)', flag: '🇲🇲' },
  { value: 'km', label: 'ខ្មែរ (Khmer)', flag: '🇰🇭' },
  { value: 'lo', label: 'ລາວ (Lao)', flag: '🇱🇦' },
  { value: 'ka', label: 'ქართული (Georgian)', flag: '🇬🇪' },
  { value: 'hy', label: 'Հայերեն (Armenian)', flag: '🇦🇲' },
  { value: 'az', label: 'Azərbaycan (Azerbaijani)', flag: '🇦🇿' },
  { value: 'kk', label: 'Қазақша (Kazakh)', flag: '🇰🇿' },
  { value: 'ky', label: 'Кыргызча (Kyrgyz)', flag: '🇰🇬' },
  { value: 'uz', label: 'O\'zbek (Uzbek)', flag: '🇺🇿' },
  { value: 'tj', label: 'Тоҷикӣ (Tajik)', flag: '🇹🇯' },
  { value: 'mn', label: 'Монгол (Mongolian)', flag: '🇲🇳' },
];

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
      timezone: 'UTC',
      language: 'en',
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
          timezone: general.data?.find(s => s.setting_key === 'timezone')?.setting_value || 'UTC',
          language: general.data?.find(s => s.setting_key === 'language')?.setting_value || 'en',
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
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
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
                            placeholder="Enter your organization name"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Localization & Regional Settings">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timezone
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-[200px]">
                              {TIMEZONES.map((timezone) => (
                                <SelectItem key={timezone.value} value={timezone.value}>
                                  {timezone.label}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          All timestamps will be displayed in your selected timezone
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-[200px]">
                              {LANGUAGES.map((language) => (
                                <SelectItem key={language.value} value={language.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{language.flag}</span>
                                    <span>{language.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Interface language for the application
                        </FormDescription>
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
