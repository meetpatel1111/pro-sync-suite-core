
import React from 'react';
import AppLayout from '@/components/AppLayout';
import UserProfileSettings from '@/components/UserProfileSettings';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>
        <UserProfileSettings />
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
