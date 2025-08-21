
import React from 'react';
import AppLayout from '@/components/AppLayout';
import EnhancedTaskMaster from '@/components/taskmaster/EnhancedTaskMaster';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="animate-fade-in">
        <EnhancedTaskMaster />
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
