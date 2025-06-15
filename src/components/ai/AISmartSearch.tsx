
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, File, MessageSquare, CheckSquare, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface SearchResult {
  id: string;
  type: 'task' | 'message' | 'file' | 'project';
  title: string;
  content: string;
  score: number;
  source: string;
}

const AISmartSearch: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
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

  const performSearch = async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate AI-powered semantic search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'task',
          title: 'Complete user authentication',
          content: 'Implement OAuth login flow with Google and GitHub',
          score: 0.95,
          source: 'TaskMaster'
        },
        {
          id: '2',
          type: 'message',
          title: 'Team standup discussion',
          content: 'Discussion about sprint planning and resource allocation',
          score: 0.87,
          source: 'CollabSpace'
        },
        {
          id: '3',
          type: 'file',
          title: 'Project Requirements.pdf',
          content: 'Technical specifications and user requirements document',
          score: 0.82,
          source: 'FileVault'
        }
      ];

      // Filter based on search query relevance
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to perform smart search',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'message': return 'bg-green-100 text-green-800';
      case 'file': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI Smart Search
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Smart Search requires a Google Gemini API key to enable semantic search capabilities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          AI Smart Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all your data using natural language..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
          )}
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      <h4 className="font-medium text-sm">{result.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                        {result.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {query && results.length === 0 && !isSearching && (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartSearch;
