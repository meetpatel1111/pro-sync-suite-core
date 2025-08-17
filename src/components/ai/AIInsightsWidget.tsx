import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  relevance: number;
}

const AIInsightsWidget: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Mock implementation - in real app this would use AI
      const newInsights: Insight[] = [
        {
          id: '1',
          title: 'Task Prioritization',
          description: 'Prioritize tasks based on urgency and impact',
          type: 'positive',
          relevance: 0.85
        },
        {
          id: '2',
          title: 'Time Management',
          description: 'Allocate specific time blocks for focused work',
          type: 'neutral',
          relevance: 0.70
        },
        {
          id: '3',
          title: 'Meeting Efficiency',
          description: 'Reduce unnecessary meetings and streamline discussions',
          type: 'negative',
          relevance: 0.92
        }
      ];
      setInsights(newInsights);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load AI insights',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const refreshInsights = async () => {
    if (user) {
      toast({
        title: 'Refreshing Insights',
        description: 'AI is analyzing your recent activity...',
      });
      await loadInsights();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
          </div>
          <Button variant="outline" size="sm" onClick={refreshInsights} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Personalized insights to boost your productivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">Loading insights...</div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Relevance: {Math.round(insight.relevance * 100)}%
                    </Badge>
                    <Button variant="outline" size="xs">
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
