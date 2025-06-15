
import React from 'react';
import { Calendar, CheckSquare, Target, Zap, Users, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';
import { Badge } from '@/components/ui/badge';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <CheckSquare className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  TaskMaster
                </h1>
                <p className="text-lg text-blue-100/90 font-medium">Professional Workflow Management</p>
              </div>
            </div>
            
            <p className="text-lg text-blue-50/95 max-w-3xl mb-6 leading-relaxed">
              Advanced task and workflow management platform with multi-project support, 
              intelligent automation, and real-time collaboration capabilities.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Multi-Project
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Team Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
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
