
import React from 'react';
import AppLayout from '@/components/AppLayout';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const NotificationCenterPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your notifications, alerts, and updates in one place.
          </p>
        </div>
        <NotificationCenter />
      </div>
    </AppLayout>
  );
};

export default NotificationCenterPage;
