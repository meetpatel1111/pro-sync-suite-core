
import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application settings and preferences.
          </p>
        </div>
        <SettingsForm />
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
