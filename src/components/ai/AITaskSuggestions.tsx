
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { aiService, AITaskSuggestion } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

interface AITaskSuggestionsProps {
  projectId?: string;
  onTaskCreate?: (task: AITaskSuggestion) => void;
}

const AITaskSuggestions: React.FC<AITaskSuggestionsProps> = ({ projectId, onTaskCreate }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectContext, setProjectContext] = useState<string>('');

  useEffect(() => {
    if (projectId) {
      fetchProjectContext();
    } else {
      generateGeneralSuggestions();
    }
  }, [projectId]);

  const fetchProjectContext = async () => {
    if (!projectId) return;

    try {
      const { data: project } = await supabase
        .from('projects')
        .select('name, description, status')
        .eq('id', projectId)
        .single();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('title, status, priority')
        .eq('project_id', projectId)
        .limit(5);

      const context = `Project: ${project?.name || 'Unknown'}\nDescription: ${project?.description || 'No description'}\nStatus: ${project?.status || 'Unknown'}\nRecent tasks: ${tasks?.map(t => `${t.title} (${t.status})`).join(', ') || 'No tasks'}`;
      
      setProjectContext(context);
      generateSuggestions(context);
    } catch (error) {
      console.error('Error fetching project context:', error);
      generateGeneralSuggestions();
    }
  };

  const generateGeneralSuggestions = () => {
    const context = 'General project management and productivity tasks for improving workflow and organization.';
    setProjectContext(context);
    generateSuggestions(context);
  };

  const generateSuggestions = async (context: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const aiSuggestions = await aiService.generateTaskSuggestions(context);
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: 'AI Suggestions Error',
        description: error instanceof Error ? error.message : 'Failed to generate task suggestions',
        variant: 'destructive'
      });
      
      // Fallback suggestions
      setSuggestions([
        {
          title: 'Review Project Status',
          description: 'Conduct a comprehensive review of current project status and identify next steps',
          priority: 'medium',
          estimatedHours: 1
        },
        {
          title: 'Update Documentation',
          description: 'Review and update project documentation to ensure accuracy',
          priority: 'low',
          estimatedHours: 2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (suggestion: AITaskSuggestion) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority,
          estimate_hours: suggestion.estimatedHours,
          status: 'todo',
          created_by: user.id,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Task Created',
        description: `"${suggestion.title}" has been added to your tasks`,
      });

      if (onTaskCreate) {
        onTaskCreate(suggestion);
      }

      // Remove the suggestion from the list after creating
      setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
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
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered task recommendations based on your project context
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {suggestions.length} suggestions available
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSuggestions(projectContext)}
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

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                    {suggestion.priority}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateTask(suggestion)}
                    className="h-6 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {suggestion.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {suggestion.estimatedHours}h estimated
                </div>
              </div>
            </div>
          ))}

          {suggestions.length === 0 && !isLoading && (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No suggestions available</p>
              <p className="text-xs">Try refreshing or check your API key settings</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AITaskSuggestions;
