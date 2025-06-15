
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Lightbulb, Search, PenTool, FileText, BarChart, Calendar, Clock, BookOpen, Command, RefreshCw, Shield, Radar, Sparkles, Zap } from 'lucide-react';
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
    <div className="space-y-10 max-w-full animate-fade-in">
      {/* Modern Header with Floating Elements */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-lg border border-white/30">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">AI Intelligence Suite</h1>
              <p className="text-lg text-blue-100 opacity-90">
                Next-generation AI tools for enhanced productivity and intelligent automation
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/30 rounded-xl group-hover:bg-blue-500/50 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-blue-100/80">Smart conversations</p>
                </div>
              </div>
            </div>
            
            <div className="group p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/30 rounded-xl group-hover:bg-purple-500/50 transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Smart Search</h3>
                  <p className="text-xs text-purple-100/80">Intelligent discovery</p>
                </div>
              </div>
            </div>
            
            <div className="group p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/30 rounded-xl group-hover:bg-green-500/50 transition-colors">
                  <Command className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Copilot</h3>
                  <p className="text-xs text-green-100/80">Natural commands</p>
                </div>
              </div>
            </div>
            
            <div className="group p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/30 rounded-xl group-hover:bg-orange-500/50 transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Risk Analysis</h3>
                  <p className="text-xs text-orange-100/80">Predictive insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Section with Modern Design */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Setup & Configuration
          </h2>
        </div>
        <APIKeyManagement />
      </div>

      {/* Featured Tool with Enhanced Design */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Featured AI Copilot
          </h2>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative">
            <AIMultiAppCommandBar />
          </div>
        </div>
      </div>

      {/* Core Tools with Modern Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Core AI Tools
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIChatWidget />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AISmartSearch />
          </div>
        </div>
      </div>

      {/* Content & Analysis with Modern Styling */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Content & Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIContentGenerator />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIDocumentSummarizer />
          </div>
        </div>
      </div>

      {/* Project Management with Enhanced Design */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
            <BarChart className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Project Intelligence
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIProjectAnalyzer />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AITaskSuggestions />
          </div>
        </div>
      </div>

      {/* Risk & Data Analysis with Modern Cards */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Risk & Data Intelligence
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIRiskPredictor />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIAnomalyDetector />
          </div>
        </div>
      </div>

      {/* Meeting & Scheduling */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Meeting & Scheduling
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIMeetingNotesGenerator />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AISmartScheduling />
          </div>
        </div>
      </div>

      {/* Documentation & Sync */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Documentation & Sync
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIAutoDocumentation />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIDataSyncAdvisor />
          </div>
        </div>
      </div>

      {/* Context & Insights */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Context & Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIContextSuggestions />
          </div>
          <div className="group hover:scale-[1.02] transition-all duration-300">
            <AIInsightsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesTab;
