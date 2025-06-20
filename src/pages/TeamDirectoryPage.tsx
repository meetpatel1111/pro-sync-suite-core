
import React from 'react';
import AppLayout from '@/components/AppLayout';
import TeamDirectory from '@/components/TeamDirectory';

const TeamDirectoryPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-2">
            Find and connect with your team members across all projects.
          </p>
        </div>
        <TeamDirectory />
      </div>
    </AppLayout>
  );
};

export default TeamDirectoryPage;
