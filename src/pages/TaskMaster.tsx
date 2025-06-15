
import React from 'react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TaskMaster</h1>
            <p className="text-muted-foreground">
              Comprehensive task & workflow management with multi-project and multi-board support
            </p>
          </div>
        </div>

        <TaskMasterMain />
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
