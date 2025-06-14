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
import { useSettings } from '@/context/SettingsContext';

// Enhanced timezone list with UTC+ formatting
const TIMEZONES = [
  { value: 'UTC', label: 'UTC+0 (Coordinated Universal Time)', offset: '+0' },
  { value: 'Pacific/Honolulu', label: 'UTC-10 Hawaii Time (HST)', offset: '-10' },
  { value: 'America/Anchorage', label: 'UTC-9 Alaska Time (AKT)', offset: '-9' },
  { value: 'America/Los_Angeles', label: 'UTC-8 Pacific Time (PT)', offset: '-8' },
  { value: 'America/Denver', label: 'UTC-7 Mountain Time (MT)', offset: '-7' },
  { value: 'America/Chicago', label: 'UTC-6 Central Time (CT)', offset: '-6' },
  { value: 'America/New_York', label: 'UTC-5 Eastern Time (ET)', offset: '-5' },
  { value: 'America/Caracas', label: 'UTC-4 Venezuela Time', offset: '-4' },
  { value: 'America/Sao_Paulo', label: 'UTC-3 São Paulo, Brazil', offset: '-3' },
  { value: 'Atlantic/South_Georgia', label: 'UTC-2 South Georgia', offset: '-2' },
  { value: 'Atlantic/Azores', label: 'UTC-1 Azores', offset: '-1' },
  { value: 'Europe/London', label: 'UTC+0 London, UK (GMT)', offset: '+0' },
  { value: 'Europe/Paris', label: 'UTC+1 Paris, France (CET)', offset: '+1' },
  { value: 'Europe/Berlin', label: 'UTC+1 Berlin, Germany (CET)', offset: '+1' },
  { value: 'Europe/Rome', label: 'UTC+1 Rome, Italy (CET)', offset: '+1' },
  { value: 'Europe/Madrid', label: 'UTC+1 Madrid, Spain (CET)', offset: '+1' },
  { value: 'Europe/Amsterdam', label: 'UTC+1 Amsterdam, Netherlands (CET)', offset: '+1' },
  { value: 'Europe/Athens', label: 'UTC+2 Athens, Greece (EET)', offset: '+2' },
  { value: 'Europe/Istanbul', label: 'UTC+3 Istanbul, Turkey (TRT)', offset: '+3' },
  { value: 'Europe/Moscow', label: 'UTC+3 Moscow, Russia (MSK)', offset: '+3' },
  { value: 'Asia/Dubai', label: 'UTC+4 Dubai, UAE (GST)', offset: '+4' },
  { value: 'Asia/Karachi', label: 'UTC+5 Karachi, Pakistan (PKT)', offset: '+5' },
  { value: 'Asia/Kolkata', label: 'UTC+5:30 Mumbai, India (IST)', offset: '+5:30' },
  { value: 'Asia/Dhaka', label: 'UTC+6 Dhaka, Bangladesh (BST)', offset: '+6' },
  { value: 'Asia/Bangkok', label: 'UTC+7 Bangkok, Thailand (ICT)', offset: '+7' },
  { value: 'Asia/Singapore', label: 'UTC+8 Singapore (SGT)', offset: '+8' },
  { value: 'Asia/Shanghai', label: 'UTC+8 Shanghai, China (CST)', offset: '+8' },
  { value: 'Asia/Tokyo', label: 'UTC+9 Tokyo, Japan (JST)', offset: '+9' },
  { value: 'Asia/Seoul', label: 'UTC+9 Seoul, South Korea (KST)', offset: '+9' },
  { value: 'Australia/Sydney', label: 'UTC+10 Sydney, Australia (AEST)', offset: '+10' },
  { value: 'Pacific/Noumea', label: 'UTC+11 New Caledonia', offset: '+11' },
  { value: 'Pacific/Auckland', label: 'UTC+12 Auckland, New Zealand (NZST)', offset: '+12' },
  { value: 'Pacific/Tongatapu', label: 'UTC+13 Tonga', offset: '+13' },
  { value: 'Pacific/Kiritimati', label: 'UTC+14 Line Islands', offset: '+14' },
];

// Enhanced language list with more languages
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
  { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'ms', label: 'Bahasa Melayu (Malay)', flag: '🇲🇾' },
  { value: 'nl', label: 'Nederlands (Dutch)', flag: '🇳🇱' },
  { value: 'sv', label: 'Svenska (Swedish)', flag: '🇸🇪' },
  { value: 'no', label: 'Norsk (Norwegian)', flag: '🇳🇴' },
  { value: 'da', label: 'Dansk (Danish)', flag: '🇩🇰' },
  { value: 'fi', label: 'Suomi (Finnish)', flag: '🇫🇮' },
  { value: 'pl', label: 'Polski (Polish)', flag: '🇵🇱' },
  { value: 'cs', label: 'Čeština (Czech)', flag: '🇨🇿' },
  { value: 'hu', label: 'Magyar (Hungarian)', flag: '🇭🇺' },
  { value: 'ro', label: 'Română (Romanian)', flag: '🇷🇴' },
  { value: 'el', label: 'Ελληνικά (Greek)', flag: '🇬🇷' },
  { value: 'tr', label: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { value: 'he', label: 'עברית (Hebrew)', flag: '🇮🇱' },
  { value: 'fa', label: 'فارسی (Persian)', flag: '🇮🇷' },
  { value: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
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
  const { settings, updateSetting, loading, t } = useSettings();
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      organization_name: '',
      timezone: settings.timezone,
      language: settings.language,
      theme: settings.theme,
      primary_color: settings.primaryColor,
      animations_enabled: settings.animationsEnabled,
      ui_density: settings.uiDensity,
    },
  });

  React.useEffect(() => {
    form.reset({
      timezone: settings.timezone,
      language: settings.language,
      theme: settings.theme,
      primary_color: settings.primaryColor,
      animations_enabled: settings.animationsEnabled,
      ui_density: settings.uiDensity,
    });
  }, [settings, form]);

  const handleLanguageChange = async (language: string) => {
    await updateSetting('language', language);
    form.setValue('language', language);
  };

  const handleTimezoneChange = async (timezone: string) => {
    await updateSetting('timezone', timezone);
    form.setValue('timezone', timezone);
  };

  const handleThemeChange = async (theme: string) => {
    await updateSetting('theme', theme);
    form.setValue('theme', theme);
  };

  const handleColorChange = async (color: string) => {
    await updateSetting('primaryColor', color);
    form.setValue('primary_color', color);
  };

  const handleAnimationsChange = async (enabled: boolean) => {
    await updateSetting('animationsEnabled', enabled);
    form.setValue('animations_enabled', enabled);
  };

  const handleDensityChange = async (density: string) => {
    await updateSetting('uiDensity', density);
    form.setValue('ui_density', density);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">{t('loading')}</div>;
  }

  return (
    <Form {...form}>
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('general')} {t('settings')}
              </CardTitle>
              <CardDescription>
                Configure basic settings for your ProSync Suite experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title="Localization & Regional Settings">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('timezone')}
                        </FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={handleTimezoneChange}
                        >
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
                          {t('language')}
                        </FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={handleLanguageChange}
                        >
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
              <CardTitle>{t('appearance')} {t('settings')}</CardTitle>
              <CardDescription>
                Customize the look and feel of ProSync Suite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title={t('theme')}>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color {t('theme')}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={handleThemeChange}
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
                            onChange={(e) => handleColorChange(e.target.value)}
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
                              onCheckedChange={handleAnimationsChange}
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
                          onValueChange={handleDensityChange}
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
              <CardTitle>{t('notifications')} {t('settings')}</CardTitle>
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
                      {/* Filter and map notification settings for the current app */}
                      {/* Replace with actual notification settings UI */}
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
              <CardTitle>{t('security')} {t('settings')}</CardTitle>
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
