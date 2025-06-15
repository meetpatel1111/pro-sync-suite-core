
import React from 'react';
import { Brain } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AIFeaturesTab from '@/components/integrations/AIFeaturesTab';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AIFeatures = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">AI Features</h1>
            </div>
            <p className="text-sm text-purple-100 max-w-2xl mb-3 leading-relaxed">
              Enhance your productivity with AI-powered tools and assistants
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Chat Assistant
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                Smart Suggestions
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>

        {/* AI Features Content */}
        <Card className="modern-card">
          <CardContent className="p-6">
            <AIFeaturesTab />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AIFeatures;
