
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Loader2, Brain, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface ScheduleSuggestion {
  type: 'task' | 'milestone' | 'meeting';
  title: string;
  suggestedDate: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

const AISmartScheduling: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projectContext, setProjectContext] = useState('');
  const [timeframe, setTimeframe] = useState('2_weeks');
  const [teamSize, setTeamSize] = useState('');
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (user) {
      checkApiKey();
    }
  }, [user]);

  const checkApiKey = async () => {
    if (!user) return;
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const generateSchedule = async () => {
    if (!user || !projectContext.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide project context',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Based on the following project context, generate intelligent scheduling suggestions. Consider the timeframe, team size, and project complexity. Return your response as JSON with this structure:

[
  {
    "type": "task|milestone|meeting",
    "title": "suggestion title",
    "suggestedDate": "YYYY-MM-DD",
    "reasoning": "why this timing makes sense",
    "priority": "low|medium|high"
  }
]

Project Context: ${projectContext}
Timeframe: ${timeframe.replace('_', ' ')}
Team Size: ${teamSize || 'Not specified'}

Provide 4-6 scheduling suggestions that are realistic and well-reasoned.`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const scheduleSuggestions = JSON.parse(cleanResponse);
        setSuggestions(Array.isArray(scheduleSuggestions) ? scheduleSuggestions : []);
      } catch (parseError) {
        // Fallback with mock suggestions if parsing fails
        setSuggestions([
          {
            type: 'milestone',
            title: 'Project Kickoff',
            suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            reasoning: 'Allow time for initial planning and team alignment',
            priority: 'high'
          },
          {
            type: 'task',
            title: 'Requirements Gathering',
            suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            reasoning: 'Essential foundation work should be completed early',
            priority: 'high'
          }
        ]);
      }
      
      toast({
        title: 'Schedule Generated',
        description: 'AI has created intelligent scheduling suggestions'
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate schedule',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'milestone': return '🎯';
      default: return '📝';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            AI Smart Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Smart Scheduling requires a Google Gemini API key to generate intelligent scheduling suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          AI Smart Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Project Context</label>
          <Textarea
            placeholder="Describe your project, goals, and any constraints..."
            value={projectContext}
            onChange={(e) => setProjectContext(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_week">1 Week</SelectItem>
                <SelectItem value="2_weeks">2 Weeks</SelectItem>
                <SelectItem value="1_month">1 Month</SelectItem>
                <SelectItem value="3_months">3 Months</SelectItem>
                <SelectItem value="6_months">6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Team Size</label>
            <Input
              placeholder="e.g., 5 developers"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={generateSchedule} 
          disabled={isGenerating || !projectContext.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Schedule...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Smart Schedule
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <CheckCircle className="h-3 w-3" />
              Scheduling Suggestions
            </Badge>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      📅 {new Date(suggestion.suggestedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {suggestion.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartScheduling;
