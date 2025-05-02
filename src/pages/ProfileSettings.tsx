
import React from 'react';
import AppLayout from '@/components/AppLayout';
import UserProfileSettings from '@/components/UserProfileSettings';
import { useAuthContext } from '@/context/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuthContext();
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
        {user && <UserProfileSettings userId={user.id} />}
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
