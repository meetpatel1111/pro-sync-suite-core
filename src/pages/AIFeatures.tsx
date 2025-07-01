
import React from 'react';
import { Brain, Sparkles, Zap, Target, Cpu, Lightbulb, Rocket, Bot, Stars, Wand2 } from 'lucide-react';
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
              <div className="relative p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-pulse-glow">
                <Brain className="h-8 w-8 animate-heartbeat" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping">
                  <Stars className="h-4 w-4 text-white p-1" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text animate-shimmer">AI Features</h1>
                <p className="text-xl text-purple-100/95 font-semibold animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                  Intelligent Automation & Insights 
                  <Wand2 className="h-5 w-5 text-yellow-300 animate-wiggle" />
                </p>
              </div>
            </div>
            
            <p className="text-purple-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Harness the power of artificial intelligence to streamline your workflow, gain deeper insights,
              and automate repetitive tasks across all your applications with cutting-edge AI technology.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Sparkles className="h-5 w-5 mr-3 animate-tada" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Lightbulb className="h-5 w-5 mr-3 animate-tada" />
                Intelligent Insights
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Bot className="h-5 w-5 mr-3 animate-tada" />
                AI Assistant
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Rocket className="h-5 w-5 mr-3 animate-tada" />
                Predictive Analytics
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {/* AI Chat Widget */}
          <Card className="lg:col-span-2 shadow-2xl animate-scale-in hover-lift border-0 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Bot className="h-6 w-6 text-purple-600 animate-bounce-soft" />
                AI Assistant
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AIChatWidget />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-2xl animate-scale-in hover-lift border-0 bg-gradient-to-br from-white to-orange-50/30" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Lightbulb className="h-6 w-6 text-orange-600 animate-pulse" />
                Smart Insights
                <Sparkles className="h-4 w-4 text-yellow-500 animate-wiggle" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AIInsightsWidget />
            </CardContent>
          </Card>

          {/* AI Task Suggestions */}
          <Card className="lg:col-span-3 shadow-2xl animate-scale-in hover-lift border-0 bg-gradient-to-br from-white to-blue-50/30" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="h-6 w-6 text-blue-600 animate-heartbeat" />
                AI Task Suggestions
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white animate-pulse">Smart</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AITaskSuggestions />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIFeatures;
