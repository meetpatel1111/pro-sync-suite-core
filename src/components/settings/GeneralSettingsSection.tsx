
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building, Globe } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (German)' },
];

const WORKING_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const generalSettingsSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  language: z.string(),
  timezone: z.string(),
  defaultCurrency: z.string(),
  dateFormat: z.string(),
  sessionTimeout: z.number().min(15).max(480),
  defaultLandingPage: z.string(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  workingDays: z.array(z.string()),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export const GeneralSettingsSection = () => {
  const { settings, updateSetting, loading } = useSettings();

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      organizationName: settings.organizationName || '',
      displayName: settings.displayName || '',
      language: settings.language || 'en',
      timezone: settings.timezone || 'UTC',
      defaultCurrency: settings.defaultCurrency || 'USD',
      dateFormat: settings.dateFormat || 'MM/DD/YYYY',
      sessionTimeout: settings.sessionTimeout || 60,
      defaultLandingPage: settings.defaultLandingPage || 'dashboard',
      workingHoursStart: settings.workingHoursStart || '09:00',
      workingHoursEnd: settings.workingHoursEnd || '17:00',
      workingDays: settings.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
  });

  // Update form when settings change
  useEffect(() => {
    form.reset({
      organizationName: settings.organizationName || '',
      displayName: settings.displayName || '',
      language: settings.language || 'en',
      timezone: settings.timezone || 'UTC',
      defaultCurrency: settings.defaultCurrency || 'USD',
      dateFormat: settings.dateFormat || 'MM/DD/YYYY',
      sessionTimeout: settings.sessionTimeout || 60,
      defaultLandingPage: settings.defaultLandingPage || 'dashboard',
      workingHoursStart: settings.workingHoursStart || '09:00',
      workingHoursEnd: settings.workingHoursEnd || '17:00',
      workingDays: settings.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    });
  }, [settings, form]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      // Update each setting individually
      await Promise.all([
        updateSetting('organizationName', data.organizationName),
        updateSetting('displayName', data.displayName),
        updateSetting('language', data.language),
        updateSetting('timezone', data.timezone),
        updateSetting('defaultCurrency', data.defaultCurrency),
        updateSetting('dateFormat', data.dateFormat),
        updateSetting('sessionTimeout', data.sessionTimeout),
        updateSetting('defaultLandingPage', data.defaultLandingPage),
        updateSetting('workingHoursStart', data.workingHoursStart),
        updateSetting('workingHoursEnd', data.workingHoursEnd),
        updateSetting('workingDays', data.workingDays),
      ]);
    } catch (error) {
      console.error('Error saving general settings:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Configure organization-wide preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be displayed across all apps
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      How your name appears to other users
                    </FormDescription>
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Localization
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMEZONES.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DATE_FORMATS.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Working Hours & Schedule</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workingHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workingHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="workingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Days</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {WORKING_DAYS.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={day.value}
                              checked={field.value.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, day.value]);
                                } else {
                                  field.onChange(field.value.filter(d => d !== day.value));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={day.value} className="text-sm">
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="sessionTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Timeout (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        max="480" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Automatically log out after inactivity (15-480 minutes)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
