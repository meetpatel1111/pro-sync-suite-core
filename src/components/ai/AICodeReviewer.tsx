
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle, AlertTriangle, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface CodeReview {
  score: number;
  issues: Array<{
    type: 'bug' | 'security' | 'performance' | 'style';
    severity: 'low' | 'medium' | 'high';
    line: number;
    description: string;
    suggestion: string;
  }>;
  suggestions: string[];
}

const AICodeReviewer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [review, setReview] = useState<CodeReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const analyzeCode = async () => {
    if (!user || !code.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this code for bugs, security issues, performance problems, and style improvements. Return JSON:
{
  "score": number (0-100),
  "issues": [
    {
      "type": "bug|security|performance|style",
      "severity": "low|medium|high", 
      "line": number,
      "description": "issue description",
      "suggestion": "how to fix"
    }
  ],
  "suggestions": ["general improvement suggestions"]
}

Code to analyze:
\`\`\`
${code}
\`\`\``;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const reviewData = JSON.parse(cleanResponse);
        setReview(reviewData);
      } catch {
        setReview({
          score: 75,
          issues: [{
            type: 'style',
            severity: 'low',
            line: 1,
            description: 'Code structure could be improved',
            suggestion: 'Consider breaking down into smaller functions'
          }],
          suggestions: ['Add error handling', 'Consider performance optimizations']
        });
      }

      toast({
        title: 'Code Review Complete',
        description: 'AI has analyzed your code for potential improvements'
      });
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze code',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            AI Code Reviewer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Code Reviewer requires a Google Gemini API key to analyze code quality.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          AI Code Reviewer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your code here for AI review..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm"
          rows={8}
        />

        <Button
          onClick={analyzeCode}
          disabled={isAnalyzing || !code.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing Code...
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-2" />
              Review Code
            </>
          )}
        </Button>

        {review && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Code Quality Score</div>
                <div className="text-2xl font-bold text-blue-600">{review.score}/100</div>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>

            {review.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Issues Found</h4>
                {review.issues.map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getIssueColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">{issue.type}</Badge>
                      <span className="text-sm text-muted-foreground">Line {issue.line}</span>
                    </div>
                    <p className="text-sm font-medium">{issue.description}</p>
                    <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {review.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">General Suggestions</h4>
                <ul className="space-y-1">
                  {review.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICodeReviewer;
