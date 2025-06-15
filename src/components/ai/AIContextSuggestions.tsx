
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, ArrowRight, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface ContextSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'task' | 'communication' | 'planning' | 'optimization';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

const AIContextSuggestions: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      checkApiKey();
    }
  }, [user]);

  const checkApiKey = async () => {
    if (!user) return;
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
      if (hasKey) {
        generateSuggestions();
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const generateSuggestions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const contextPrompt = `Based on a typical project management workflow, generate context-aware suggestions for improving productivity and workflow. Generate suggestions as JSON with this structure:

[
  {
    "id": "unique_id",
    "title": "suggestion title",
    "description": "detailed description",
    "category": "task|communication|planning|optimization",
    "priority": "low|medium|high",
    "actionable": true|false
  }
]

Consider current time of day, typical work patterns, and best practices. Provide 4-6 suggestions.`;

      const response = await aiService.sendChatMessage(user.id, contextPrompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const contextSuggestions = JSON.parse(cleanResponse);
        setSuggestions(Array.isArray(contextSuggestions) ? contextSuggestions : []);
      } catch (parseError) {
        // Fallback with mock suggestions if parsing fails
        setSuggestions([
          {
            id: '1',
            title: 'Review Daily Priorities',
            description: 'Take 5 minutes to review and prioritize your tasks for optimal productivity',
            category: 'planning',
            priority: 'medium',
            actionable: true
          },
          {
            id: '2',
            title: 'Schedule Team Check-in',
            description: 'Consider scheduling a brief team sync to align on current project status',
            category: 'communication',
            priority: 'low',
            actionable: true
          },
          {
            id: '3',
            title: 'Update Project Documentation',
            description: 'Ensure project documentation is current and accessible to team members',
            category: 'task',
            priority: 'medium',
            actionable: true
          }
        ]);
      }
      
      setLastUpdate(new Date());
      toast({
        title: 'Suggestions Updated',
        description: 'AI has generated new context-aware suggestions'
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate suggestions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return '📝';
      case 'communication': return '💬';
      case 'planning': return '📋';
      case 'optimization': return '⚡';
      default: return '💡';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'communication': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'optimization': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Context Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Context Suggestions requires a Google Gemini API key to provide intelligent recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Context Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                
                {suggestion.actionable && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Actionable
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ready to implement</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click refresh to get AI-powered suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContextSuggestions;
