
import React from 'react';
import { BarChart2, TrendingUp, Target, Brain, Zap, Eye } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const InsightIQ = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <BarChart2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-red-100 bg-clip-text">
                  InsightIQ
                </h1>
                <p className="text-lg text-red-100/90 font-medium">Advanced Analytics & Reporting Platform</p>
              </div>
            </div>
            
            <p className="text-lg text-red-50/95 max-w-3xl mb-6 leading-relaxed">
              Transform data into actionable insights with AI-powered analytics, interactive dashboards, 
              predictive modeling, and comprehensive reporting for data-driven decision making.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Brain className="h-4 w-4 mr-2" />
                AI Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Predictive Models
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                Visual Dashboards
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Performance KPIs
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>InsightIQ Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <BarChart2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics & Reporting</h3>
                <p className="text-muted-foreground">
                  Your advanced analytics and reporting tools will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default InsightIQ;
