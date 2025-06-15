
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const AIEmailComposer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [emailType, setEmailType] = useState('');
  const [context, setContext] = useState('');
  const [recipient, setRecipient] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
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

  const generateEmail = async () => {
    if (!user || !emailType || !context.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = `Generate a professional ${emailType} email with the following context: ${context}. ${recipient ? `The recipient is: ${recipient}.` : ''} 
      
      Make it professional, clear, and appropriately formatted. Include a subject line.
      
      Format:
      Subject: [subject line]
      
      [email body]`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      setGeneratedEmail(response);
      
      toast({
        title: 'Email Generated',
        description: 'AI has composed your email'
      });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: 'Generation Error',
        description: 'Failed to generate email',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast({
      title: 'Copied',
      description: 'Email copied to clipboard'
    });
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            AI Email Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Email Composer requires a Google Gemini API key to generate professional emails.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          AI Email Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="meeting-request">Meeting Request</SelectItem>
                <SelectItem value="project-update">Project Update</SelectItem>
                <SelectItem value="thank-you">Thank You</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="introduction">Introduction</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="feedback-request">Feedback Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recipient (Optional)</Label>
            <Input
              placeholder="e.g., John Smith, CEO"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Context/Details</Label>
          <Textarea
            placeholder="Provide context for the email (e.g., meeting discussion, project status, request details)..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={generateEmail}
          disabled={isGenerating || !emailType || !context.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating Email...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Generate Email
            </>
          )}
        </Button>

        {generatedEmail && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Generated Email</h4>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedEmail}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIEmailComposer;
