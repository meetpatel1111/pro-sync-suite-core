
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, Clock, Tag } from 'lucide-react';
import { aiService, TaskSuggestion } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const AITaskSuggestions = () => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const taskSuggestions = await aiService.generateTaskSuggestions({});
      setSuggestions(taskSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load task suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = (suggestion: TaskSuggestion) => {
    // Implementation would create actual task
    toast({
      title: 'Task Created',
      description: `Created task: ${suggestion.title}`
    });
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
          <Lightbulb className="h-5 w-5" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Generating suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No suggestions available</p>
            <Button onClick={loadSuggestions}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{suggestion.title}</h3>
                  <Badge variant={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {suggestion.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {suggestion.category}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </span>
                  <Button size="sm" onClick={() => handleCreateTask(suggestion)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Create Task
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" onClick={loadSuggestions} className="w-full">
              <Lightbulb className="h-4 w-4 mr-2" />
              Refresh Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskSuggestions;
