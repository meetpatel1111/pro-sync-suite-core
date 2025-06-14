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
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'sv', label: 'Svenska (Swedish)' },
  { value: 'no', label: 'Norsk (Norwegian)' },
  { value: 'da', label: 'Dansk (Danish)' },
  { value: 'fi', label: 'Suomi (Finnish)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'th', label: 'ไทย (Thai)' },
];

const TIMEZONES = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/Phoenix', label: 'Arizona Time (Phoenix)' },
  { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/Sao_Paulo', label: 'Brazil Time (São Paulo)' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico City)' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)' },
  { value: 'America/Lima', label: 'Peru Time (Lima)' },
  
  // Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
  { value: 'Europe/Rome', label: 'Central European Time (Rome)' },
  { value: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
  { value: 'Europe/Brussels', label: 'Central European Time (Brussels)' },
  { value: 'Europe/Vienna', label: 'Central European Time (Vienna)' },
  { value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)' },
  { value: 'Europe/Oslo', label: 'Central European Time (Oslo)' },
  { value: 'Europe/Copenhagen', label: 'Central European Time (Copenhagen)' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time (Helsinki)' },
  { value: 'Europe/Warsaw', label: 'Central European Time (Warsaw)' },
  { value: 'Europe/Moscow', label: 'Moscow Time (Moscow)' },
  { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (Hong Kong)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (Singapore)' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (Jakarta)' },
  { value: 'Asia/Manila', label: 'Philippines Time (Manila)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (Kolkata)' },
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (Karachi)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)' },
  { value: 'Asia/Riyadh', label: 'Arabia Standard Time (Riyadh)' },
  { value: 'Asia/Tehran', label: 'Iran Standard Time (Tehran)' },
  
  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
  { value: 'Australia/Brisbane', label: 'Australian Eastern Time (Brisbane)' },
  { value: 'Australia/Perth', label: 'Australian Western Time (Perth)' },
  { value: 'Australia/Adelaide', label: 'Australian Central Time (Adelaide)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)' },
  { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
  { value: 'Africa/Johannesburg', label: 'South Africa Time (Johannesburg)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)' },
];

const CURRENCIES = [
  // Major currencies
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
  
  // Americas
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
  { value: 'MXN', label: 'Mexican Peso ($)', symbol: '$' },
  { value: 'ARS', label: 'Argentine Peso ($)', symbol: '$' },
  { value: 'CLP', label: 'Chilean Peso ($)', symbol: '$' },
  { value: 'COP', label: 'Colombian Peso ($)', symbol: '$' },
  { value: 'PEN', label: 'Peruvian Sol (S/)', symbol: 'S/' },
  
  // Europe
  { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { value: 'SEK', label: 'Swedish Krona (kr)', symbol: 'kr' },
  { value: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'kr' },
  { value: 'DKK', label: 'Danish Krone (kr)', symbol: 'kr' },
  { value: 'PLN', label: 'Polish Zloty (zł)', symbol: 'zł' },
  { value: 'CZK', label: 'Czech Koruna (Kč)', symbol: 'Kč' },
  { value: 'HUF', label: 'Hungarian Forint (Ft)', symbol: 'Ft' },
  { value: 'RUB', label: 'Russian Ruble (₽)', symbol: '₽' },
  { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺' },
  
  // Asia
  { value: 'KRW', label: 'South Korean Won (₩)', symbol: '₩' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { value: 'HKD', label: 'Hong Kong Dollar (HK$)', symbol: 'HK$' },
  { value: 'THB', label: 'Thai Baht (฿)', symbol: '฿' },
  { value: 'MYR', label: 'Malaysian Ringgit (RM)', symbol: 'RM' },
  { value: 'IDR', label: 'Indonesian Rupiah (Rp)', symbol: 'Rp' },
  { value: 'PHP', label: 'Philippine Peso (₱)', symbol: '₱' },
  { value: 'VND', label: 'Vietnamese Dong (₫)', symbol: '₫' },
  { value: 'PKR', label: 'Pakistani Rupee (Rs)', symbol: 'Rs' },
  { value: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
  { value: 'SAR', label: 'Saudi Riyal (﷼)', symbol: '﷼' },
  { value: 'ILS', label: 'Israeli Shekel (₪)', symbol: '₪' },
  
  // Africa
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
  { value: 'EGP', label: 'Egyptian Pound (£)', symbol: '£' },
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  
  // Others
  { value: 'NZD', label: 'New Zealand Dollar (NZ$)', symbol: 'NZ$' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US - 12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK - 31/12/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO - 2024-12-31)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (German - 31.12.2024)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (European - 31-12-2024)' },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (Japanese - 2024/12/31)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Long - Dec 31, 2024)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (British - 31 Dec 2024)' },
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
                  Localization & Regional Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectContent className="max-h-60">
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your preferred interface language
                        </FormDescription>
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
                          <SelectContent className="max-h-60">
                            {TIMEZONES.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your local timezone for dates and times
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectContent className="max-h-60">
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Currency for financial data and reports
                        </FormDescription>
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
                        <FormDescription>
                          How dates are displayed throughout the app
                        </FormDescription>
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
