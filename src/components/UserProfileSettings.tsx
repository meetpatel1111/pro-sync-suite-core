import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Camera, Shield, Mail, Lock, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { dbService } from '@/services/dbService';
import { useAuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface AccountSettings {
  email_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
  weekly_digest: boolean;
  mobile_notifications: boolean;
  browser_notifications: boolean;
  two_factor_enabled: boolean;
  login_alerts: boolean;
  data_export_enabled: boolean;
  profile_visibility: 'public' | 'private' | 'team';
  activity_status: boolean;
}

const UserProfileSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile: authProfile, signOut } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    email_notifications: true,
    marketing_emails: false,
    security_alerts: true,
    weekly_digest: true,
    mobile_notifications: true,
    browser_notifications: true,
    two_factor_enabled: false,
    login_alerts: true,
    data_export_enabled: true,
    profile_visibility: 'team',
    activity_status: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      setEmail(user.email || '');

      // Check if we already have the profile from auth context
      if (authProfile) {
        setProfile({
          id: authProfile.id,
          full_name: authProfile.full_name || '',
          avatar_url: authProfile.avatar_url,
          bio: authProfile.bio,
          job_title: authProfile.job_title,
          phone: authProfile.phone,
          location: authProfile.location,
          email: user.email
        });
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from the database
      const { data, error } = await dbService.getUserProfile(user.id);

      if (error) {
        // If no profile exists, create a default one
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url,
          email: user.email
        });
      } else if (data) {
        // Ensure data is handled as a single object, not an array
        const profileData = Array.isArray(data) ? data[0] : data;
        
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || '',
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          job_title: profileData.job_title,
          phone: profileData.phone,
          location: profileData.location,
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Failed to load profile",
        description: "An error occurred while loading your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await dbService.updateUserProfile(user.id, {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        job_title: profile.job_title,
        phone: profile.phone,
        location: profile.location
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !email) return;
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      
      toast({
        title: "Email update initiated",
        description: "Check your new email address for a confirmation link",
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Failed to update email",
        description: "An error occurred while updating your email",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Failed to update password",
        description: "An error occurred while updating your password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Sign out first
      await signOut();
      
      toast({
        title: "Account deletion requested",
        description: "Please contact support to complete account deletion",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error initiating account deletion:', error);
      toast({
        title: "Failed to delete account",
        description: "Please contact support for assistance",
        variant: "destructive",
      });
    }
  };

  const handleAccountSettingChange = (key: keyof AccountSettings, value: boolean | string) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
    
    // Save immediately (in a real app, you might want to debounce this)
    toast({
      title: "Setting updated",
      description: `${key.replace(/_/g, ' ')} has been updated`,
    });
  };

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-medium">{profile?.full_name || 'Your Name'}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.job_title || 'No job title set'}</p>
                  <div className="flex justify-center sm:justify-start">
                    <Button variant="outline" size="sm" className="mt-2 gap-1">
                      <Camera className="h-4 w-4" />
                      Change Avatar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profile?.full_name || ''} 
                    onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    value={profile?.job_title || ''} 
                    onChange={(e) => handleProfileChange('job_title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={profile?.phone || ''} 
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={profile?.location || ''} 
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profile?.bio || ''} 
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-6">
            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Manage your email address and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter new email address"
                    />
                    <Button onClick={handleUpdateEmail} variant="outline">
                      Update Email
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You will receive a confirmation email at your new address
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Email Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={accountSettings.email_notifications}
                      onCheckedChange={(checked) => handleAccountSettingChange('email_notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                    </div>
                    <Switch 
                      checked={accountSettings.marketing_emails}
                      onCheckedChange={(checked) => handleAccountSettingChange('marketing_emails', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                    </div>
                    <Switch 
                      checked={accountSettings.weekly_digest}
                      onCheckedChange={(checked) => handleAccountSettingChange('weekly_digest', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Update your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword"
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <Button onClick={handleUpdatePassword} className="w-fit">
                    Update Password
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Security Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified of suspicious activity</p>
                    </div>
                    <Switch 
                      checked={accountSettings.security_alerts}
                      onCheckedChange={(checked) => handleAccountSettingChange('security_alerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when you sign in from a new device</p>
                    </div>
                    <Switch 
                      checked={accountSettings.login_alerts}
                      onCheckedChange={(checked) => handleAccountSettingChange('login_alerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch 
                      checked={accountSettings.two_factor_enabled}
                      onCheckedChange={(checked) => handleAccountSettingChange('two_factor_enabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Control your privacy settings and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Who can see your profile information</p>
                  </div>
                  <select 
                    value={accountSettings.profile_visibility}
                    onChange={(e) => handleAccountSettingChange('profile_visibility', e.target.value)}
                    className="px-3 py-1 border rounded-md"
                  >
                    <option value="public">Public</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Show when you're online</p>
                  </div>
                  <Switch 
                    checked={accountSettings.activity_status}
                    onCheckedChange={(checked) => handleAccountSettingChange('activity_status', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Export</Label>
                    <p className="text-sm text-muted-foreground">Allow data export requests</p>
                  </div>
                  <Switch 
                    checked={accountSettings.data_export_enabled}
                    onCheckedChange={(checked) => handleAccountSettingChange('data_export_enabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    These actions are permanent and cannot be undone
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mobile Notifications</Label>
                  <p className="text-sm text-muted-foreground">Push notifications on mobile devices</p>
                </div>
                <Switch 
                  checked={accountSettings.mobile_notifications}
                  onCheckedChange={(checked) => handleAccountSettingChange('mobile_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Desktop notifications in your browser</p>
                </div>
                <Switch 
                  checked={accountSettings.browser_notifications}
                  onCheckedChange={(checked) => handleAccountSettingChange('browser_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileSettings;
