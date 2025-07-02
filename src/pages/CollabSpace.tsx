
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CollabSpaceEnhanced from '@/components/collabspace/CollabSpaceEnhanced';

const CollabSpace = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                CollabSpace
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Real-time team communication and collaboration platform
              </p>
            </div>
          </div>
          <CollabSpaceEnhanced />
        </div>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
