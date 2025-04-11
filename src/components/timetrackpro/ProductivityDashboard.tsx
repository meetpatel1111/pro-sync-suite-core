
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  timeSpent: number;
  date: string;
  manual: boolean;
}

const ProductivityDashboard = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  
  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setEntries(storedEntries);
  }, []);

  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App Development',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration',
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculate time by project
  const projectData = useMemo(() => {
    const projectTimes: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (!projectTimes[entry.project]) {
        projectTimes[entry.project] = 0;
      }
      projectTimes[entry.project] += entry.timeSpent;
    });
    
    return Object.entries(projectTimes).map(([project, seconds]) => ({
      name: projectMap[project] || project,
      value: Math.round(seconds / 3600 * 10) / 10 // Convert to hours with 1 decimal
    }));
  }, [entries]);

  // Calculate time by day of week
  const dailyData = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTimes: Record<string, number> = {};
    
    // Initialize all days with 0
    dayNames.forEach(day => {
      dayTimes[day] = 0;
    });
    
    entries.forEach(entry => {
      const dayOfWeek = dayNames[new Date(entry.date).getDay()];
      dayTimes[dayOfWeek] += entry.timeSpent;
    });
    
    return Object.entries(dayTimes).map(([day, seconds]) => ({
      name: day,
      hours: Math.round(seconds / 3600 * 10) / 10 // Convert to hours with 1 decimal
    }));
  }, [entries]);

  // Calculate total time tracked
  const totalHours = useMemo(() => {
    const totalSeconds = entries.reduce((sum, entry) => sum + entry.timeSpent, 0);
    return Math.round(totalSeconds / 3600 * 10) / 10;
  }, [entries]);

  // Calculate today's time
  const todayHours = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySeconds = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      })
      .reduce((sum, entry) => sum + entry.timeSpent, 0);
      
    return Math.round(todaySeconds / 3600 * 10) / 10;
  }, [entries]);

  // Calculate this week's time
  const weekHours = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekSeconds = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeek;
      })
      .reduce((sum, entry) => sum + entry.timeSpent, 0);
      
    return Math.round(weekSeconds / 3600 * 10) / 10;
  }, [entries]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow rounded">
          <p>{`${payload[0].name}: ${payload[0].value} hours`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} hrs</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayHours} hrs</div>
            <p className="text-xs text-muted-foreground">Tracked today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekHours} hrs</div>
            <p className="text-xs text-muted-foreground">Tracked this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Time by Project</CardTitle>
            <CardDescription>Hours tracked per project</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              {projectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Daily Distribution</CardTitle>
            <CardDescription>Hours tracked by day of the week</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" name="Hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductivityDashboard;
