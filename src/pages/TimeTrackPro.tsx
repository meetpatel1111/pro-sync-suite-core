
import React, { useState } from 'react';
import { Clock, Play, Calendar, FileText, BarChart2, Timer, Target, TrendingUp } from 'lucide-react';
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
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Timer className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">TimeTrackPro</h1>
            </div>
            <p className="text-sm text-indigo-100 max-w-2xl mb-3 leading-relaxed">
              Track time and maximize productivity across your projects with intelligent insights
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Target className="h-3 w-3 mr-1" />
                Smart Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analytics
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>

        {/* Compact Tabs */}
        <Card className="modern-card">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-xl">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 p-4 bg-transparent">
                  <TabsTrigger 
                    value="track" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Time Tracking</span>
                    <span className="sm:hidden">Track</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="entries" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Entries</span>
                    <span className="sm:hidden">Entries</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timesheets" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Timesheets</span>
                    <span className="sm:hidden">Sheets</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reports" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Reports</span>
                    <span className="sm:hidden">Reports</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="track" className="space-y-6 animate-fade-in-up">
                  <TimeTrackingForm />
                </TabsContent>

                <TabsContent value="entries" className="space-y-6 animate-fade-in-up">
                  <TimeEntriesList />
                </TabsContent>

                <TabsContent value="timesheets" className="space-y-6 animate-fade-in-up">
                  <TimesheetTab />
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6 animate-fade-in-up">
                  <ProductivityDashboard />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6 animate-fade-in-up">
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
