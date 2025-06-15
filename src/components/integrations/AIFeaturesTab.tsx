
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Lightbulb, Search, PenTool, FileText, BarChart, Calendar, Clock, BookOpen, Command, RefreshCw, Shield, Radar } from 'lucide-react';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AISmartSearch from '@/components/ai/AISmartSearch';
import AIContentGenerator from '@/components/ai/AIContentGenerator';
import AIDocumentSummarizer from '@/components/ai/AIDocumentSummarizer';
import AIProjectAnalyzer from '@/components/ai/AIProjectAnalyzer';
import AIMeetingNotesGenerator from '@/components/ai/AIMeetingNotesGenerator';
import AISmartScheduling from '@/components/ai/AISmartScheduling';
import AIAutoDocumentation from '@/components/ai/AIAutoDocumentation';
import AIContextSuggestions from '@/components/ai/AIContextSuggestions';
import AIMultiAppCommandBar from '@/components/ai/AIMultiAppCommandBar';
import AIDataSyncAdvisor from '@/components/ai/AIDataSyncAdvisor';
import AIRiskPredictor from '@/components/ai/AIRiskPredictor';
import AIAnomalyDetector from '@/components/ai/AIAnomalyDetector';
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
              <Command className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">Multi-App Copilot</h3>
                <p className="text-sm text-muted-foreground">Natural language commands</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium">Risk Prediction</h3>
                <p className="text-sm text-muted-foreground">AI-powered risk analysis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <APIKeyManagement />

      {/* AI Multi-App Command Bar - Featured */}
      <div className="max-w-full">
        <AIMultiAppCommandBar />
      </div>

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

      {/* AI Features Grid - Row 3: Advanced Analytics & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIProjectAnalyzer />
        </div>
        <div className="min-w-0">
          <AITaskSuggestions />
        </div>
      </div>

      {/* AI Features Grid - Row 4: Risk & Anomaly Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIRiskPredictor />
        </div>
        <div className="min-w-0">
          <AIAnomalyDetector />
        </div>
      </div>

      {/* AI Features Grid - Row 5: Meeting & Scheduling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIMeetingNotesGenerator />
        </div>
        <div className="min-w-0">
          <AISmartScheduling />
        </div>
      </div>

      {/* AI Features Grid - Row 6: Documentation & Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIAutoDocumentation />
        </div>
        <div className="min-w-0">
          <AIDataSyncAdvisor />
        </div>
      </div>

      {/* AI Features Grid - Row 7: Context & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <div className="min-w-0">
          <AIContextSuggestions />
        </div>
        <div className="min-w-0">
          <AIInsightsWidget />
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesTab;
