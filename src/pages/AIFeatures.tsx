
import React from 'react';
import AppLayout from '@/components/AppLayout';
import AIDashboard from '@/components/ai/AIDashboard';

const AIFeatures = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <AIDashboard />
      </div>
    </AppLayout>
  );
};

export default AIFeatures;
