
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Lightbulb, Search, PenTool, FileText, BarChart, Calendar, Clock, BookOpen, Command, RefreshCw, Shield, Radar, Sparkles, Zap, Code, Mail, Workflow, Target, Cpu, Bot, Eye, Mic, Image, Video, Globe, Database, Network, Settings } from 'lucide-react';
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
import AICodeReviewer from '@/components/ai/AICodeReviewer';
import AIEmailComposer from '@/components/ai/AIEmailComposer';
import AIWorkflowOptimizer from '@/components/ai/AIWorkflowOptimizer';
import AICompetitorAnalyzer from '@/components/ai/AICompetitorAnalyzer';
import APIKeyManagement from '@/components/settings/APIKeyManagement';
import AIVoiceAssistant from '@/components/ai/AIVoiceAssistant';
import AIImageAnalyzer from '@/components/ai/AIImageAnalyzer';
import AIVideoProcessor from '@/components/ai/AIVideoProcessor';
import AISentimentAnalyzer from '@/components/ai/AISentimentAnalyzer';
import AILanguageTranslator from '@/components/ai/AILanguageTranslator';
import AIDataMiningTool from '@/components/ai/AIDataMiningTool';
import AIPredictiveAnalytics from '@/components/ai/AIPredictiveAnalytics';

const AIFeaturesTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-full">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">AI Intelligence Suite</h1>
              <p className="text-blue-100 opacity-90">
                Enhance productivity with intelligent automation and AI-powered tools
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">AI Assistant</h3>
                  <p className="text-xs text-blue-100/80">Smart chat</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">Code Review</h3>
                  <p className="text-xs text-purple-100/80">Analysis</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">Email Composer</h3>
                  <p className="text-xs text-green-100/80">Professional</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">Optimizer</h3>
                  <p className="text-xs text-orange-100/80">Process</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">Analysis</h3>
                  <p className="text-xs text-pink-100/80">Market</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <div>
                  <h3 className="font-medium text-sm">Voice AI</h3>
                  <p className="text-xs text-cyan-100/80">Speech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Setup & Configuration
          </h2>
        </div>
        <APIKeyManagement />
      </div>

      {/* Featured Tool */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Featured AI Copilot
          </h2>
        </div>
        <AIMultiAppCommandBar />
      </div>

      {/* Core AI Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Core AI Tools
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIChatWidget />
          <AISmartSearch />
          <AIVoiceAssistant />
          <AIContextSuggestions />
        </div>
      </div>

      {/* Content & Communication */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <PenTool className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Content & Communication
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIContentGenerator />
          <AIEmailComposer />
          <AIDocumentSummarizer />
          <AIMeetingNotesGenerator />
          <AILanguageTranslator />
          <AISentimentAnalyzer />
        </div>
      </div>

      {/* Media & Visual AI */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
            <Image className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Media & Visual AI
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIImageAnalyzer />
          <AIVideoProcessor />
        </div>
      </div>

      {/* Development & Code Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
            <Code className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Development & Code Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AICodeReviewer />
          <AIAutoDocumentation />
        </div>
      </div>

      {/* Project Intelligence & Optimization */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <BarChart className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Project Intelligence & Optimization
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIProjectAnalyzer />
          <AIWorkflowOptimizer />
          <AITaskSuggestions />
          <AISmartScheduling />
          <AIPredictiveAnalytics />
          <AIDataMiningTool />
        </div>
      </div>

      {/* Risk & Market Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Risk & Market Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIRiskPredictor />
          <AICompetitorAnalyzer />
          <AIAnomalyDetector />
          <AIDataSyncAdvisor />
        </div>
      </div>

      {/* Context & Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Context & Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIInsightsWidget />
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesTab;
