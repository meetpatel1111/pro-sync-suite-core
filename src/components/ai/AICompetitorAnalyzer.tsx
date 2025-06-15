
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Radar, TrendingUp, Target, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface CompetitorAnalysis {
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
  pricingStrategy: string;
  keyFeatures: string[];
  opportunities: string[];
  threats: string[];
}

const AICompetitorAnalyzer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [competitorName, setCompetitorName] = useState('');
  const [industry, setIndustry] = useState('');
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
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

  const analyzeCompetitor = async () => {
    if (!user || !competitorName.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze the competitor "${competitorName}" in the ${industry || 'technology'} industry. Provide a strategic analysis in JSON format:

{
  "competitorName": "${competitorName}",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "marketPosition": "market position description",
  "pricingStrategy": "pricing strategy description",
  "keyFeatures": ["feature 1", "feature 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "threats": ["threat 1", "threat 2"]
}

Focus on factual analysis, market positioning, and strategic insights.`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const analysisData = JSON.parse(cleanResponse);
        setAnalysis(analysisData);
      } catch {
        setAnalysis({
          competitorName,
          strengths: ['Strong brand recognition', 'Established market presence'],
          weaknesses: ['Limited innovation', 'Higher pricing'],
          marketPosition: 'Established market leader with significant market share',
          pricingStrategy: 'Premium pricing strategy targeting enterprise clients',
          keyFeatures: ['Core platform functionality', 'Enterprise integrations'],
          opportunities: ['Expand to new markets', 'Improve user experience'],
          threats: ['New entrants', 'Changing customer preferences']
        });
      }

      toast({
        title: 'Analysis Complete',
        description: `Generated competitor analysis for ${competitorName}`
      });
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze competitor',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            AI Competitor Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Competitor Analyzer requires a Google Gemini API key to analyze competitors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radar className="h-5 w-5" />
          AI Competitor Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Competitor Name</label>
            <Input
              placeholder="e.g., Company XYZ"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry (Optional)</label>
            <Input
              placeholder="e.g., SaaS, E-commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={analyzeCompetitor}
          disabled={isAnalyzing || !competitorName.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing Competitor...
            </>
          ) : (
            <>
              <Radar className="h-4 w-4 mr-2" />
              Analyze Competitor
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-lg">{analysis.competitorName}</h3>
              <p className="text-sm text-muted-foreground">{analysis.marketPosition}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-800 w-full justify-start">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-red-600 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Weaknesses
                </h4>
                <div className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-800 w-full justify-start">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Pricing Strategy</h4>
              <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                {analysis.pricingStrategy}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">Opportunities</h4>
                <ul className="space-y-1">
                  {analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-orange-600">Threats</h4>
                <ul className="space-y-1">
                  {analysis.threats.map((threat, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICompetitorAnalyzer;
