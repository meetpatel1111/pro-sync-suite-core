
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Lightbulb, Key } from 'lucide-react';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import APIKeyManagement from '@/components/settings/APIKeyManagement';

const AIFeaturesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Features
          </CardTitle>
          <CardDescription>
            Enhance your productivity with AI-powered tools and assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">AI Chat Assistant</h3>
                <p className="text-sm text-muted-foreground">Get help with your projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-medium">Smart Suggestions</h3>
                <p className="text-sm text-muted-foreground">AI-powered task recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-medium">Productivity Insights</h3>
                <p className="text-sm text-muted-foreground">Data-driven productivity tips</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <APIKeyManagement />

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat Widget */}
        <div>
          <AIChatWidget />
        </div>

        {/* AI Task Suggestions */}
        <div>
          <AITaskSuggestions />
        </div>
      </div>

      {/* AI Insights Widget - Full Width */}
      <div>
        <AIInsightsWidget />
      </div>
    </div>
  );
};

export default AIFeaturesTab;
