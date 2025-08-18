
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Lightbulb, 
  Target,
  Zap,
  BarChart,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  type: 'productivity' | 'performance' | 'suggestion' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  category: string;
  confidence: number;
  created_at: string;
}

const AIInsightsWidget: React.FC = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Simulate AI insights generation
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'productivity',
          title: 'Team Productivity Increase',
          description: 'Your team completed 23% more tasks this week compared to last week',
          impact: 'high',
          actionable: false,
          category: 'Performance',
          confidence: 92,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'suggestion',
          title: 'Optimize Meeting Schedule',
          description: 'Consider scheduling fewer meetings on Tuesdays to improve focus time',
          impact: 'medium',
          actionable: true,
          category: 'Time Management',
          confidence: 78,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          type: 'alert',
          title: 'High Priority Tasks Backlog',
          description: '5 high-priority tasks have been pending for more than 3 days',
          impact: 'high',
          actionable: true,
          category: 'Task Management',
          confidence: 95,
          created_at: new Date().toISOString()
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'performance':
        return <BarChart className="h-4 w-4 text-blue-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Intelligent recommendations and analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            <Zap className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                </div>
                <Badge variant={getImpactColor(insight.impact)} size="sm">
                  {insight.impact}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {insight.confidence}%
                  </span>
                  <Progress value={insight.confidence} className="w-16 h-1" />
                </div>
                
                {insight.actionable && (
                  <Button variant="ghost" size="sm">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {insights.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available</p>
            <p className="text-sm">Generate insights to see recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
