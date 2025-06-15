
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Loader2, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const AIDocumentSummarizer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [document, setDocument] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
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

  const summarizeDocument = async () => {
    if (!user || !document.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter document content to summarize',
        variant: 'destructive'
      });
      return;
    }

    setIsSummarizing(true);
    try {
      const summaryPrompt = `Please provide a concise summary of the following document and extract 3-5 key points. Format your response as:

SUMMARY:
[Brief summary here]

KEY POINTS:
• [Point 1]
• [Point 2]
• [Point 3]
etc.

Document content:
${document}`;

      const response = await aiService.sendChatMessage(user.id, summaryPrompt, []);
      
      // Parse the response to extract summary and key points
      const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/);
      const keyPointsMatch = response.match(/KEY POINTS:\s*([\s\S]*)/);
      
      if (summaryMatch) {
        setSummary(summaryMatch[1].trim());
      }
      
      if (keyPointsMatch) {
        const points = keyPointsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('•'))
          .map(line => line.replace('•', '').trim())
          .filter(point => point.length > 0);
        setKeyPoints(points);
      }
      
      toast({
        title: 'Document Summarized',
        description: 'AI has successfully analyzed your document'
      });
    } catch (error) {
      console.error('Error summarizing document:', error);
      toast({
        title: 'Summarization Error',
        description: error instanceof Error ? error.message : 'Failed to summarize document',
        variant: 'destructive'
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocument(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Unsupported File',
        description: 'Please upload a text file (.txt)',
        variant: 'destructive'
      });
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Document Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Document Summarizer requires a Google Gemini API key to analyze documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Document Summarizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Document Content</label>
          <Textarea
            placeholder="Paste your document content here or upload a text file..."
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Upload Text File
              </span>
            </Button>
          </label>
          
          <Button 
            onClick={summarizeDocument} 
            disabled={isSummarizing || !document.trim()}
            className="ml-auto"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize
              </>
            )}
          </Button>
        </div>

        {summary && (
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-3">
                <Sparkles className="h-3 w-3 mr-1" />
                Summary
              </Badge>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">{summary}</p>
              </div>
            </div>

            {keyPoints.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  <FileText className="h-3 w-3 mr-1" />
                  Key Points
                </Badge>
                <div className="space-y-2">
                  {keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm">{point}</p>
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

export default AIDocumentSummarizer;
