
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Clock,
  ChevronDown,
  Search,
  Target,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import RiskRadarChart from '@/components/RiskRadarChart';
import RiskTable from '@/components/RiskTable';
import RiskDialog from '@/components/RiskDialog';
import { riskService } from '@/services/riskService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const RiskRadar = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [refreshKey]);

  const loadAnalytics = async () => {
    try {
      const data = await riskService.getRiskAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">RiskRadar</h1>
            </div>
            <p className="text-sm text-rose-100 max-w-2xl mb-3 leading-relaxed">
              Proactive risk and issue tracking for confident project management
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Target className="h-3 w-3 mr-1" />
                Risk Assessment
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Issue Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Mitigation Plans
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>

        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <RiskDialog onSave={handleRefresh} />
          </div>
        </div>
        
        {/* Risk Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <AlertTriangle className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Risks</p>
                <h3 className="text-2xl font-bold">{analytics.totalRisks}</h3>
              </div>
            </div>
            <Progress value={analytics.totalRisks > 0 ? 100 : 0} className="h-1 bg-blue-100" />
            <p className="text-xs text-muted-foreground mt-2">Active risk assessments</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <ShieldAlert className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium">High Priority</p>
                <h3 className="text-2xl font-bold">{analytics.highRisks}</h3>
              </div>
            </div>
            <Progress 
              value={analytics.totalRisks > 0 ? (analytics.highRisks / analytics.totalRisks) * 100 : 0} 
              className="h-1 bg-red-100" 
            />
            <p className="text-xs text-muted-foreground mt-2">Require immediate attention</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-amber-100 mr-3">
                <Shield className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Medium Priority</p>
                <h3 className="text-2xl font-bold">{analytics.mediumRisks}</h3>
              </div>
            </div>
            <Progress 
              value={analytics.totalRisks > 0 ? (analytics.mediumRisks / analytics.totalRisks) * 100 : 0} 
              className="h-1 bg-amber-100" 
            />
            <p className="text-xs text-muted-foreground mt-2">Monitored regularly</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <ShieldCheck className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Low Priority</p>
                <h3 className="text-2xl font-bold">{analytics.lowRisks}</h3>
              </div>
            </div>
            <Progress 
              value={analytics.totalRisks > 0 ? (analytics.lowRisks / analytics.totalRisks) * 100 : 0} 
              className="h-1 bg-green-100" 
            />
            <p className="text-xs text-muted-foreground mt-2">Under control</p>
          </Card>
        </div>
        
        {/* Risk Visualization and Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium">Risk Assessment Matrix</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Last 30 Days
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="matrix">
              <TabsList className="mb-4">
                <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
                <TabsTrigger value="trends">Risk Trends</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="matrix" className="space-y-4">
                <div className="h-[300px]">
                  <RiskRadarChart key={refreshKey} />
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-4">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Risk Trends</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      Track how risks evolve over time with detailed trend analysis.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Risk Categories</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      Visualize distribution of risks across different categories.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-medium mb-4">Risk Categories</h3>
            
            <div className="space-y-4">
              {Object.entries(analytics.byCategory).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm capitalize">{category}</span>
                    <span className="text-sm font-medium">{count} risks</span>
                  </div>
                  <Progress 
                    value={analytics.totalRisks > 0 ? (count / analytics.totalRisks * 100) : 0} 
                    className="h-2" 
                  />
                </div>
              ))}
              
              {Object.keys(analytics.byCategory).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No risk categories yet</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Risk Status</h4>
              
              <div className="space-y-2">
                {Object.entries(analytics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Risk List */}
        <div>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Risk Register</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search risks..." 
                    className="pl-8 w-[200px]"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Status: All
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All</DropdownMenuItem>
                    <DropdownMenuItem>Active</DropdownMenuItem>
                    <DropdownMenuItem>Mitigated</DropdownMenuItem>
                    <DropdownMenuItem>Closed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <RiskTable key={refreshKey} onRefresh={handleRefresh} />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default RiskRadar;
