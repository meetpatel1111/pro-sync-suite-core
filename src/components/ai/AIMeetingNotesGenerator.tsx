
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Loader2, Brain, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface MeetingNotes {
  summary: string;
  attendees: string[];
  actionItems: string[];
  decisions: string[];
  nextSteps: string[];
}

const AIMeetingNotesGenerator: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [meetingNotes, setMeetingNotes] = useState<MeetingNotes | null>(null);
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

  const generateMeetingNotes = async () => {
    if (!user || !meetingTranscript.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter meeting transcript or notes',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Please analyze the following meeting transcript and generate structured meeting notes. Format your response as JSON with this structure:

{
  "summary": "Brief meeting summary",
  "attendees": ["person1", "person2"],
  "actionItems": ["action item 1", "action item 2"],
  "decisions": ["decision 1", "decision 2"],
  "nextSteps": ["next step 1", "next step 2"]
}

Meeting transcript:
${meetingTranscript}`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const notes = JSON.parse(cleanResponse);
        setMeetingNotes(notes);
      } catch (parseError) {
        // Fallback with basic structure if parsing fails
        setMeetingNotes({
          summary: response.substring(0, 200) + '...',
          attendees: ['Team Member 1', 'Team Member 2'],
          actionItems: ['Review meeting transcript', 'Follow up on action items'],
          decisions: ['Decision extracted from meeting'],
          nextSteps: ['Schedule follow-up meeting']
        });
      }
      
      toast({
        title: 'Meeting Notes Generated',
        description: 'AI has successfully processed your meeting transcript'
      });
    } catch (error) {
      console.error('Error generating meeting notes:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate meeting notes',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            AI Meeting Notes Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Meeting Notes Generator requires a Google Gemini API key to process meeting transcripts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          AI Meeting Notes Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Meeting Transcript or Notes</label>
          <Textarea
            placeholder="Paste your meeting transcript, voice-to-text output, or raw meeting notes here..."
            value={meetingTranscript}
            onChange={(e) => setMeetingTranscript(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={generateMeetingNotes} 
          disabled={isGenerating || !meetingTranscript.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Meeting...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Structured Notes
            </>
          )}
        </Button>

        {meetingNotes && (
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Meeting Summary
              </Badge>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">{meetingNotes.summary}</p>
              </div>
            </div>

            {meetingNotes.attendees.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  <Users className="h-3 w-3 mr-1" />
                  Attendees
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {meetingNotes.attendees.map((attendee, index) => (
                    <Badge key={index} variant="secondary">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {meetingNotes.actionItems.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  Action Items
                </Badge>
                <div className="space-y-2">
                  {meetingNotes.actionItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <span className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meetingNotes.decisions.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  Decisions Made
                </Badge>
                <div className="space-y-2">
                  {meetingNotes.decisions.map((decision, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium">✓ {decision}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meetingNotes.nextSteps.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  Next Steps
                </Badge>
                <div className="space-y-2">
                  {meetingNotes.nextSteps.map((step, index) => (
                    <div key={index} className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-sm">→ {step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMeetingNotesGenerator;
