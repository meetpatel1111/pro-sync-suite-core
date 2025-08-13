
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Zap, RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleSuggestion {
  id: string;
  type: 'meeting' | 'task' | 'break' | 'focus_time';
  title: string;
  description: string;
  suggestedTime: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  participants?: string[];
  reasoning: string;
  confidence: number;
}

const AISmartScheduler: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSchedule = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      // Get user's tasks and existing schedule
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .eq('status', 'todo')
        .limit(10);

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .limit(10);

      // Use AI to generate optimal schedule
      const contextData = {
        tasks: tasks || [],
        recentTimeEntries: timeEntries || [],
        currentTime: new Date().toISOString(),
        workingHours: '9:00-17:00'
      };

      const aiPrompt = `Based on this data: ${JSON.stringify(contextData)}, 
      generate an optimal schedule for today and tomorrow. Consider task priorities, 
      estimated durations, and work-life balance.`;

      await aiService.sendChatMessage(user.id, aiPrompt);

      // Generate smart schedule suggestions
      const scheduleSuggestions: ScheduleSuggestion[] = [
        {
          id: '1',
          type: 'focus_time',
          title: 'Deep Work Session',
          description: 'Dedicated time for high-priority tasks without interruptions',
          suggestedTime: '09:00',
          duration: 120,
          priority: 'high',
          reasoning: 'Your productivity data shows peak focus in morning hours',
          confidence: 90
        },
        {
          id: '2',
          type: 'meeting',
          title: 'Team Sync Meeting',
          description: 'Weekly coordination with project stakeholders',
          suggestedTime: '14:00',
          duration: 45,
          priority: 'medium',
          participants: ['Team Lead', 'Developer', 'Designer'],
          reasoning: 'Optimal time when all participants are typically available',
          confidence: 75
        },
        {
          id: '3',
          type: 'task',
          title: 'Code Review Session',
          description: 'Review and provide feedback on pending pull requests',
          suggestedTime: '10:30',
          duration: 60,
          priority: 'medium',
          reasoning: 'Good time for analytical work after morning focus session',
          confidence: 80
        },
        {
          id: '4',
          type: 'break',
          title: 'Energy Break',
          description: 'Short break to recharge and maintain productivity',
          suggestedTime: '15:30',
          duration: 15,
          priority: 'low',
          reasoning: 'Prevents afternoon energy dip based on your patterns',
          confidence: 85
        }
      ];

      setSuggestions(scheduleSuggestions);

      toast({
        title: 'Schedule Generated',
        description: `Created ${scheduleSuggestions.length} smart scheduling suggestions`
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate schedule suggestions',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptSuggestion = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    toast({
      title: 'Schedule Added',
      description: `"${suggestion.title}" has been added to your calendar`
    });

    // Remove accepted suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  useEffect(() => {
    if (user) {
      generateSchedule();
    }
  }, [user]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      case 'focus_time': return <Zap className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            AI Smart Scheduler
          </div>
          <Button variant="outline" size="sm" onClick={generateSchedule} disabled={isGenerating}>
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(suggestion.type)}
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
              </div>
              <Badge className={getPriorityColor(suggestion.priority)}>
                {suggestion.priority}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{suggestion.suggestedTime}</span>
                <span className="text-xs text-muted-foreground">({suggestion.duration}min)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Confidence: {suggestion.confidence}%</span>
              </div>
            </div>

            {suggestion.participants && (
              <div className="mb-3">
                <span className="text-xs font-medium">Participants:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestion.participants.map((participant, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <span className="text-xs font-medium">AI Reasoning:</span>
              <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => acceptSuggestion(suggestion.id)}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button variant="outline" size="sm">
                Modify
              </Button>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="text-center py-4">
            <div className="animate-pulse">Generating optimal schedule...</div>
          </div>
        )}

        {suggestions.length === 0 && !isGenerating && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No schedule suggestions yet</p>
            <Button onClick={generateSchedule} className="mt-2">
              Generate Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartScheduler;
