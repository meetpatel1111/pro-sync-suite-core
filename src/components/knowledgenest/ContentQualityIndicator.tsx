
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';

interface QualityScore {
  overall: number;
  readability: number;
  seo: number;
  structure: number;
  completeness: number;
}

interface ContentQualityIndicatorProps {
  content: string;
  title: string;
}

const ContentQualityIndicator: React.FC<ContentQualityIndicatorProps> = ({ content, title }) => {
  // Calculate quality scores based on content analysis
  const calculateQualityScore = (): QualityScore => {
    const wordCount = content.split(/\s+/).length;
    const hasHeadings = content.includes('#');
    const hasLinks = content.includes('[') && content.includes(']');
    const hasImages = content.includes('![');
    const avgSentenceLength = content.split('.').length > 0 ? wordCount / content.split('.').length : 0;
    
    const readability = Math.min(100, Math.max(0, 100 - (avgSentenceLength - 15) * 2));
    const seo = Math.min(100, (title.length > 30 && title.length < 60 ? 25 : 0) + 
                        (wordCount > 300 ? 25 : wordCount / 12) + 
                        (hasHeadings ? 25 : 0) + 
                        (hasLinks ? 25 : 0));
    const structure = (hasHeadings ? 25 : 0) + 
                     (hasImages ? 25 : 0) + 
                     (content.includes('## ') ? 25 : 0) + 
                     (wordCount > 500 ? 25 : wordCount / 20);
    const completeness = Math.min(100, (wordCount / 10) + (hasHeadings ? 20 : 0) + (hasLinks ? 10 : 0));
    
    const overall = (readability + seo + structure + completeness) / 4;
    
    return { overall, readability, seo, structure, completeness };
  };

  const scores = calculateQualityScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const, icon: CheckCircle };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const, icon: Info };
    return { label: 'Needs Work', variant: 'destructive' as const, icon: AlertCircle };
  };

  const overallBadge = getScoreBadge(scores.overall);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content Quality Score
          </span>
          <Badge variant={overallBadge.variant} className="flex items-center gap-1">
            <overallBadge.icon className="h-3 w-3" />
            {overallBadge.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall</span>
          <div className="flex items-center gap-2">
            <Progress value={scores.overall} className="w-20 h-2" />
            <span className={`text-sm font-bold ${getScoreColor(scores.overall)}`}>
              {Math.round(scores.overall)}%
            </span>
          </div>
        </div>

        {/* Individual Scores */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Readability</span>
            <div className="flex items-center gap-2">
              <Progress value={scores.readability} className="w-16 h-1" />
              <span className={getScoreColor(scores.readability)}>
                {Math.round(scores.readability)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>SEO Score</span>
            <div className="flex items-center gap-2">
              <Progress value={scores.seo} className="w-16 h-1" />
              <span className={getScoreColor(scores.seo)}>
                {Math.round(scores.seo)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Structure</span>
            <div className="flex items-center gap-2">
              <Progress value={scores.structure} className="w-16 h-1" />
              <span className={getScoreColor(scores.structure)}>
                {Math.round(scores.structure)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Completeness</span>
            <div className="flex items-center gap-2">
              <Progress value={scores.completeness} className="w-16 h-1" />
              <span className={getScoreColor(scores.completeness)}>
                {Math.round(scores.completeness)}%
              </span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {scores.overall < 80 && (
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Suggestions:</strong>
              {scores.readability < 70 && ' Simplify sentences. '}
              {scores.seo < 70 && ' Add more headings and internal links. '}
              {scores.structure < 70 && ' Improve document structure with headings. '}
              {scores.completeness < 70 && ' Add more content and details. '}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentQualityIndicator;
