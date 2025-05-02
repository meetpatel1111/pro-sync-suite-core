
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import dbService from '@/services/dbService';
import { Moon, Sun } from 'lucide-react';

// Define a type for the theme
type ThemeType = 'light' | 'dark' | 'system';

const UserSettings = () => {
  const { user, profile, setProfile } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [taskSettings, setTaskSettings] = useState<any>({});
  const [theme, setTheme] = useState<ThemeType>('system');
  const [language, setLanguage] = useState('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }

    const storedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(storedLanguage);

    const storedNotificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    setNotificationsEnabled(storedNotificationsEnabled);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  const updateProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    try {
      const profileData = {
        bio,
        avatar_url: avatarUrl,
        name,
        email,
      };

      const response = await dbService.updateUserProfile(user.id, profileData);

      if (!response.error && response.data) {
        setProfile(response.data[0]);
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Could not update profile',
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    
    setSettingsLoading(true);
    try {
      const response = await dbService.getUserSettings(user.id);
      if (response && !response.error) {
        setTaskSettings(response.data || {});
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: 'Error',
        description: 'Could not load user settings',
        variant: 'destructive',
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSave = async (settings: any) => {
    try {
      const result = await dbService.updateUserSettings(user.id, settings);
      if (!result.error) {
        setTaskSettings(settings);
        toast({
          title: 'Settings updated',
          description: 'Your user settings have been updated',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not update settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast({
        title: 'Error',
        description: 'Could not save user settings',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Fix the theme handling by providing a type-safe handler
  const handleThemeChange = (value: string) => {
    setTheme(value as ThemeType);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and account settings
            </p>
          </div>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="A short bio about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  placeholder="URL to your avatar image"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
              <Button onClick={updateProfile} disabled={profileLoading}>
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    {/* Add more languages here */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => setNotificationsEnabled(checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserSettings;
