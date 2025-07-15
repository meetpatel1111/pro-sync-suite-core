
import React from 'react';
import { Brain, Sparkles, Zap, Target, Cpu, Lightbulb, Rocket, Bot, Wand2, Stars } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AIVoiceAssistant from '@/components/ai/AIVoiceAssistant';
import AIImageAnalyzer from '@/components/ai/AIImageAnalyzer';
import AIVideoProcessor from '@/components/ai/AIVideoProcessor';
import AISentimentAnalyzer from '@/components/ai/AISentimentAnalyzer';
import AILanguageTranslator from '@/components/ai/AILanguageTranslator';
import AIDataMiningTool from '@/components/ai/AIDataMiningTool';

const AIFeatures = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header with Animated Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute top-10 right-32 w-32 h-32 bg-blue-300/15 rounded-full blur-xl animate-float"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Brain className="h-8 w-8 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI-Powered Features
                </h1>
                <p className="text-xl text-indigo-100/90 font-medium mt-1">
                  Next-Generation Intelligence & Automation
                </p>
              </div>
            </div>
            
            <p className="text-indigo-50/95 max-w-4xl mb-6 leading-relaxed text-lg">
              Transform your workflow with cutting-edge AI capabilities. From intelligent automation 
              to predictive analytics, unlock the full potential of artificial intelligence across 
              all your business operations.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Wand2 className="h-4 w-4 mr-2" />
                Smart Automation
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Stars className="h-4 w-4 mr-2" />
                Predictive Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Brain className="h-4 w-4 mr-2" />
                Machine Learning
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Cpu className="h-4 w-4 mr-2" />
                Neural Networks
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Interface */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-0">
            <Tabs defaultValue="core" className="w-full">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-t-xl">
                <TabsList className="p-6 bg-transparent flex flex-wrap gap-2">
                  <TabsTrigger 
                    value="core" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-500 text-base hover:scale-105"
                  >
                    <Bot className="h-5 w-5" />
                    Core AI
                  </TabsTrigger>
                  <TabsTrigger 
                    value="multimedia" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-500 text-base hover:scale-105"
                  >
                    <Sparkles className="h-5 w-5" />
                    Multimedia AI
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-500 text-base hover:scale-105"
                  >
                    <Target className="h-5 w-5" />
                    Analytics AI
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-8">
                {/* Core AI Features */}
                <TabsContent value="core" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card className="col-span-1 lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary animate-pulse" />
                          AI Assistant
                          <Badge className="ml-auto bg-blue-100 text-blue-700">Live</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AIChatWidget />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-green-600 animate-pulse" />
                          Smart Insights
                          <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AIInsightsWidget />
                      </CardContent>
                    </Card>

                    <div className="col-span-full">
                      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                            AI Task Suggestions
                            <Badge className="ml-auto bg-purple-100 text-purple-700">Enhanced</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <AITaskSuggestions />
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AIVoiceAssistant />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Multimedia AI Features */}
                <TabsContent value="multimedia" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AIImageAnalyzer />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AIVideoProcessor />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AILanguageTranslator />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Analytics AI Features */}
                <TabsContent value="analytics" className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AISentimentAnalyzer />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-white">
                      <CardContent className="p-6">
                        <AIDataMiningTool />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .hover\\:bg-gradient-to-r:hover {
          backdrop-filter: blur(2px);
        }
      `}</style>
    </AppLayout>
  );
};

export default AIFeatures;
