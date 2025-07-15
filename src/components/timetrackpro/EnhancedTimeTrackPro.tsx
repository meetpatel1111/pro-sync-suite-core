
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar, 
  BarChart3, 
  Target,
  Timer,
  TrendingUp,
  Users,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedTimeTrackPro: React.FC = () => {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  // Sample data
  const todayStats = {
    totalHours: 7.5,
    billableHours: 6.2,
    efficiency: 87,
    focusTime: 5.8
  };

  const recentEntries = [
    { id: 1, project: 'ProSync Dashboard', task: 'UI Development', duration: '2h 30m', status: 'completed' },
    { id: 2, project: 'Client Portal', task: 'Bug Fixes', duration: '1h 45m', status: 'completed' },
    { id: 3, project: 'API Integration', task: 'Testing', duration: '3h 15m', status: 'completed' },
  ];

  const weeklyData = [
    { day: 'Mon', hours: 8.2, billable: 7.1 },
    { day: 'Tue', hours: 7.8, billable: 6.9 },
    { day: 'Wed', hours: 8.5, billable: 7.8 },
    { day: 'Thu', hours: 7.2, billable: 6.2 },
    { day: 'Fri', hours: 6.8, billable: 5.9 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setActiveProject('Current Task');
    toast({
      title: 'Time tracking started',
      description: 'Timer is now running for your current task.',
    });
  };

  const handlePauseTracking = () => {
    setIsTracking(false);
    toast({
      title: 'Time tracking paused',
      description: 'Timer has been paused. Click play to resume.',
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setCurrentTime(0);
    setActiveProject(null);
    toast({
      title: 'Time tracking stopped',
      description: 'Time entry has been saved successfully.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header with Beautiful Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
              <Timer className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">TimeTrack Pro</h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Advanced time tracking and productivity analytics
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              Smart Tracking
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Productivity Insights
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Timer Card */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Current Session</CardTitle>
          {activeProject && (
            <Badge variant="outline" className="mx-auto mt-2">
              {activeProject}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold text-gray-800 tracking-wider">
            {formatTime(currentTime)}
          </div>
          
          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button 
                onClick={handleStartTracking}
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handlePauseTracking}
                  variant="outline" 
                  size="lg"
                  className="px-8"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={handleStopTracking}
                  variant="destructive" 
                  size="lg"
                  className="px-8"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Hours</p>
                <p className="text-3xl font-bold text-blue-800">{todayStats.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Billable Hours</p>
                <p className="text-3xl font-bold text-emerald-800">{todayStats.billableHours}</p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Efficiency</p>
                <p className="text-3xl font-bold text-purple-800">{todayStats.efficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Focus Time</p>
                <p className="text-3xl font-bold text-orange-800">{todayStats.focusTime}h</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs Section */}
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="entries" className="rounded-lg">Recent Entries</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg">Projects</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{entry.project}</h4>
                      <p className="text-sm text-gray-600">{entry.task}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-800">{entry.duration}</p>
                      <Badge variant="secondary" className="text-xs">
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${(day.hours / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-gray-600">{day.hours}h</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {day.billable}h billable
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Project Management</h3>
                <p className="text-muted-foreground">
                  Organize your time tracking by projects and clients
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Time Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Detailed Reports</h3>
                <p className="text-muted-foreground">
                  Generate comprehensive time tracking reports and insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTimeTrackPro;
