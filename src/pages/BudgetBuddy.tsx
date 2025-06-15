import React, { useState, useEffect } from 'react';
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
  FileText,
  MessageSquare,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BudgetChart from '@/components/BudgetChart';
import ExpenseTable from '@/components/ExpenseTable';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpenseForm';
import BudgetChatInterface from '@/components/BudgetChatInterface';
import { Expense, Budget } from '@/utils/dbtypes';
import { safeQueryTable } from '@/utils/db-helpers';

const BudgetBuddy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState(0);
  
  const fetchBudgetData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching budget data for user:', user.id);
      
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
          
      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      } else {
        console.log('Fetched expenses:', expensesData);
        setExpenses(expensesData || []);
      }
      
      // Fetch all expenses for calculations
      const { data: allExpensesData, error: allExpensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      
      if (!allExpensesError && allExpensesData) {
        console.log('All expenses for calculations:', allExpensesData);
        
        // Calculate total spent
        const total = allExpensesData.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setTotalSpent(total);
        
        // Calculate current month expenses
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthExpenses = allExpensesData
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + Number(expense.amount), 0);
        setMonthlyExpenses(currentMonthExpenses);
        
        // Calculate previous month expenses
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthExpenses = allExpensesData
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
          })
          .reduce((sum, expense) => sum + Number(expense.amount), 0);
        setPreviousMonthExpenses(prevMonthExpenses);
      }
      
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .limit(1);
          
      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
      } else if (budgetsData && budgetsData.length > 0) {
        console.log('Fetched budgets:', budgetsData);
        setBudgets(budgetsData);
        setActiveBudgetId(budgetsData[0].id);
        setTotalBudget(Number(budgetsData[0].total) || 0);
      }
    } catch (error) {
      console.error('Exception fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBudgetData();
  }, [user]);

  const handleExpenseCreated = () => {
    console.log('Expense created, refreshing data...');
    // Refresh all budget data after a new expense is created
    fetchBudgetData();
    toast({
      title: 'Expense Added',
      description: 'Your expense has been successfully added.',
    });
  };

  // Calculate percentages and changes
  const budgetUsedPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const monthlyChange = previousMonthExpenses > 0 ? 
    ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0;
  const monthlyChangeFormatted = monthlyChange >= 0 ? `+${monthlyChange.toFixed(1)}%` : `${monthlyChange.toFixed(1)}%`;
  
  return (
    <AppLayout>
      {/* Modern Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">BudgetBuddy</h1>
              <p className="text-xl text-green-100 leading-relaxed">
                Comprehensive budgeting and expense tracking for smarter financial decisions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Target className="h-4 w-4 mr-2" />
              Budget Tracking
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Expense Analytics
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
              <Zap className="h-4 w-4 mr-2" />
              Smart Insights
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
        <div className="flex items-center gap-2">
          {activeBudgetId && (
            <Button variant="outline" size="sm" onClick={() => setShowChatPanel(!showChatPanel)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {showChatPanel ? 'Hide Chat' : 'Budget Discussion'}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSuccess={handleExpenseCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main content grid with optional chat panel */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main content area - takes full width when chat is hidden, or 8/12 when chat is visible */}
        <div className={`${showChatPanel ? 'col-span-8' : 'col-span-12'}`}>
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
                <span className="text-2xl font-bold mr-2">${totalBudget.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">current period</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">${totalSpent.toLocaleString()} spent</span>
                  <span className="text-sm">{budgetUsedPercent}%</span>
                </div>
                <Progress value={budgetUsedPercent} className="h-2" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Monthly Expenses</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {monthlyChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold mr-2">${monthlyExpenses.toLocaleString()}</span>
                <Badge variant={monthlyChange >= 0 ? "destructive" : "default"} className="text-xs font-normal">
                  {monthlyChangeFormatted}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">vs. previous month</span>
                  <span className="text-sm">${previousMonthExpenses.toLocaleString()}</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Budget Status</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Target className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold mr-2">
                  ${(totalBudget - totalSpent).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">remaining</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Budget utilization</span>
                  <span className="text-sm">{budgetUsedPercent}%</span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Budget Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2 p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">Budget Overview</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Current Period
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="expenses">
                <TabsList className="mb-4">
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                
                <TabsContent value="expenses" className="space-y-4">
                  <div className="h-[300px]">
                    <BudgetChart />
                  </div>
                </TabsContent>
                
                <TabsContent value="trends" className="space-y-4">
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Expense Trends</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        Track spending patterns and identify trends over time.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="categories" className="space-y-4">
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Category Breakdown</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        Analyze expenses by category to understand spending patterns.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium mb-4">Quick Stats</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Budget Progress</span>
                    <span className="text-sm">{budgetUsedPercent}%</span>
                  </div>
                  <Progress value={budgetUsedPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgetUsedPercent < 75 ? 'On track' : budgetUsedPercent < 90 ? 'Monitor closely' : 'Over budget risk'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expenses</span>
                      <span className="font-medium">${monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>vs Last Month</span>
                      <span className={`font-medium ${monthlyChange >= 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {monthlyChangeFormatted}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Budget Health</h4>
                  <div className="space-y-2">
                    {budgetUsedPercent < 50 && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">Spending is well within budget</p>
                      </div>
                    )}
                    {budgetUsedPercent >= 50 && budgetUsedPercent < 75 && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">Monitor spending closely</p>
                      </div>
                    )}
                    {budgetUsedPercent >= 75 && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">Approaching budget limit</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Recent Expenses */}
          <div>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Recent Expenses</h3>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <ExpenseTable expensesData={expenses} loading={loading} />
            </Card>
          </div>
        </div>
        
        {/* Chat panel - only show when enabled */}
        {showChatPanel && activeBudgetId && (
          <div className="col-span-4">
            <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Budget Discussion</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <BudgetChatInterface budgetId={activeBudgetId} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BudgetBuddy;
