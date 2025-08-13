
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Calendar, Workflow, Mail, Bot, FileText, Mic } from 'lucide-react';
import AIInsightsWidget from './AIInsightsWidget';
import AITaskSuggestions from './AITaskSuggestions';
import AIProductivityCoach from './AIProductivityCoach';
import AIRiskPredictor from './AIRiskPredictor';
import AISmartScheduler from './AISmartScheduler';
import AIWorkflowOptimizer from './AIWorkflowOptimizer';
import AIEmailComposer from './AIEmailComposer';
import AIMultiAppCommandBar from './AIMultiAppCommandBar';
import AIVoiceAssistant from './AIVoiceAssistant';

const AIDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI-Powered Productivity Suite
        </h1>
        <p className="text-muted-foreground mt-2">
          9 AI features to supercharge your workflow and boost productivity
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsWidget />
            <AITaskSuggestions />
            <AIProductivityCoach />
            <AIRiskPredictor />
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIProductivityCoach />
            <AISmartScheduler />
            <AIRiskPredictor />
            <AITaskSuggestions />
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIWorkflowOptimizer />
            <AISmartScheduler />
            <AIMultiAppCommandBar />
            <AIInsightsWidget />
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIEmailComposer />
            <AIVoiceAssistant />
            <AIMultiAppCommandBar />
            <AITaskSuggestions />
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIMultiAppCommandBar />
            <AIVoiceAssistant />
            <AIEmailComposer />
            <AIWorkflowOptimizer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIDashboard;
