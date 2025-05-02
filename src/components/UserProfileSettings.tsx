
import React, { useState, useEffect } from 'react';
import dbService from '@/services/dbService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, PhoneCall, Briefcase } from 'lucide-react';

interface UserProfileSettingsProps {
  userId: string;
  showTitle?: boolean;
  compact?: boolean;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ userId, showTitle = true, compact = false }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    job_title: '',
    bio: '',
    phone: '',
    location: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!userId) return;
    
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await dbService.getUserProfile(userId);
        if (response && response.data) {
          setProfileData({
            full_name: response.data.full_name || '',
            job_title: response.data.job_title || '',
            bio: response.data.bio || '',
            phone: response.data.phone || '',
            location: response.data.location || '',
            avatar_url: response.data.avatar_url || ''
          });
        } else if (response && response.error) {
          setError(response.error.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const response = await dbService.updateUserProfile(userId, {
        full_name: profileData.full_name,
        job_title: profileData.job_title,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
      });
      
      if (response && response.error) {
        setError(response.error.message || 'Failed to update profile');
      } else {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    // Implement avatar upload logic
    // This would typically upload to storage and then update the user profile
    console.log('Avatar file:', file);
  };

  // Display a smaller version of the profile for sidebars etc.
  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profileData.avatar_url || `https://avatar.vercel.sh/${userId}.png`} alt={profileData.full_name} />
          <AvatarFallback>{profileData.full_name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{profileData.full_name || 'User'}</p>
          {profileData.job_title && <p className="text-xs text-muted-foreground">{profileData.job_title}</p>}
        </div>
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src={profileData.avatar_url || `https://avatar.vercel.sh/${userId}.png`} alt={profileData.full_name} />
                <AvatarFallback>{profileData.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div>
                <label htmlFor="avatar-upload" className="cursor-pointer text-sm text-blue-600">
                  Change avatar
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="full_name">
                <User className="inline mr-2 h-4 w-4" />
                Full Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                value={profileData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="job_title">
                <Briefcase className="inline mr-2 h-4 w-4" />
                Job Title
              </label>
              <Input
                id="job_title"
                name="job_title"
                value={profileData.job_title}
                onChange={handleChange}
                placeholder="Your job title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">
                <PhoneCall className="inline mr-2 h-4 w-4" />
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="location">
                <MapPin className="inline mr-2 h-4 w-4" />
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                placeholder="Your location"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bio">Bio</label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            
            {error && <div className="text-sm text-red-500">{error}</div>}
            
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileSettings;
