
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Plus, Clock, Target, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, TaskSuggestion } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const AITaskSuggestions: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkApiKeyAndLoadSuggestions();
    }
  }, [user]);

  const checkApiKeyAndLoadSuggestions = async () => {
    if (!user) return;
    
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
      
      if (hasKey) {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const loadSuggestions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newSuggestions = await aiService.generateTaskSuggestions(
        user.id,
        'current project management activities and productivity optimization'
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load AI suggestions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleCreateTask = (suggestion: TaskSuggestion) => {
    toast({
      title: 'Task Suggestion',
      description: `Task "${suggestion.title}" noted. You can create it in TaskMaster.`,
    });
  };

  if (hasApiKey === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Task Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Get personalized task suggestions by adding your OpenAI API key in settings.
          </p>
          <Button onClick={() => window.location.href = '/user-settings'}>
            Setup AI Features
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Task Suggestions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuggestions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No suggestions yet. Click refresh to get AI-powered task recommendations.
            </p>
            <Button onClick={loadSuggestions} disabled={isLoading}>
              Get Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                      {suggestion.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateTask(suggestion)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {suggestion.estimatedTime}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskSuggestions;
