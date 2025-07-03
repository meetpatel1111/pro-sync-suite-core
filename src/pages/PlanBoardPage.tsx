
import React from 'react';
import { Calendar, BarChart3, Target, Users, TrendingUp, Map, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PlanBoard from '@/components/planboard/PlanBoard';
import { Badge } from '@/components/ui/badge';

const PlanBoardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">PlanBoard</h1>
                <p className="text-lg text-orange-100/90 font-medium">Strategic Project Planning</p>
              </div>
            </div>
            
            <p className="text-orange-50/95 max-w-3xl mb-4 leading-relaxed">
              Plan and track your projects with advanced Gantt charts, timeline views, and milestone tracking.
              Visualize dependencies, manage resources, and ensure project success.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <BarChart3 className="h-4 w-4 mr-2" />
                Gantt Charts
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Map className="h-4 w-4 mr-2" />
                Timeline Views
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Target className="h-4 w-4 mr-2" />
                Milestone Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Clock className="h-4 w-4 mr-2" />
                Resource Planning
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          <PlanBoard />
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanBoardPage;
