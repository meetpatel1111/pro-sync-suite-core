
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PenTool, Copy, Loader2, Brain, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

type ContentType = 'task_description' | 'project_plan' | 'meeting_agenda' | 'status_report' | 'email';

const AIContentGenerator: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [contentType, setContentType] = useState<ContentType>('task_description');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
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

  const contentTypes = {
    task_description: { label: 'Task Description', icon: '📝' },
    project_plan: { label: 'Project Plan', icon: '📋' },
    meeting_agenda: { label: 'Meeting Agenda', icon: '📅' },
    status_report: { label: 'Status Report', icon: '📊' },
    email: { label: 'Professional Email', icon: '📧' }
  };

  const generateContent = async () => {
    if (!user || !prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt to generate content',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = getSystemPrompt(contentType);
      const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
      
      const response = await aiService.sendChatMessage(user.id, fullPrompt, []);
      setGeneratedContent(response);
      
      toast({
        title: 'Content Generated',
        description: 'AI has successfully generated your content'
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSystemPrompt = (type: ContentType): string => {
    switch (type) {
      case 'task_description':
        return 'Generate a clear, detailed task description including objectives, acceptance criteria, and any relevant technical details.';
      case 'project_plan':
        return 'Create a comprehensive project plan with phases, milestones, deliverables, and timelines.';
      case 'meeting_agenda':
        return 'Generate a professional meeting agenda with clear objectives, discussion points, and time allocations.';
      case 'status_report':
        return 'Create a professional status report including progress summary, achievements, challenges, and next steps.';
      case 'email':
        return 'Write a professional, clear, and courteous email that accomplishes the specified objective.';
      default:
        return 'Generate professional content based on the user\'s request.';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard',
        variant: 'destructive'
      });
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Content Generator requires a Google Gemini API key to create professional content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Content Type</label>
          <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(contentTypes).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">What would you like to generate?</label>
          <Textarea
            placeholder="Describe what you need... (e.g., 'Create a task for implementing user authentication with OAuth')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={generateContent} disabled={isGenerating || !prompt.trim()} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <PenTool className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Generated
              </Badge>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentGenerator;
