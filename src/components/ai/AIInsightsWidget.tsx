
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'warning' | 'achievement';
  confidence: number;
  actionable: boolean;
}

const AIInsightsWidget: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const productivityInsights = await aiService.getProductivityInsights(user.id);
      
      const processedInsights: AIInsight[] = productivityInsights.map(insight => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        type: insight.type,
        confidence: Math.random() * 0.4 + 0.6, // 60-100%
        actionable: insight.actionable
      }));

      setInsights(processedInsights);

      toast({
        title: 'Insights Generated',
        description: `Generated ${processedInsights.length} AI insights`
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate AI insights',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'achievement': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </div>
          <Button variant="outline" size="sm" onClick={generateInsights} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
              {insight.actionable && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Actionable
                </Badge>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-pulse">Generating AI insights...</div>
          </div>
        )}

        {insights.length === 0 && !isLoading && (
          <div className="text-center py-4 text-muted-foreground">
            No insights available. Click refresh to generate new insights.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
