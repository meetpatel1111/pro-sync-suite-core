
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import dbService from '@/services/dbService';

interface UserProfileSettingsProps {
  userId: string;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ userId }) => {
  // Add missing state variables
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    job_title: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await dbService.getUserProfile(userId);
        
        if (error) throw error;
        
        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            job_title: data.job_title || '',
            phone: data.phone || '',
            location: data.location || ''
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data');
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    try {
      const updateData = {
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        job_title: profileData.job_title,
        phone: profileData.phone,
        location: profileData.location
      };
      
      // Update to use dbService.updateUserProfile
      const { error } = await dbService.updateUserProfile(userId, updateData);
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-20 h-20 mb-2">
              <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
              <AvatarFallback>{getInitials(profileData.full_name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  value={profileData.avatar_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={profileData.job_title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && <p className="text-destructive">{error}</p>}
          {success && <p className="text-green-500">Profile updated successfully!</p>}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileSettings;
