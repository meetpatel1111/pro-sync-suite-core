
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Activity, 
  Plus, 
  Filter,
  Download,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { GradientBackground } from '@/components/ui/gradient-background';

const InsightIQ = () => {
  return (
    <GradientBackground variant="red" className="min-h-screen">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              InsightIQ
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Advanced analytics and intelligent reporting platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ColorfulButton variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </ColorfulButton>
            <ColorfulButton variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </ColorfulButton>
            <ColorfulButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </ColorfulButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Active Reports', value: '24', icon: BarChart2, color: 'from-red-500 to-rose-600' },
            { title: 'Data Sources', value: '8', icon: Activity, color: 'from-orange-500 to-red-600' },
            { title: 'Users Served', value: '156', icon: Users, color: 'from-purple-500 to-pink-600' },
            { title: 'Insights Generated', value: '342', icon: Zap, color: 'from-blue-500 to-purple-600' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/80 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
          <CardHeader className="bg-gradient-to-r from-red-100/80 via-rose-100/80 to-pink-100/80 rounded-t-2xl">
            <CardTitle className="text-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-red-600" />
              Analytics Dashboard
              <Badge className="ml-auto bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center py-16">
              <div className="grid grid-cols-3 gap-8 mb-8">
                {[
                  { icon: BarChart2, label: 'Performance Metrics', color: 'text-red-500' },
                  { icon: TrendingUp, label: 'Trend Analysis', color: 'text-rose-500' },
                  { icon: Target, label: 'Goal Tracking', color: 'text-pink-500' }
                ].map((item, index) => (
                  <div key={index} className="text-center animate-bounce-soft" style={{ animationDelay: `${index * 0.2}s` }}>
                    <item.icon className={`h-16 w-16 mx-auto mb-4 ${item.color}`} />
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
              <Zap className="h-20 w-20 mx-auto mb-4 opacity-50 animate-pulse" />
              <h3 className="text-2xl font-semibold mb-2">AI-Powered Analytics</h3>
              <p className="max-w-2xl mx-auto text-gray-600 mb-6">
                Leverage advanced machine learning algorithms to discover hidden patterns, predict trends, and generate actionable insights from your data automatically.
              </p>
              <ColorfulButton variant="primary" size="lg">
                <BarChart2 className="h-5 w-5 mr-2" />
                Launch Analytics Engine
              </ColorfulButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </GradientBackground>
  );
};

export default InsightIQ;
