
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  Coffee,
  Focus,
  Calendar,
  BarChart3,
  Timer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const ProductivityDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const productivityData = [
    { day: 'Mon', focus: 85, energy: 75, tasks: 12 },
    { day: 'Tue', focus: 92, energy: 88, tasks: 15 },
    { day: 'Wed', focus: 78, energy: 65, tasks: 9 },
    { day: 'Thu', focus: 95, energy: 90, tasks: 18 },
    { day: 'Fri', focus: 88, energy: 82, tasks: 14 },
    { day: 'Sat', focus: 70, energy: 60, tasks: 6 },
    { day: 'Sun', focus: 65, energy: 55, tasks: 4 }
  ];

  const timeDistribution = [
    { name: 'Deep Work', value: 35, color: '#3b82f6' },
    { name: 'Meetings', value: 25, color: '#ef4444' },
    { name: 'Admin Tasks', value: 20, color: '#f59e0b' },
    { name: 'Communication', value: 15, color: '#10b981' },
    { name: 'Breaks', value: 5, color: '#8b5cf6' }
  ];

  const dailyGoals = [
    { title: 'Deep Work Hours', current: 4.5, target: 6, unit: 'hours' },
    { title: 'Tasks Completed', current: 12, target: 15, unit: 'tasks' },
    { title: 'Focus Score', current: 88, target: 90, unit: '%' },
    { title: 'Break Time', current: 45, target: 60, unit: 'min' }
  ];

  const insights = [
    {
      type: 'positive',
      title: 'Peak Performance Window',
      description: 'You are most productive between 9-11 AM. Consider scheduling important tasks during this time.',
      icon: TrendingUp
    },
    {
      type: 'warning',
      title: 'Meeting Overload',
      description: 'You have 40% more meetings than optimal. Consider consolidating or declining non-essential meetings.',
      icon: Calendar
    },
    {
      type: 'tip',
      title: 'Break Reminder',
      description: 'You worked 3.5 hours straight. Taking a 10-minute break can boost your focus by 25%.',
      icon: Coffee
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Focus Score</p>
                <p className="text-2xl font-bold text-blue-600">88%</p>
              </div>
              <Focus className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={88} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deep Work Time</p>
                <p className="text-2xl font-bold text-green-600">4.5h</p>
              </div>
              <Brain className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Level</p>
                <p className="text-2xl font-bold text-orange-600">82%</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={82} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-purple-600">12/15</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="focus">Focus Patterns</TabsTrigger>
          <TabsTrigger value="time">Time Distribution</TabsTrigger>
          <TabsTrigger value="goals">Daily Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Productivity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} name="Focus Score" />
                    <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} name="Energy Level" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      insight.type === 'positive' ? 'bg-green-100' :
                      insight.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <insight.icon className={`h-4 w-4 ${
                        insight.type === 'positive' ? 'text-green-600' :
                        insight.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Patterns & Deep Work Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="focus" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={timeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {timeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {timeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <Badge variant="outline">{item.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyGoals.map((goal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{goal.title}</h4>
                    <Timer className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{goal.current} {goal.unit}</span>
                      <span className="text-gray-500">/ {goal.target} {goal.unit}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} />
                    <div className="text-xs text-gray-500">
                      {goal.current >= goal.target ? '✅ Goal achieved!' : 
                       `${(goal.target - goal.current).toFixed(1)} ${goal.unit} to go`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductivityDashboard;
