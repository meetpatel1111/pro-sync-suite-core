
import React from 'react';
import { Calendar, CheckSquare, Target, Zap, Users, TrendingUp, Rocket, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';
import { Badge } from '@/components/ui/badge';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  TaskMaster
                </h1>
                <p className="text-lg text-blue-100/90 font-medium">Professional Workflow Management</p>
              </div>
            </div>
            
            <p className="text-blue-50/95 max-w-3xl mb-4 leading-relaxed">
              Advanced task and workflow management platform with multi-project support, 
              intelligent automation, and real-time collaboration capabilities.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Target className="h-4 w-4 mr-2" />
                Multi-Project Management
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Zap className="h-4 w-4 mr-2" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Users className="h-4 w-4 mr-2" />
                Team Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics & Insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          <TaskMasterMain />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
