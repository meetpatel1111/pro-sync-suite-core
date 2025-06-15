
import React from 'react';
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
  PieChart,
  BarChart3,
  Clock,
  ChevronDown,
  Search,
  Sparkles,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const RiskRadar = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      {/* Modern Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">RiskRadar</h1>
              <p className="text-xl text-rose-100 leading-relaxed">
                Proactive risk and issue tracking for confident project management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Target className="h-4 w-4 mr-2" />
              Risk Assessment
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Issue Tracking
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Zap className="h-4 w-4 mr-2" />
              Mitigation Plans
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 backdrop-blur-3xl"></div>
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Risk
          </Button>
        </div>
      </div>
      
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-amber-100 mr-3">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Risks</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
          <Progress value={65} className="h-1 bg-amber-100" />
          <p className="text-xs text-muted-foreground mt-2">65% have mitigation plans</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <ShieldAlert className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm font-medium">High Priority</p>
              <h3 className="text-2xl font-bold">8</h3>
            </div>
          </div>
          <Progress value={75} className="h-1 bg-red-100" />
          <p className="text-xs text-muted-foreground mt-2">75% actively monitored</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-amber-100 mr-3">
              <Shield className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Medium Priority</p>
              <h3 className="text-2xl font-bold">10</h3>
            </div>
          </div>
          <Progress value={60} className="h-1 bg-amber-100" />
          <p className="text-xs text-muted-foreground mt-2">60% have mitigation plans</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <ShieldCheck className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Resolved</p>
              <h3 className="text-2xl font-bold">14</h3>
            </div>
          </div>
          <Progress value={100} className="h-1 bg-green-100" />
          <p className="text-xs text-muted-foreground mt-2">In the last 30 days</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Project Alpha
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Projects</DropdownMenuItem>
                  <DropdownMenuItem>Project Alpha</DropdownMenuItem>
                  <DropdownMenuItem>Project Beta</DropdownMenuItem>
                  <DropdownMenuItem>Project Gamma</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <RiskRadarChart />
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Technical</span>
                <span className="text-sm font-medium">9 risks</span>
              </div>
              <Progress value={38} className="h-2 bg-red-100" />
              <p className="text-xs text-muted-foreground mt-1">3 high, 4 medium, 2 low</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Schedule</span>
                <span className="text-sm font-medium">6 risks</span>
              </div>
              <Progress value={25} className="h-2 bg-amber-100" />
              <p className="text-xs text-muted-foreground mt-1">2 high, 3 medium, 1 low</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Resource</span>
                <span className="text-sm font-medium">5 risks</span>
              </div>
              <Progress value={21} className="h-2 bg-amber-100" />
              <p className="text-xs text-muted-foreground mt-1">1 high, 2 medium, 2 low</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Financial</span>
                <span className="text-sm font-medium">4 risks</span>
              </div>
              <Progress value={16} className="h-2 bg-emerald-100" />
              <p className="text-xs text-muted-foreground mt-1">0 high, 1 medium, 3 low</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Risk Alerts</h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">3 high priority risks require immediate attention</p>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">5 risks have passed their review date</p>
              </div>
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
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem>Mitigated</DropdownMenuItem>
                  <DropdownMenuItem>Closed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <RiskTable />
        </Card>
      </div>
    </AppLayout>
  );
};

export default RiskRadar;
