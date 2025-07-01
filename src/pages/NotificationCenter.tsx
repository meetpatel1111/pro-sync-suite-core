
import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle, Clock, Filter, Star } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationsPanel from '@/components/NotificationsPanel';

const NotificationCenter = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
                <p className="text-lg text-blue-100/90 font-medium">Stay Connected & Informed</p>
              </div>
            </div>
            
            <p className="text-blue-50/95 max-w-3xl mb-4 leading-relaxed">
              Centralized hub for all your notifications, alerts, and important updates.
              Never miss critical information across all your applications.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <AlertCircle className="h-4 w-4 mr-2" />
                Critical Alerts
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Info className="h-4 w-4 mr-2" />
                System Updates
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <CheckCircle className="h-4 w-4 mr-2" />
                Task Completions
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Clock className="h-4 w-4 mr-2" />
                Reminders
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg animate-scale-in">
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-xl">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 p-4 bg-transparent">
                  <TabsTrigger 
                    value="all" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <Bell className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="critical" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Critical
                  </TabsTrigger>
                  <TabsTrigger 
                    value="updates" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <Info className="h-4 w-4" />
                    Updates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="starred" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-3 transition-all duration-300 text-sm hover-scale"
                  >
                    <Star className="h-4 w-4" />
                    Starred
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="all" className="space-y-6 animate-fade-in">
                  <NotificationsPanel />
                </TabsContent>

                <TabsContent value="critical" className="space-y-6 animate-fade-in">
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold mb-2">No Critical Alerts</h3>
                    <p className="text-muted-foreground">All systems are running normally</p>
                  </div>
                </TabsContent>

                <TabsContent value="updates" className="space-y-6 animate-fade-in">
                  <div className="text-center py-12">
                    <Info className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold mb-2">System Updates</h3>
                    <p className="text-muted-foreground">No recent system updates</p>
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6 animate-fade-in">
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
                    <p className="text-muted-foreground">No completed tasks to show</p>
                  </div>
                </TabsContent>

                <TabsContent value="starred" className="space-y-6 animate-fade-in">
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-semibold mb-2">Starred Notifications</h3>
                    <p className="text-muted-foreground">No starred notifications</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationCenter;
