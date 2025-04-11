
import React, { useState, useEffect } from 'react';
import { ClockIcon, Play, Pause, Save, Plus, Trash2, BarChart2, Clock, Calendar } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import TimeTrackingForm from '@/components/timetrackpro/TimeTrackingForm';
import TimeEntriesList from '@/components/timetrackpro/TimeEntriesList';
import ProductivityDashboard from '@/components/timetrackpro/ProductivityDashboard';
import ReportingTab from '@/components/timetrackpro/ReportingTab';

const TimeTrackPro = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('track');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TimeTrackPro</h1>
            <p className="text-muted-foreground">
              Track time and maximize productivity across your projects
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Entries</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="track" className="space-y-4">
            <TimeTrackingForm />
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            <TimeEntriesList />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <ProductivityDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportingTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TimeTrackPro;
