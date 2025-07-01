
import React from 'react';
import { Calendar, CheckSquare, Target, Zap, Users, TrendingUp, Rocket, Clock, CheckCircle, Layers } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TaskMasterMain from '@/components/taskmaster/TaskMasterMain';
import { Badge } from '@/components/ui/badge';

const TaskMaster = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-28 h-28 bg-purple-300/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
              <div className="relative p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-bounce-soft">
                <CheckSquare className="h-8 w-8 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping">
                  <CheckCircle className="h-3 w-3 text-white p-0.5" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text animate-shimmer">
                  TaskMaster
                </h1>
                <p className="text-xl text-blue-100/95 font-semibold animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                  Professional Workflow Management 
                  <Layers className="h-5 w-5 text-cyan-300 animate-wiggle" />
                </p>
              </div>
            </div>
            
            <p className="text-blue-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Advanced task and workflow management platform with multi-project support, 
              intelligent automation, and real-time collaboration capabilities for enhanced productivity.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Target className="h-5 w-5 mr-3 animate-heartbeat" />
                Multi-Project Management
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Zap className="h-5 w-5 mr-3 animate-heartbeat" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Users className="h-5 w-5 mr-3 animate-heartbeat" />
                Team Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <TrendingUp className="h-5 w-5 mr-3 animate-heartbeat" />
                Analytics & Insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <TaskMasterMain />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
