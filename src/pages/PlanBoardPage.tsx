
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlanBoard from '@/components/planboard/PlanBoard';

const PlanBoardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">PlanBoard</h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your projects with Gantt charts and timeline views.
          </p>
        </div>
        <PlanBoard />
      </div>
    </AppLayout>
  );
};

export default PlanBoardPage;
