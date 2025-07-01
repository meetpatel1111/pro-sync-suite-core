
import React from 'react';
import { Brain, Sparkles, Zap, Target, Cpu, Lightbulb, Rocket, Bot } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';

const AIFeatures = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Features</h1>
                <p className="text-lg text-pink-100/90 font-medium">Intelligent Automation & Insights</p>
              </div>
            </div>
            
            <p className="text-pink-50/95 max-w-3xl mb-4 leading-relaxed">
              Harness the power of artificial intelligence to streamline your workflow, gain deeper insights,
              and automate repetitive tasks across all your applications.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Lightbulb className="h-4 w-4 mr-2" />
                Intelligent Insights
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Rocket className="h-4 w-4 mr-2" />
                Predictive Analytics
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Widget */}
          <Card className="lg:col-span-2 shadow-lg animate-scale-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIChatWidget />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-lg animate-scale-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsWidget />
            </CardContent>
          </Card>

          {/* AI Task Suggestions */}
          <Card className="lg:col-span-3 shadow-lg animate-scale-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Task Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AITaskSuggestions />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIFeatures;
