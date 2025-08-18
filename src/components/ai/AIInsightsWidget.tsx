import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  category: string;
  priority: string;
}

const insights: Insight[] = [
  {
    title: 'Optimize Resource Allocation',
    description: 'Reallocate resources to high-priority tasks to improve efficiency.',
    category: 'Resource Management',
    priority: 'High'
  },
  {
    title: 'Address Project Risks',
    description: 'Mitigate potential risks to avoid project delays and cost overruns.',
    category: 'Risk Management',
    priority: 'Medium'
  },
  {
    title: 'Improve Team Collaboration',
    description: 'Encourage team members to communicate and share knowledge effectively.',
    category: 'Team Collaboration',
    priority: 'Low'
  },
  {
    title: 'Automate Repetitive Tasks',
    description: 'Implement automation to reduce manual effort and improve accuracy.',
    category: 'Automation',
    priority: 'Medium'
  }
];

const AIInsightsWidget = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border rounded-md p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{insight.title}</h4>
              
            <Badge variant="secondary" className="text-xs">
              {insight.priority}
            </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
