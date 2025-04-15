import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const UserProfileSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your profile",
          variant: "destructive",
        });
        setIsLoading(false);
        
        // Set default profile for demo when not authenticated
        setProfile({
          id: 'demo-user',
          full_name: 'Demo User',
          email: 'demo@example.com',
          job_title: 'Software Developer',
          avatar_url: ''
        });
        return;
      }

      setEmail(userData.user.email || '');

      // Check if user_profiles table exists first
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'user_profiles');

      if (tableError || !tableInfo || tableInfo.length === 0) {
        console.log('user_profiles table not found, falling back to profiles table');
        
        // Try the original profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            id: data.id,
            full_name: data.full_name || '',
            avatar_url: data.avatar_url,
            // Other fields will be undefined
          });
        } else {
          // Create a default profile
          setProfile({
            id: userData.user.id,
            full_name: userData.user.user_metadata?.full_name || '',
            avatar_url: userData.user.user_metadata?.avatar_url,
            email: userData.user.email
          });
        }
      } else {
        // Try to fetch from user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data as UserProfile);
        } else {
          // Create a default profile
          setProfile({
            id: userData.user.id,
            full_name: userData.user.user_metadata?.full_name || '',
            avatar_url: userData.user.user_metadata?.avatar_url,
            email: userData.user.email
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Failed to load profile",
        description: "An error occurred while loading your profile",
        variant: "destructive",
      });
      
      // Set a default profile for demo
      setProfile({
        id: 'demo-user',
        full_name: 'Demo User',
        email: 'demo@example.com',
        job_title: 'Software Developer',
        avatar_url: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to update your profile",
          variant: "destructive",
        });
        return;
      }

      // Check if user_profiles table exists
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'user_profiles');

      if (tableError || !tableInfo || tableInfo.length === 0) {
        // Fall back to profiles table
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userData.user.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          });

        if (error) throw error;
      } else {
        // Use user_profiles table
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: userData.user.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            job_title: profile.job_title,
            phone: profile.phone,
            location: profile.location,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
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
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Account settings will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Notification settings will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileSettings;
