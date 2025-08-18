import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Trophy
} from "lucide-react"

const AIProductivityCoach = () => {
  const [suggestions, setSuggestions] = useState([
    {
      type: 'improvement',
      title: 'Optimize Workflow',
      description: 'Automate repetitive tasks to save time and reduce errors.',
      details: 'Use integration actions to automate common tasks.',
    },
    {
      type: 'warning',
      title: 'Review Project Budget',
      description: 'Budget overruns detected in Project Alpha. Review expenses immediately.',
      details: 'Check BudgetBuddy for detailed expense analysis.',
    },
    {
      type: 'achievement',
      title: 'TaskMaster Completion',
      description: 'Successfully completed 10 tasks this week.',
      details: 'Keep up the great work!',
    },
    {
      type: 'improvement',
      title: 'Improve Communication',
      description: 'Increase team collaboration by using CollabSpace channels.',
      details: 'Create dedicated channels for each project.',
    },
  ]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'achievement': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          Productivity Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-md p-3">
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {suggestion.description}
                </p>
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIProductivityCoach;
