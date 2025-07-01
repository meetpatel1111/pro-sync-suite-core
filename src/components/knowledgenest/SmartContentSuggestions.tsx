
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Lightbulb, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Users, 
  TrendingUp,
  Zap,
  Target,
  RefreshCw,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentSuggestion {
  id: string;
  type: 'template' | 'improvement' | 'related' | 'completion';
  title: string;
  description: string;
  content?: string;
  confidence: number;
  tags: string[];
  source: 'ai' | 'user_behavior' | 'trending' | 'template';
  createdAt: string;
  applied?: boolean;
  feedback?: 'positive' | 'negative';
}

interface SmartContentSuggestionsProps {
  currentContent: string;
  pageContext: {
    title: string;
    tags: string[];
    category?: string;
    audience?: string;
  };
  onApplySuggestion: (suggestion: ContentSuggestion) => void;
}

const SmartContentSuggestions: React.FC<SmartContentSuggestionsProps> = ({
  currentContent,
  pageContext,
  onApplySuggestion
}) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'improvements' | 'related'>('all');
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    generateSuggestions();
  }, [currentContent, pageContext]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Mock AI-powered suggestions - replace with actual AI service
      const mockSuggestions: ContentSuggestion[] = [
        {
          id: '1',
          type: 'template',
          title: 'Technical Documentation Template',
          description: 'Standard structure for technical documentation including overview, prerequisites, and troubleshooting',
          content: `# ${pageContext.title}\n\n## Overview\n[Brief description of the topic]\n\n## Prerequisites\n- Requirement 1\n- Requirement 2\n\n## Steps\n1. Step one\n2. Step two\n\n## Troubleshooting\n### Common Issues\n- Issue 1: Solution\n- Issue 2: Solution\n\n## Related Resources\n- [Link 1](url)\n- [Link 2](url)`,
          confidence: 95,
          tags: ['template', 'documentation', 'technical'],
          source: 'ai',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'improvement',
          title: 'Add Visual Elements',
          description: 'Consider adding diagrams, screenshots, or flowcharts to improve comprehension',
          confidence: 87,
          tags: ['visual', 'improvement', 'accessibility'],
          source: 'ai',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'related',
          title: 'Link to Related Articles',
          description: 'Found 3 related articles that could be referenced in this page',
          confidence: 92,
          tags: ['cross-reference', 'related'],
          source: 'user_behavior',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          type: 'completion',
          title: 'Auto-complete Code Examples',
          description: 'Detected code snippets that could be expanded with full examples',
          content: '```javascript\n// Example implementation\nconst example = {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(data)\n};\n```',
          confidence: 89,
          tags: ['code', 'examples'],
          source: 'ai',
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          type: 'improvement',
          title: 'SEO Optimization',
          description: 'Optimize headers and meta descriptions for better discoverability',
          confidence: 78,
          tags: ['seo', 'optimization'],
          source: 'trending',
          createdAt: new Date().toISOString()
        }
      ];

      // Filter suggestions based on content analysis
      const relevantSuggestions = mockSuggestions.filter(s => {
        if (pageContext.tags.some(tag => s.tags.includes(tag))) return true;
        if (s.confidence > 85) return true;
        return false;
      });

      setSuggestions(relevantSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion: ContentSuggestion) => {
    try {
      setSuggestions(prev =>
        prev.map(s => s.id === suggestion.id ? { ...s, applied: true } : s)
      );
      
      onApplySuggestion(suggestion);
      
      toast({
        title: 'Suggestion Applied',
        description: `${suggestion.title} has been applied to your content`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply suggestion',
        variant: 'destructive',
      });
    }
  };

  const provideFeedback = async (suggestionId: string, feedback: 'positive' | 'negative') => {
    setSuggestions(prev =>
      prev.map(s => s.id === suggestionId ? { ...s, feedback } : s)
    );

    toast({
      title: 'Feedback Recorded',
      description: 'Thank you for your feedback. This helps improve our suggestions.',
    });
  };

  const generateCustomSuggestion = async () => {
    if (!customPrompt.trim()) return;

    setLoading(true);
    try {
      // Mock custom AI suggestion
      const customSuggestion: ContentSuggestion = {
        id: Date.now().toString(),
        type: 'improvement',
        title: 'Custom AI Suggestion',
        description: `AI-generated content based on: "${customPrompt}"`,
        content: `Based on your request "${customPrompt}", here's a suggested improvement:\n\n[AI-generated content would go here based on the prompt]`,
        confidence: 85,
        tags: ['custom', 'ai-generated'],
        source: 'ai',
        createdAt: new Date().toISOString()
      };

      setSuggestions(prev => [customSuggestion, ...prev]);
      setCustomPrompt('');

      toast({
        title: 'Custom Suggestion Generated',
        description: 'AI has generated a custom suggestion based on your prompt',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate custom suggestion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'user_behavior': return <Users className="h-4 w-4 text-blue-500" />;
      case 'trending': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'template': return <BookOpen className="h-4 w-4 text-orange-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'improvement': return 'bg-green-100 text-green-800 border-green-200';
      case 'related': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completion': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (activeTab === 'all') return true;
    if (activeTab === 'templates') return suggestion.type === 'template';
    if (activeTab === 'improvements') return suggestion.type === 'improvement';
    if (activeTab === 'related') return suggestion.type === 'related';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-900">
            <div className="p-2 bg-purple-500 rounded-lg animate-pulse-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            Smart Content Suggestions
            <Badge className="bg-purple-500 text-white animate-pulse">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-purple-700">
            Get intelligent suggestions to improve your content based on best practices and user behavior
          </p>
        </CardHeader>
      </Card>

      {/* Custom Prompt */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            Custom AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask the AI to help improve your content... (e.g., 'Make this more beginner-friendly' or 'Add troubleshooting section')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-20"
          />
          <Button 
            onClick={generateCustomSuggestion}
            disabled={!customPrompt.trim() || loading}
            className="hover-scale"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Generate Suggestion
          </Button>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All Suggestions', count: suggestions.length },
          { key: 'templates', label: 'Templates', count: suggestions.filter(s => s.type === 'template').length },
          { key: 'improvements', label: 'Improvements', count: suggestions.filter(s => s.type === 'improvement').length },
          { key: 'related', label: 'Related', count: suggestions.filter(s => s.type === 'related').length }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key as any)}
            className="flex items-center gap-2 hover-scale"
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {loading && filteredSuggestions.length === 0 ? (
          <div className="flex items-center justify-center h-32 animate-fade-in">
            <div className="text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500 animate-pulse" />
              <p className="text-muted-foreground">Generating smart suggestions...</p>
            </div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
            <p className="text-muted-foreground">
              Add more content or try different tags to get AI-powered suggestions
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion, index) => (
            <Card 
              key={suggestion.id} 
              className={`transition-all duration-300 hover:shadow-lg animate-fade-in ${
                suggestion.applied ? 'bg-green-50 border-green-200' : 'hover-lift'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getSourceIcon(suggestion.source)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                        <Badge className={`${getTypeColor(suggestion.type)} border text-xs`}>
                          {suggestion.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                        {suggestion.applied && (
                          <Badge className="bg-green-500 text-white text-xs animate-pulse">
                            <Check className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      
                      {suggestion.content && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {suggestion.content.substring(0, 200)}
                            {suggestion.content.length > 200 && '...'}
                          </pre>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500">
                            {new Date(suggestion.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {!suggestion.applied ? (
                      <Button
                        onClick={() => applySuggestion(suggestion)}
                        size="sm"
                        className="hover-scale"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Check className="h-3 w-3 mr-1" />
                        Applied
                      </Button>
                    )}
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(suggestion.id, 'positive')}
                        className={`hover-scale ${
                          suggestion.feedback === 'positive' ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(suggestion.id, 'negative')}
                        className={`hover-scale ${
                          suggestion.feedback === 'negative' ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={generateSuggestions}
          disabled={loading}
          className="hover-scale"
        >
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Suggestions
        </Button>
      </div>
    </div>
  );
};

export default SmartContentSuggestions;
