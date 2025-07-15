
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Lightbulb, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedAgent: string;
  estimatedResolutionTime: string;
  similarTickets: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
  suggestedResponse: string;
  tags: string[];
}

interface AITicketAnalyzerProps {
  ticketTitle: string;
  ticketDescription: string;
  onAnalysisComplete: (analysis: AIAnalysis) => void;
}

const AITicketAnalyzer: React.FC<AITicketAnalyzerProps> = ({ 
  ticketTitle, 
  ticketDescription, 
  onAnalysisComplete 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeTicket = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: AIAnalysis = {
        category: determineCategory(ticketTitle, ticketDescription),
        priority: determinePriority(ticketTitle, ticketDescription),
        suggestedAgent: 'John Smith (Network Specialist)',
        estimatedResolutionTime: '2-4 hours',
        similarTickets: [
          { id: '#1234', title: 'Similar network connectivity issue', similarity: 85 },
          { id: '#1189', title: 'Router configuration problem', similarity: 72 },
          { id: '#1156', title: 'WiFi authentication failure', similarity: 68 }
        ],
        suggestedResponse: generateSuggestedResponse(ticketTitle, ticketDescription),
        tags: generateTags(ticketTitle, ticketDescription)
      };

      setAnalysis(mockAnalysis);
      onAnalysisComplete(mockAnalysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'AI has analyzed the ticket and provided recommendations.',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const determineCategory = (title: string, description: string): string => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('network') || text.includes('wifi') || text.includes('connection')) return 'Network';
    if (text.includes('software') || text.includes('application') || text.includes('app')) return 'Software';
    if (text.includes('hardware') || text.includes('computer') || text.includes('laptop')) return 'Hardware';
    if (text.includes('password') || text.includes('login') || text.includes('access')) return 'Access Management';
    return 'General IT';
  };

  const determinePriority = (title: string, description: string): 'low' | 'medium' | 'high' | 'critical' => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('urgent') || text.includes('critical') || text.includes('down') || text.includes('outage')) return 'critical';
    if (text.includes('important') || text.includes('asap') || text.includes('blocking')) return 'high';
    if (text.includes('when possible') || text.includes('low priority')) return 'low';
    return 'medium';
  };

  const generateSuggestedResponse = (title: string, description: string): string => {
    return `Thank you for submitting this ticket. I understand you're experiencing issues with ${title.toLowerCase()}. 

Based on the information provided, I recommend the following initial steps:

1. Please try restarting the affected system/application
2. Check if the issue persists after clearing browser cache (if applicable)
3. Verify your network connectivity

If these steps don't resolve the issue, I'll escalate this to our ${determineCategory(title, description)} team for further investigation.

I'll keep you updated on the progress. Expected resolution time is 2-4 hours.

Best regards,
IT Support Team`;
  };

  const generateTags = (title: string, description: string): string[] => {
    const text = `${title} ${description}`.toLowerCase();
    const tags = [];
    
    if (text.includes('network')) tags.push('network');
    if (text.includes('software')) tags.push('software');
    if (text.includes('hardware')) tags.push('hardware');
    if (text.includes('urgent')) tags.push('urgent');
    if (text.includes('wifi')) tags.push('wifi');
    if (text.includes('password')) tags.push('password');
    if (text.includes('email')) tags.push('email');
    
    return tags.slice(0, 5); // Limit to 5 tags
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Ticket Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Analyze this ticket with AI to get automated categorization, priority assessment, and response suggestions.
            </p>
            <Button 
              onClick={analyzeTicket} 
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Ticket
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Analysis Results */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Badge variant="outline" className="mt-1 w-full justify-center">
                  {analysis.category}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Badge className={`mt-1 w-full justify-center ${getPriorityColor(analysis.priority)}`}>
                  {analysis.priority}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Suggested Agent
              </label>
              <p className="text-sm mt-1">{analysis.suggestedAgent}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated Resolution Time
              </label>
              <p className="text-sm mt-1">{analysis.estimatedResolutionTime}</p>
            </div>

            {/* Similar Tickets */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Similar Tickets
              </label>
              <div className="mt-2 space-y-2">
                {analysis.similarTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{ticket.id} - {ticket.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {ticket.similarity}% match
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Suggested Tags</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Suggested Response */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Suggested Response</label>
              <Textarea
                value={analysis.suggestedResponse}
                readOnly
                className="mt-2 min-h-[120px]"
              />
              <Button variant="outline" size="sm" className="mt-2">
                Use This Response
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITicketAnalyzer;
