
import React from 'react';
import AppLayout from '@/components/AppLayout';
import TeamDirectory from '@/components/teamdirectory/TeamDirectory';

const TeamDirectoryPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-2">
            Connect with your team members and manage organizational structure.
          </p>
        </div>
        <TeamDirectory />
      </div>
    </AppLayout>
  );
};

export default TeamDirectoryPage;
