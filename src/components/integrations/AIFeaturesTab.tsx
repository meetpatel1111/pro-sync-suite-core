
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
    <div className="space-y-8 max-w-full">
      {/* Header Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-blue-600" />
            AI Features & Intelligence
          </CardTitle>
          <CardDescription className="text-base">
            Comprehensive AI-powered tools to enhance productivity, automate workflows, and provide intelligent insights across ProSync Suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">AI Chat Assistant</h3>
                <p className="text-xs text-muted-foreground">Get help with your projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
              <Search className="h-8 w-8 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">Smart Search</h3>
                <p className="text-xs text-muted-foreground">Natural language search</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-green-200 rounded-lg">
              <Command className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">Multi-App Copilot</h3>
                <p className="text-xs text-muted-foreground">Natural language commands</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-lg">
              <Shield className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">Risk Prediction</h3>
                <p className="text-xs text-muted-foreground">AI-powered risk analysis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Management Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Setup & Configuration</h2>
        <APIKeyManagement />
      </div>

      {/* Featured AI Tool */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Featured AI Tool</h2>
        <AIMultiAppCommandBar />
      </div>

      {/* Core AI Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Core AI Tools</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIChatWidget />
          <AISmartSearch />
        </div>
      </div>

      {/* Content & Analysis Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Content & Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIContentGenerator />
          <AIDocumentSummarizer />
        </div>
      </div>

      {/* Project Management AI */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Project Management AI</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIProjectAnalyzer />
          <AITaskSuggestions />
        </div>
      </div>

      {/* Risk & Data Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Risk & Data Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIRiskPredictor />
          <AIAnomalyDetector />
        </div>
      </div>

      {/* Meeting & Scheduling Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Meeting & Scheduling</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIMeetingNotesGenerator />
          <AISmartScheduling />
        </div>
      </div>

      {/* Documentation & Sync */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Documentation & Synchronization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIAutoDocumentation />
          <AIDataSyncAdvisor />
        </div>
      </div>

      {/* Context & Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Context & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIContextSuggestions />
          <AIInsightsWidget />
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesTab;
