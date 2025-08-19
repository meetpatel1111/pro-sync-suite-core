
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, Globe, Calendar, DollarSign, Timer, Home, Briefcase, User } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: '12/31/2023 (MM/DD/YYYY)' },
  { value: 'DD/MM/YYYY', label: '31/12/2023 (DD/MM/YYYY)' },
  { value: 'YYYY-MM-DD', label: '2023-12-31 (YYYY-MM-DD)' },
  { value: 'DD MMM YYYY', label: '31 Dec 2023 (DD MMM YYYY)' },
  { value: 'MMM DD, YYYY', label: 'Dec 31, 2023 (MMM DD, YYYY)' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
];

const LANDING_PAGES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'taskmaster', label: 'TaskMaster' },
  { value: 'timetrackpro', label: 'TimeTrackPro' },
  { value: 'budgetbuddy', label: 'BudgetBuddy' },
  { value: 'collabspace', label: 'CollabSpace' },
  { value: 'filevault', label: 'FileVault' },
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

export const GeneralSettingsSection = () => {
  const { settings, updateSetting, loading } = useSettings();

  const handleLanguageChange = async (language: string) => {
    await updateSetting('language', language);
  };

  const handleTimezoneChange = async (timezone: string) => {
    await updateSetting('timezone', timezone);
  };

  const handleDateFormatChange = async (format: string) => {
    await updateSetting('dateFormat', format);
  };

  const handleCurrencyChange = async (currency: string) => {
    await updateSetting('defaultCurrency', currency);
  };

  const handleSessionTimeoutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeout = parseInt(e.target.value);
    if (timeout >= 5 && timeout <= 480) {
      await updateSetting('sessionTimeout', timeout);
    }
  };

  const handleLandingPageChange = async (page: string) => {
    await updateSetting('defaultLandingPage', page);
  };

  const handleWorkingHoursChange = async (field: 'start' | 'end', time: string) => {
    if (field === 'start') {
      await updateSetting('workingHoursStart', time);
    } else {
      await updateSetting('workingHoursEnd', time);
    }
  };

  const handleWorkingDaysChange = async (day: string, checked: boolean) => {
    const currentDays = settings.workingDays || [];
    let newDays;
    
    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter(d => d !== day);
    }
    
    await updateSetting('workingDays', newDays);
  };

  const handleOrganizationNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSetting('organizationName', e.target.value);
  };

  const handleDisplayNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSetting('displayName', e.target.value);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading general settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Configure language, timezone, and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={settings.defaultCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Session & Navigation
          </CardTitle>
          <CardDescription>
            Configure session timeout and default landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={handleSessionTimeoutChange}
                placeholder="60"
              />
              <p className="text-sm text-muted-foreground">
                Between 5 and 480 minutes
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="landingPage">Default Landing Page</Label>
              <Select value={settings.defaultLandingPage} onValueChange={handleLandingPageChange}>
                <SelectTrigger id="landingPage">
                  <SelectValue placeholder="Select landing page" />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_PAGES.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours & Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours & Schedule
          </CardTitle>
          <CardDescription>
            Configure your working hours and days for better scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingHoursStart">Working Hours Start</Label>
              <Input
                id="workingHoursStart"
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workingHoursEnd">Working Hours End</Label>
              <Input
                id="workingHoursEnd"
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Working Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {WORKING_DAYS.map((day) => (
                <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.workingDays?.includes(day.value) || false}
                    onChange={(e) => handleWorkingDaysChange(day.value, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization & Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Organization & Profile
          </CardTitle>
          <CardDescription>
            Configure organization and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={settings.organizationName}
                onChange={handleOrganizationNameChange}
                placeholder="Enter organization name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={handleDisplayNameChange}
                placeholder="Enter display name"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
