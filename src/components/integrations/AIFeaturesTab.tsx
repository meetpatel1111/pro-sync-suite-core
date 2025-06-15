
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Lightbulb, Search, PenTool, FileText, BarChart } from 'lucide-react';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AISmartSearch from '@/components/ai/AISmartSearch';
import AIContentGenerator from '@/components/ai/AIContentGenerator';
import AIDocumentSummarizer from '@/components/ai/AIDocumentSummarizer';
import AIProjectAnalyzer from '@/components/ai/AIProjectAnalyzer';
import APIKeyManagement from '@/components/settings/APIKeyManagement';

const AIFeaturesTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Features & Intelligence
          </CardTitle>
          <CardDescription>
            Comprehensive AI-powered tools to enhance productivity, automate workflows, and provide intelligent insights across ProSync Suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">AI Chat Assistant</h3>
                <p className="text-sm text-muted-foreground">Get help with your projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Search className="h-8 w-8 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">Smart Search</h3>
                <p className="text-sm text-muted-foreground">Natural language search</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <PenTool className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">Content Generator</h3>
                <p className="text-sm text-muted-foreground">AI-powered content creation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <BarChart className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">Project Analytics</h3>
                <p className="text-sm text-muted-foreground">AI-driven insights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <APIKeyManagement />

      {/* AI Features Grid - Row 1: Core AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIChatWidget />
        </div>
        <div className="min-w-0">
          <AISmartSearch />
        </div>
      </div>

      {/* AI Features Grid - Row 2: Content & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIContentGenerator />
        </div>
        <div className="min-w-0">
          <AIDocumentSummarizer />
        </div>
      </div>

      {/* AI Features Grid - Row 3: Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIProjectAnalyzer />
        </div>
        <div className="min-w-0">
          <AITaskSuggestions />
        </div>
      </div>

      {/* AI Insights Widget - Full Width */}
      <div className="max-w-full">
        <AIInsightsWidget />
      </div>
    </div>
  );
};

export default AIFeaturesTab;
