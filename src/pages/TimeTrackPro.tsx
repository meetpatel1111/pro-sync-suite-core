
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  BarChart3, 
  Calendar,
  Timer,
  Target,
  TrendingUp,
  Zap,
  Coffee,
  Focus
} from 'lucide-react';

const TimeTrackPro = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const timeEntries = [
    {
      id: 1,
      project: "Website Redesign",
      task: "Homepage mockups",
      duration: "2h 30m",
      start: "09:00",
      end: "11:30",
      date: "2024-07-02"
    },
    {
      id: 2,
      project: "Mobile App",
      task: "User authentication",
      duration: "1h 45m",
      start: "14:00",
      end: "15:45",
      date: "2024-07-02"
    },
    {
      id: 3,
      project: "Database Optimization",
      task: "Query performance tuning",
      duration: "3h 15m",
      start: "10:00",
      end: "13:15",
      date: "2024-07-01"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TimeTrackPro
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Professional time tracking with productivity insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ColorfulButton variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </ColorfulButton>
              <ColorfulButton variant="info" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Timesheet
              </ColorfulButton>
            </div>
          </div>

          {/* Timer Section */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-100/80 via-blue-100/80 to-indigo-100/80 rounded-t-2xl">
              <CardTitle className="text-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <Timer className="h-6 w-6 text-cyan-600" />
                Active Timer
                {isTracking && (
                  <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
                    Recording
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="text-6xl font-mono font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  00:42:15
                </div>
                <Input
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  className="text-center text-lg h-12 border-2 border-cyan-200 focus:border-cyan-400 rounded-xl"
                />
                <div className="flex justify-center gap-4">
                  {!isTracking ? (
                    <ColorfulButton 
                      variant="success" 
                      size="lg"
                      onClick={() => setIsTracking(true)}
                      className="px-8"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Timer
                    </ColorfulButton>
                  ) : (
                    <>
                      <ColorfulButton 
                        variant="warning" 
                        size="lg"
                        onClick={() => setIsTracking(false)}
                        className="px-8"
                      >
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </ColorfulButton>
                      <ColorfulButton 
                        variant="accent" 
                        size="lg"
                        onClick={() => setIsTracking(false)}
                        className="px-8"
                      >
                        <Square className="h-5 w-5 mr-2" />
                        Stop
                      </ColorfulButton>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Today', value: '6h 15m', icon: Clock, color: 'from-cyan-500 to-blue-600', bg: 'from-cyan-50 to-blue-50' },
              { title: 'This Week', value: '32h 40m', icon: Target, color: 'from-indigo-500 to-purple-600', bg: 'from-indigo-50 to-purple-50' },
              { title: 'Productivity', value: '87%', icon: TrendingUp, color: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50' },
              { title: 'Focus Score', value: '9.2', icon: Focus, color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' }
            ].map((stat, index) => (
              <Card key={index} className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Coffee className="h-4 w-4 text-amber-500 animate-bounce" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Time Entries */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-cyan-100/80 via-blue-100/80 to-indigo-100/80 rounded-t-2xl">
              <CardTitle className="text-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <Clock className="h-6 w-6 text-cyan-600" />
                Recent Time Entries
                <Badge className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  {timeEntries.length} Entries
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {timeEntries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className="p-6 rounded-2xl border-2 border-gradient-to-r from-cyan-200/50 via-blue-200/50 to-indigo-200/50 bg-gradient-to-r from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{entry.project}</h3>
                        <p className="text-gray-600 mb-2">{entry.task}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{entry.date}</span>
                          <span>{entry.start} - {entry.end}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                          {entry.duration}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <ColorfulButton variant="outline" size="sm">
                            Edit
                          </ColorfulButton>
                          <ColorfulButton variant="accent" size="sm">
                            Delete
                          </ColorfulButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TimeTrackPro;
