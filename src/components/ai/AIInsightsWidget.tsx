
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, Target, RefreshCw, Lightbulb } from 'lucide-react';
import { aiService, AIInsight } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

const AIInsightsWidget: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user statistics for AI analysis
      const [timeEntries, tasks, projects] = await Promise.all([
        supabase
          .from('time_entries')
          .select('time_spent, date, project')
          .eq('user_id', user.id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(100),
        
        supabase
          .from('tasks')
          .select('status, priority, created_at')
          .or(`created_by.eq.${user.id},assigned_to.cs.{${user.id}}`)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from('projects')
          .select('status, created_at')
          .eq('created_by', user.id)
      ]);

      const userStats = {
        totalTimeTracked: timeEntries.data?.reduce((sum, entry) => sum + entry.time_spent, 0) || 0,
        tasksCompleted: tasks.data?.filter(task => task.status === 'done').length || 0,
        totalTasks: tasks.data?.length || 0,
        activeProjects: projects.data?.filter(project => project.status === 'active').length || 0,
        averageTimePerDay: timeEntries.data?.length ? 
          (timeEntries.data.reduce((sum, entry) => sum + entry.time_spent, 0) / 30) : 0,
        highPriorityTasks: tasks.data?.filter(task => task.priority === 'high').length || 0
      };

      const aiInsights = await aiService.generateProductivityInsights(userStats);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: 'AI Insights Error',
        description: error instanceof Error ? error.message : 'Failed to generate insights',
        variant: 'destructive'
      });
      
      // Fallback insights
      setInsights([
        {
          type: 'productivity',
          title: 'Weekly Focus Pattern',
          description: 'Your productivity varies throughout the week',
          recommendation: 'Schedule important tasks during your peak performance hours',
          priority: 'medium'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'time_management': return <Clock className="h-4 w-4" />;
      case 'task_optimization': return <Target className="h-4 w-4" />;
      case 'project_health': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Productivity Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your work patterns and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {insights.length} insights available
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                </div>
                <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                  {insight.priority}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {insight.description}
              </p>
              
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1">Recommendation:</p>
                    <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && !isLoading && (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2" />
              <p>No insights available yet</p>
              <p className="text-xs">Work on some tasks to get AI-powered insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
