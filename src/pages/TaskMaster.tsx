
import React from 'react';
import { Calendar, CheckSquare, Target, Zap, Users, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';
import { Badge } from '@/components/ui/badge';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  TaskMaster
                </h1>
                <p className="text-sm text-blue-100/90 font-medium">Professional Workflow Management</p>
              </div>
            </div>
            
            <p className="text-sm text-blue-50/95 max-w-2xl mb-3 leading-relaxed">
              Advanced task and workflow management platform with multi-project support, 
              intelligent automation, and real-time collaboration capabilities.
            </p>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs">
                <Target className="h-3 w-3 mr-1" />
                Multi-Project
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs">
                <Users className="h-3 w-3 mr-1" />
                Team Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analytics & Insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content with Modern Styling */}
        <div className="animate-scale-in">
          <TaskMasterMain />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
