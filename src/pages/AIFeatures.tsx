
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Sparkles,
  Bot,
  Lightbulb,
  Target,
  TrendingUp,
  Search,
  FileText,
  Clock,
  Users,
  Shield,
  Cpu
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const AIFeatures = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const aiFeatures = [
    {
      id: 'universal-assistant',
      title: 'Universal AI Assistant',
      description: 'Context-aware AI that knows your entire workspace',
      category: 'Core',
      icon: <Bot className="h-6 w-6" />,
      features: [
        'Cross-app data access',
        'Personalized insights',
        'Smart suggestions',
        'Natural language queries'
      ],
      status: 'active'
    },
    {
      id: 'smart-analytics',
      title: 'Smart Analytics',
      description: 'AI-powered insights from your productivity data',
      category: 'Analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      features: [
        'Productivity trends',
        'Performance predictions',
        'Bottleneck detection',
        'Goal tracking'
      ],
      status: 'active'
    },
    {
      id: 'content-generation',
      title: 'Content Generation',
      description: 'Generate documentation, reports, and summaries',
      category: 'Productivity',
      icon: <FileText className="h-6 w-6" />,
      features: [
        'Auto documentation',
        'Report generation',
        'Meeting summaries',
        'Content suggestions'
      ],
      status: 'active'
    },
    {
      id: 'predictive-scheduling',
      title: 'Predictive Scheduling',
      description: 'AI-optimized task and resource scheduling',
      category: 'Planning',
      icon: <Clock className="h-6 w-6" />,
      features: [
        'Optimal time slots',
        'Resource allocation',
        'Deadline predictions',
        'Workload balancing'
      ],
      status: 'beta'
    },
    {
      id: 'smart-search',
      title: 'Intelligent Search',
      description: 'Find anything across your entire workspace',
      category: 'Discovery',
      icon: <Search className="h-6 w-6" />,
      features: [
        'Semantic search',
        'Cross-app results',
        'Context understanding',
        'Smart filters'
      ],
      status: 'active'
    },
    {
      id: 'risk-detection',
      title: 'Risk Detection',
      description: 'Proactively identify project risks and issues',
      category: 'Management',
      icon: <Shield className="h-6 w-6" />,
      features: [
        'Early warning system',
        'Risk scoring',
        'Mitigation suggestions',
        'Trend analysis'
      ],
      status: 'coming-soon'
    },
    {
      id: 'team-insights',
      title: 'Team Intelligence',
      description: 'Understand team dynamics and collaboration patterns',
      category: 'Collaboration',
      icon: <Users className="h-6 w-6" />,
      features: [
        'Communication analysis',
        'Collaboration patterns',
        'Team health metrics',
        'Performance insights'
      ],
      status: 'beta'
    },
    {
      id: 'automation-engine',
      title: 'Automation Engine',
      description: 'Intelligent workflow automation and optimization',
      category: 'Automation',
      icon: <Cpu className="h-6 w-6" />,
      features: [
        'Smart triggers',
        'Process optimization',
        'Auto-completion',
        'Workflow suggestions'
      ],
      status: 'coming-soon'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Features', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'Core', name: 'Core AI', icon: <Brain className="h-4 w-4" /> },
    { id: 'Analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'Productivity', name: 'Productivity', icon: <Zap className="h-4 w-4" /> },
    { id: 'Planning', name: 'Planning', icon: <Target className="h-4 w-4" /> },
    { id: 'Discovery', name: 'Discovery', icon: <Search className="h-4 w-4" /> },
    { id: 'Management', name: 'Management', icon: <Settings className="h-4 w-4" /> },
    { id: 'Collaboration', name: 'Collaboration', icon: <Users className="h-4 w-4" /> },
    { id: 'Automation', name: 'Automation', icon: <Cpu className="h-4 w-4" /> }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? aiFeatures 
    : aiFeatures.filter(feature => feature.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 text-white';
      case 'beta':
        return 'bg-blue-500 text-white';
      case 'coming-soon':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'beta':
        return 'Beta';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">AI Features</h1>
                <p className="text-xl text-indigo-100 leading-relaxed">
                  Powerful AI capabilities across your entire ProSync Suite
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                8 AI Features
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Cross-App Intelligence
              </Badge>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge className={`mt-1 ${getStatusColor(feature.status)}`}>
                        {getStatusText(feature.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Key Features:</h4>
                  <ul className="space-y-1">
                    {feature.features.map((item, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                    disabled={feature.status === 'coming-soon'}
                  >
                    {feature.status === 'coming-soon' ? 'Coming Soon' : 'Learn More'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
              <div className="text-sm text-gray-600">AI Features Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Cross-App Integration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">AI Assistance Available</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIFeatures;
