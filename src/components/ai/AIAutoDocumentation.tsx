
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Copy, Loader2, Brain, CheckCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

type DocumentationType = 'changelog' | 'user_guide' | 'api_docs' | 'meeting_minutes' | 'project_summary';

const AIAutoDocumentation: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [documentationType, setDocumentationType] = useState<DocumentationType>('changelog');
  const [activityLogs, setActivityLogs] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState('');
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

  const documentationTypes = {
    changelog: { label: 'Changelog', icon: '📝', description: 'Version history and changes' },
    user_guide: { label: 'User Guide', icon: '📖', description: 'Step-by-step instructions' },
    api_docs: { label: 'API Documentation', icon: '🔧', description: 'Technical API reference' },
    meeting_minutes: { label: 'Meeting Minutes', icon: '📅', description: 'Structured meeting notes' },
    project_summary: { label: 'Project Summary', icon: '📊', description: 'High-level project overview' }
  };

  const generateDocumentation = async () => {
    if (!user || !activityLogs.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide activity logs or data to document',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = getSystemPrompt(documentationType);
      const fullPrompt = `${systemPrompt}\n\nActivity logs/data to document:\n${activityLogs}`;
      
      const response = await aiService.sendChatMessage(user.id, fullPrompt, []);
      setGeneratedDocs(response);
      
      toast({
        title: 'Documentation Generated',
        description: 'AI has successfully created your documentation'
      });
    } catch (error) {
      console.error('Error generating documentation:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate documentation',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSystemPrompt = (type: DocumentationType): string => {
    switch (type) {
      case 'changelog':
        return 'Generate a professional changelog with version numbers, dates, and categorized changes (Added, Changed, Fixed, Removed). Format it clearly with proper markdown.';
      case 'user_guide':
        return 'Create a comprehensive user guide with numbered steps, clear instructions, and helpful tips. Include prerequisites and troubleshooting where relevant.';
      case 'api_docs':
        return 'Generate technical API documentation with endpoints, parameters, request/response examples, and error codes. Use proper formatting for code examples.';
      case 'meeting_minutes':
        return 'Create structured meeting minutes with attendees, agenda items, decisions made, action items, and next steps. Use clear formatting and timestamps.';
      case 'project_summary':
        return 'Generate a high-level project summary including objectives, key achievements, current status, challenges, and next milestones. Keep it executive-friendly.';
      default:
        return 'Generate professional documentation based on the provided activity logs and data.';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDocs);
      toast({
        title: 'Copied!',
        description: 'Documentation copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy documentation to clipboard',
        variant: 'destructive'
      });
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Auto-Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Auto-Documentation requires a Google Gemini API key to generate professional documentation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          AI Auto-Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Documentation Type</label>
          <Select value={documentationType} onValueChange={(value) => setDocumentationType(value as DocumentationType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(documentationTypes).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Activity Logs / Raw Data</label>
          <Textarea
            placeholder="Paste your activity logs, git commits, task updates, meeting notes, or any data that needs to be documented..."
            value={activityLogs}
            onChange={(e) => setActivityLogs(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={generateDocumentation} 
          disabled={isGenerating || !activityLogs.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Documentation...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Documentation
            </>
          )}
        </Button>

        {generatedDocs && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Generated Documentation
              </Badge>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedDocs}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAutoDocumentation;
