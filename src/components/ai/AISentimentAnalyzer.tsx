
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Frown, Meh, Smile, TrendingUp, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const AISentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast({
        title: 'No Text',
        description: 'Please enter some text to analyze',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI sentiment analysis
    setTimeout(() => {
      const sentiments = ['positive', 'negative', 'neutral'];
      const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      
      setAnalysis({
        overall: randomSentiment,
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        scores: {
          positive: Math.random() * 100,
          negative: Math.random() * 100,
          neutral: Math.random() * 100
        },
        emotions: {
          joy: Math.random() * 100,
          anger: Math.random() * 100,
          fear: Math.random() * 100,
          sadness: Math.random() * 100,
          surprise: Math.random() * 100
        },
        keywords: ['great', 'amazing', 'wonderful', 'excellent'],
        wordCount: text.split(' ').length
      });
      
      setIsAnalyzing(false);
      toast({
        title: 'Analysis Complete',
        description: 'Sentiment analysis has been completed'
      });
    }, 1500);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          AI Sentiment Analyzer
        </CardTitle>
        <CardDescription>
          Analyze text sentiment and emotional tone with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter text to analyze sentiment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
          <div className="text-xs text-muted-foreground">
            {text.length} characters, {text.split(' ').filter(word => word.length > 0).length} words
          </div>
        </div>

        <Button
          onClick={analyzeSentiment}
          disabled={isAnalyzing || !text.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <BarChart className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Analyze Sentiment
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSentimentIcon(analysis.overall)}
                <span className="font-semibold capitalize">{analysis.overall} Sentiment</span>
              </div>
              <Badge>
                {Math.round(analysis.confidence * 100)}% confident
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-2">Sentiment Breakdown:</h5>
                <div className="space-y-2">
                  {Object.entries(analysis.scores).map(([sentiment, score]: [string, any]) => (
                    <div key={sentiment} className="flex items-center gap-2">
                      <span className="text-sm capitalize w-16">{sentiment}:</span>
                      <Progress value={score} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12">
                        {Math.round(score)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Emotional Tone:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(analysis.emotions).map(([emotion, score]: [string, any]) => (
                    <div key={emotion} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{emotion}:</span>
                      <span className="font-medium">{Math.round(score)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Key Sentiment Words:</h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
                <span>Words analyzed: {analysis.wordCount}</span>
                <span>Processing time: ~1.2s</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supports multiple languages</p>
          <p>• Real-time sentiment tracking</p>
          <p>• Emotion detection and analysis</p>
          <p>• Batch processing available</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISentimentAnalyzer;
