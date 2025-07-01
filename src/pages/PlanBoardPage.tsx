
import React from 'react';
import { Calendar, BarChart3, Clock, Target, Users, TrendingUp, Map } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PlanBoard from '@/components/planboard/PlanBoard';
import { Badge } from '@/components/ui/badge';

const PlanBoardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
              <div className="p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-bounce-soft">
                <Calendar className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-100 bg-clip-text animate-shimmer">PlanBoard</h1>
                <p className="text-xl text-emerald-100/95 font-semibold animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Strategic Project Planning Hub</p>
              </div>
            </div>
            
            <p className="text-emerald-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Plan and track your projects with advanced Gantt charts, timeline views, and milestone tracking.
              Visualize dependencies, manage resources, and ensure project success with intelligent insights.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-pulse-glow">
                <BarChart3 className="h-5 w-5 mr-3 animate-wiggle" />
                Gantt Charts
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-pulse-glow">
                <Clock className="h-5 w-5 mr-3 animate-wiggle" />
                Timeline Views
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-pulse-glow">
                <Target className="h-5 w-5 mr-3 animate-wiggle" />
                Milestone Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-pulse-glow">
                <TrendingUp className="h-5 w-5 mr-3 animate-wiggle" />
                Resource Planning
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <PlanBoard />
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanBoardPage;
