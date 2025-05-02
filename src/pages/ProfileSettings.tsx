
import React from 'react';
import AppLayout from '@/components/AppLayout';
import UserProfileSettings from '@/components/UserProfileSettings';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Please sign in to access profile settings</h2>
            <Button 
              className="mt-4"
              onClick={() => navigate('/auth')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile information and account settings
          </p>
        </div>
        
        <UserProfileSettings userId={user.id} />
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
