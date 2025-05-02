import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BudgetChart from '@/components/BudgetChart';
import ExpenseTable from '@/components/ExpenseTable';

const BudgetBuddy = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
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
        <div>
          <h1 className="text-3xl font-bold mb-1">BudgetBuddy</h1>
          <p className="text-muted-foreground">Comprehensive budgeting and expense tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>
      
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <DollarSign className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold mr-2">$58,620</span>
            <span className="text-sm text-muted-foreground">for Q2 2025</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">$42,180 spent</span>
              <span className="text-sm">72%</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Expenses</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold mr-2">$12,845</span>
            <Badge variant="destructive" className="text-xs font-normal">+8.2%</Badge>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">vs. previous month</span>
              <span className="text-sm text-destructive">$11,875</span>
            </div>
            <div className="mt-2 h-10">
              <div className="flex items-end h-full space-x-1">
                {[65, 59, 80, 81, 72, 75, 85, 92, 78, 80, 87, 95].map((value, index) => (
                  <div
                    key={index}
                    className={`w-full bg-primary/15 rounded-t ${index === 11 ? 'bg-primary' : ''}`}
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </Button>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold mr-2">$95,240</span>
            <Badge className="bg-emerald-600 text-xs font-normal">+12.5%</Badge>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">vs. previous quarter</span>
              <span className="text-sm text-emerald-600">$84,680</span>
            </div>
            <div className="mt-2 h-10">
              <div className="flex items-end h-full space-x-1">
                {[45, 52, 68, 71, 75, 78, 80, 82, 85, 88, 92, 95].map((value, index) => (
                  <div
                    key={index}
                    className={`w-full bg-emerald-600/15 rounded-t ${index === 11 ? 'bg-emerald-600' : ''}`}
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Budget Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">Budget Overview</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Q2 2025
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="expenses">
            <TabsList className="mb-4">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="profit">Profit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="space-y-4">
              <div className="h-[300px]">
                <BudgetChart />
              </div>
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Revenue Analysis</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Track revenue streams and monitor growth over time.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="profit" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Profit Breakdown</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Analyze profit margins and identify areas for improvement.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-4">Expenses by Category</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Development</span>
                <span className="text-sm font-medium">$18,650</span>
              </div>
              <Progress value={44} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">44% of total budget</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Marketing</span>
                <span className="text-sm font-medium">$12,480</span>
              </div>
              <Progress value={30} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">30% of total budget</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Operations</span>
                <span className="text-sm font-medium">$6,750</span>
              </div>
              <Progress value={16} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">16% of total budget</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Research</span>
                <span className="text-sm font-medium">$4,300</span>
              </div>
              <Progress value={10} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">10% of total budget</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Budget Alerts</h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">Marketing expenses approaching budget limit (92% used)</p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">Development expenses under budget (70% used)</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Expenses */}
      <div className="mt-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Expenses</h3>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <ExpenseTable transactions={transactions || []} />
        </Card>
      </div>
    </AppLayout>
  );
};

export default BudgetBuddy;
