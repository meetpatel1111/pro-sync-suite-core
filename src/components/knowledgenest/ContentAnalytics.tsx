
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Eye, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Target,
  BookOpen,
  MessageSquare,
  Share2,
  Search,
  Star,
  ThumbsUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PageAnalytics {
  pageId: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
  engagementScore: number;
  shareCount: number;
  commentCount: number;
  rating: number;
  searchRanking: number;
  lastUpdated: string;
  performance: {
    loadTime: number;
    seoScore: number;
    readabilityScore: number;
    accessibilityScore: number;
  };
  demographics: {
    departments: Array<{ name: string; percentage: number }>;
    roles: Array<{ name: string; percentage: number }>;
    geography: Array<{ region: string; percentage: number }>;
  };
  timeData: Array<{
    date: string;
    views: number;
    engagement: number;
    comments: number;
  }>;
  popularSections: Array<{
    section: string;
    viewTime: number;
    scrollDepth: number;
  }>;
}

interface ContentAnalyticsProps {
  pageId: string;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ pageId }) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [pageId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with actual API call
      const mockAnalytics: PageAnalytics = {
        pageId,
        title: 'API Integration Guide',
        views: 2547,
        uniqueVisitors: 1832,
        avgReadTime: 4.2,
        bounceRate: 23,
        engagementScore: 87,
        shareCount: 156,
        commentCount: 43,
        rating: 4.6,
        searchRanking: 3,
        lastUpdated: new Date().toISOString(),
        performance: {
          loadTime: 1.2,
          seoScore: 94,
          readabilityScore: 82,
          accessibilityScore: 88
        },
        demographics: {
          departments: [
            { name: 'Engineering', percentage: 45 },
            { name: 'Product', percentage: 25 },
            { name: 'DevOps', percentage: 20 },
            { name: 'QA', percentage: 10 }
          ],
          roles: [
            { name: 'Senior Developer', percentage: 35 },
            { name: 'Developer', percentage: 30 },
            { name: 'Team Lead', percentage: 20 },
            { name: 'Architect', percentage: 15 }
          ],
          geography: [
            { region: 'North America', percentage: 45 },
            { region: 'Europe', percentage: 30 },
            { region: 'Asia Pacific', percentage: 20 },
            { region: 'Others', percentage: 5 }
          ]
        },
        timeData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 50,
          engagement: Math.floor(Math.random() * 20) + 60,
          comments: Math.floor(Math.random() * 5)
        })),
        popularSections: [
          { section: 'Authentication Setup', viewTime: 2.8, scrollDepth: 95 },
          { section: 'Error Handling', viewTime: 2.1, scrollDepth: 87 },
          { section: 'Rate Limiting', viewTime: 1.9, scrollDepth: 82 },
          { section: 'Testing Examples', viewTime: 1.6, scrollDepth: 76 },
          { section: 'Best Practices', viewTime: 1.4, scrollDepth: 71 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
        <p className="text-muted-foreground">Analytics will be available once the page has some activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-lg hover-lift animate-scale-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Read Time</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.avgReadTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.engagementScore}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge className={`${getScoreBgColor(analytics.engagementScore)} border text-xs`}>
                {analytics.engagementScore >= 80 ? 'Excellent' : 
                 analytics.engagementScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {[
          { key: '7d', label: '7 Days' },
          { key: '30d', label: '30 Days' },
          { key: '90d', label: '90 Days' }
        ].map((option) => (
          <Badge
            key={option.key}
            variant={timeRange === option.key ? 'default' : 'outline'}
            className="cursor-pointer hover-scale"
            onClick={() => setTimeRange(option.key as any)}
          >
            {option.label}
          </Badge>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 to-purple-50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Views and Engagement Trend */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Views & Engagement Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="url(#colorViews)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="url(#colorEngagement)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-lg hover-lift">
              <CardContent className="p-4 text-center">
                <Share2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-blue-600">{analytics.shareCount}</p>
                <p className="text-sm text-gray-600">Shares</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover-lift">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{analytics.commentCount}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover-lift">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold text-yellow-600">{analytics.rating}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover-lift">
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-purple-600">#{analytics.searchRanking}</p>
                <p className="text-sm text-gray-600">Search Rank</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Sections */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Popular Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularSections.map((section, index) => (
                    <div key={section.section} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{section.section}</span>
                        <span className="text-sm text-gray-600">{section.viewTime}m avg</span>
                      </div>
                      <Progress value={section.scrollDepth} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Scroll depth: {section.scrollDepth}%</span>
                        <span>View time: {section.viewTime}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Bounce Rate</span>
                      <span className="text-sm text-gray-600">{analytics.bounceRate}%</span>
                    </div>
                    <Progress value={100 - analytics.bounceRate} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Lower is better</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className={`text-sm font-bold ${getScoreColor(analytics.engagementScore)}`}>
                        {analytics.engagementScore}/100
                      </span>
                    </div>
                    <Progress value={analytics.engagementScore} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on time spent, interactions, and completion rate
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">User Actions</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{analytics.shareCount}</p>
                        <p className="text-xs text-gray-600">Shares</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{analytics.commentCount}</p>
                        <p className="text-xs text-gray-600">Comments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.demographics.departments}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        {analytics.demographics.departments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.roles.map((role, index) => (
                    <div key={role.name} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{role.name}</span>
                        <span className="text-sm text-gray-600">{role.percentage}%</span>
                      </div>
                      <Progress value={role.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.geography.map((geo, index) => (
                    <div key={geo.region} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{geo.region}</span>
                        <span className="text-sm text-gray-600">{geo.percentage}%</span>
                      </div>
                      <Progress value={geo.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.performance).map(([key, value], index) => (
              <Card key={key} className="shadow-lg hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${getScoreBgColor(key === 'loadTime' ? (value < 2 ? 90 : 50) : value)}`}>
                    {key === 'loadTime' ? <Clock className="h-6 w-6" /> :
                     key === 'seoScore' ? <Search className="h-6 w-6" /> :
                     key === 'readabilityScore' ? <BookOpen className="h-6 w-6" /> :
                     <Eye className="h-6 w-6" />}
                  </div>
                  <p className={`text-2xl font-bold ${getScoreColor(key === 'loadTime' ? (value < 2 ? 90 : 50) : value)}`}>
                    {key === 'loadTime' ? `${value}s` : value}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Recommendations */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                Performance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Optimize Images',
                    description: 'Compress images to improve load time',
                    impact: 'High',
                    effort: 'Low',
                    color: 'green'
                  },
                  {
                    title: 'Add More Headers',
                    description: 'Break up long sections with subheadings',
                    impact: 'Medium',
                    effort: 'Low',
                    color: 'yellow'
                  },
                  {
                    title: 'Include Alt Text',
                    description: 'Add alt text to images for better accessibility',
                    impact: 'Medium',
                    effort: 'Low',
                    color: 'blue'
                  }
                ].map((rec, index) => (
                  <div key={rec.title} className="flex items-center justify-between p-4 border rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`bg-${rec.color}-100 text-${rec.color}-800 border-${rec.color}-200`}>
                        {rec.impact} Impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.effort} Effort
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Health Score */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Content Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(analytics.engagementScore)} animate-pulse`}>
                  {analytics.engagementScore}
                </div>
                <p className="text-gray-600 mt-2">Overall Content Score</p>
                <Badge className={`${getScoreBgColor(analytics.engagementScore)} border mt-2`}>
                  {analytics.engagementScore >= 80 ? 'Excellent' : 
                   analytics.engagementScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.performance.readabilityScore}</div>
                  <p className="text-sm text-gray-600">Readability</p>
                  <Progress value={analytics.performance.readabilityScore} className="h-2 mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.performance.seoScore}</div>
                  <p className="text-sm text-gray-600">SEO Score</p>
                  <Progress value={analytics.performance.seoScore} className="h-2 mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.performance.accessibilityScore}</div>
                  <p className="text-sm text-gray-600">Accessibility</p>
                  <Progress value={analytics.performance.accessibilityScore} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Suggestions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Content Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Add Interactive Elements',
                    description: 'Include code playgrounds or interactive examples to increase engagement',
                    priority: 'High',
                    effort: 'Medium'
                  },
                  {
                    title: 'Update Outdated Information',
                    description: 'Some sections reference deprecated APIs that should be updated',
                    priority: 'High',
                    effort: 'Low'
                  },
                  {
                    title: 'Add Video Tutorials',
                    description: 'Visual learners would benefit from video explanations of complex concepts',
                    priority: 'Medium',
                    effort: 'High'
                  },
                  {
                    title: 'Improve Cross-References',
                    description: 'Link to related articles to help users discover more content',
                    priority: 'Low',
                    effort: 'Low'
                  }
                ].map((suggestion, index) => (
                  <div key={suggestion.title} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        suggestion.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                        suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      } border`}>
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.effort} Effort
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentAnalytics;
