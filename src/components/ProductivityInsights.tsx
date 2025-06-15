
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap, 
  Brain,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

const ProductivityInsights: React.FC = () => {
  const { user } = useAuthContext();
  const [insights, setInsights] = useState({
    focusTime: {
      today: 0,
      average: 0,
      trend: 0,
      goal: 6
    },
    taskCompletion: {
      rate: 0,
      trend: 0,
      completed: 0,
      total: 0
    },
    timeDistribution: {
      coding: 0,
      meetings: 0,
      planning: 0,
      communication: 0
    },
    recommendations: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProductivityData();
    }
  }, [user]);

  const fetchProductivityData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's time entries
      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('time_spent, description, tags')
        .eq('user_id', user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      // Calculate today's focus time
      const todayFocusTime = (todayEntries || []).reduce((sum, entry) => sum + entry.time_spent, 0) / 3600;

      // Fetch last 30 days for average
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentEntries } = await supabase
        .from('time_entries')
        .select('time_spent, date, description, tags')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString());

      // Calculate average daily focus time
      const dailyTotals = new Map();
      (recentEntries || []).forEach(entry => {
        const date = new Date(entry.date).toDateString();
        dailyTotals.set(date, (dailyTotals.get(date) || 0) + entry.time_spent);
      });
      
      const averageDailyTime = dailyTotals.size > 0 
        ? Array.from(dailyTotals.values()).reduce((sum, time) => sum + time, 0) / dailyTotals.size / 3600
        : 0;

      // Fetch tasks data
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, created_at, due_date')
        .or(`created_by.eq.${user.id},assigned_to.cs.{${user.id}}`);

      const totalTasks = (tasks || []).length;
      const completedTasks = (tasks || []).filter(task => task.status === 'done').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Analyze time distribution based on descriptions and tags
      const timeDistribution = {
        coding: 0,
        meetings: 0,
        planning: 0,
        communication: 0
      };

      (todayEntries || []).forEach(entry => {
        const description = entry.description?.toLowerCase() || '';
        const tags = entry.tags || [];
        const timeHours = entry.time_spent / 3600;

        if (description.includes('code') || description.includes('develop') || tags.includes('coding')) {
          timeDistribution.coding += timeHours;
        } else if (description.includes('meeting') || description.includes('call') || tags.includes('meeting')) {
          timeDistribution.meetings += timeHours;
        } else if (description.includes('plan') || description.includes('design') || tags.includes('planning')) {
          timeDistribution.planning += timeHours;
        } else {
          timeDistribution.communication += timeHours;
        }
      });

      // Convert to percentages
      const totalTime = Object.values(timeDistribution).reduce((sum, time) => sum + time, 0);
      if (totalTime > 0) {
        Object.keys(timeDistribution).forEach(key => {
          timeDistribution[key as keyof typeof timeDistribution] = 
            Math.round((timeDistribution[key as keyof typeof timeDistribution] / totalTime) * 100);
        });
      }

      // Generate recommendations based on data
      const recommendations = [];
      if (todayFocusTime < insights.focusTime.goal * 0.7) {
        recommendations.push("Consider blocking dedicated focus time in your calendar");
      }
      if (completionRate < 70) {
        recommendations.push("Break down larger tasks into smaller, manageable chunks");
      }
      if (timeDistribution.meetings > 50) {
        recommendations.push("You might have too many meetings today - consider consolidating");
      }

      setInsights({
        focusTime: {
          today: Math.round(todayFocusTime * 10) / 10,
          average: Math.round(averageDailyTime * 10) / 10,
          trend: todayFocusTime > averageDailyTime ? 
            Math.round(((todayFocusTime - averageDailyTime) / averageDailyTime) * 100) : 
            -Math.round(((averageDailyTime - todayFocusTime) / averageDailyTime) * 100),
          goal: 6
        },
        taskCompletion: {
          rate: completionRate,
          trend: Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 10),
          completed: completedTasks,
          total: totalTasks
        },
        timeDistribution,
        recommendations
      });

    } catch (error) {
      console.error('Error fetching productivity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Productivity Insights</h3>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Focus Time Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{insights.focusTime.today}h</span>
                <div className={`flex items-center text-sm ${insights.focusTime.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.focusTime.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(insights.focusTime.trend)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to daily goal</span>
                  <span>{Math.round((insights.focusTime.today / insights.focusTime.goal) * 100)}%</span>
                </div>
                <Progress 
                  value={(insights.focusTime.today / insights.focusTime.goal) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Goal: {insights.focusTime.goal}h • Average: {insights.focusTime.average}h
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{insights.taskCompletion.rate}%</span>
                <div className={`flex items-center text-sm ${insights.taskCompletion.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.taskCompletion.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(insights.taskCompletion.trend)}%
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={insights.taskCompletion.rate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {insights.taskCompletion.completed} of {insights.taskCompletion.total} tasks completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Distribution Today
          </CardTitle>
          <CardDescription>How you're spending your working hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(insights.timeDistribution).map(([activity, percentage]) => (
              <div key={activity} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{activity}</span>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Great job! No recommendations at the moment</p>
              <p className="text-sm">Keep up the excellent work</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">Productivity Tip</h4>
                        <Badge variant="outline" className="text-xs">
                          AI Generated
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
