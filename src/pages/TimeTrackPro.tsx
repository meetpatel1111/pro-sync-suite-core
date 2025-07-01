
import React, { useState } from 'react';
import { Clock, Play, Calendar, FileText, BarChart2, Timer, Target, TrendingUp, Activity } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TimeTrackingForm from '@/components/timetrackpro/TimeTrackingForm';
import TimeEntriesList from '@/components/timetrackpro/TimeEntriesList';
import ProductivityDashboard from '@/components/timetrackpro/ProductivityDashboard';
import ReportingTab from '@/components/timetrackpro/ReportingTab';
import TimesheetTab from '@/components/timetrackpro/TimesheetTab';

const TimeTrackPro = () => {
  const [activeTab, setActiveTab] = useState('track');

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-pink-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-violet-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-right">
              <div className="p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-heartbeat">
                <Timer className="h-8 w-8 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text animate-neon-glow">TimeTrackPro</h1>
                <p className="text-xl text-purple-100/95 font-semibold animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Professional Time Management</p>
              </div>
            </div>
            
            <p className="text-purple-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              Advanced time tracking and productivity analysis platform with intelligent insights,
              automated reporting, and comprehensive project management capabilities.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Clock className="h-5 w-5 mr-3 animate-tada" />
                Smart Time Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Activity className="h-5 w-5 mr-3 animate-tada" />
                Productivity Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Target className="h-5 w-5 mr-3 animate-tada" />
                Goal Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <TrendingUp className="h-5 w-5 mr-3 animate-tada" />
                Performance Insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Card className="shadow-2xl animate-scale-in border-0 bg-gradient-to-br from-white to-purple-50/30" style={{ animationDelay: '0.8s' }}>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-purple-200/50 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-violet-50/50 rounded-t-xl">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 p-6 bg-transparent">
                  <TabsTrigger 
                    value="track" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl px-6 py-4 transition-all duration-500 text-base font-medium hover-scale animate-jello"
                  >
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span className="hidden sm:inline">Time Tracking</span>
                    <span className="sm:hidden">Track</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="entries" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Entries</span>
                    <span className="sm:hidden">Entries</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timesheets" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Timesheets</span>
                    <span className="sm:hidden">Sheets</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reports" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Reports</span>
                    <span className="sm:hidden">Reports</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-8 bg-gradient-to-br from-white to-purple-50/20">
                <TabsContent value="track" className="space-y-6 animate-fade-in-up">
                  <TimeTrackingForm />
                </TabsContent>

                <TabsContent value="entries" className="space-y-6 animate-fade-in">
                  <TimeEntriesList />
                </TabsContent>

                <TabsContent value="timesheets" className="space-y-6 animate-fade-in">
                  <TimesheetTab />
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
                  <ProductivityDashboard />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6 animate-fade-in">
                  <ReportingTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TimeTrackPro;
