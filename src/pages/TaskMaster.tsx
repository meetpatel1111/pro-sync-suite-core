
import React from 'react';
import { Calendar, CheckSquare, Target, Zap } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';
import { Badge } from '@/components/ui/badge';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">TaskMaster</h1>
            </div>
            <p className="text-lg text-blue-100 max-w-2xl mb-4 leading-relaxed">
              Comprehensive task & workflow management with multi-project and multi-board support
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Target className="h-4 w-4 mr-2" />
                Multi-Project
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Zap className="h-4 w-4 mr-2" />
                Smart Workflows
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <TaskMasterMain />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
