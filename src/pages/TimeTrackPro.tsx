
import React, { useState } from 'react';
import { Clock, Play, Calendar, FileText, BarChart2, Timer, Target, TrendingUp, Clock4, Activity } from 'lucide-react';
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Timer className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">TimeTrackPro</h1>
                <p className="text-lg text-cyan-100/90 font-medium">Professional Time Management</p>
              </div>
            </div>
            
            <p className="text-cyan-50/95 max-w-3xl mb-4 leading-relaxed">
              Advanced time tracking and productivity analysis platform with intelligent insights,
              automated reporting, and comprehensive project management capabilities.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Clock4 className="h-4 w-4 mr-2" />
                Smart Time Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Activity className="h-4 w-4 mr-2" />
                Productivity Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Target className="h-4 w-4 mr-2" />
                Goal Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Card className="shadow-lg animate-scale-in">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-xl">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 p-4 bg-transparent">
                  <TabsTrigger 
                    value="track" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <Clock className="h-4 w-4" />
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

              <div className="p-6">
                <TabsContent value="track" className="space-y-6 animate-fade-in">
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
