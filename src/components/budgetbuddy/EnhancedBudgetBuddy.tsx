
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Target,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Plus,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedBudgetBuddy: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Sample data
  const budgetSummary = {
    totalBudget: 5000,
    totalSpent: 3750,
    remaining: 1250,
    percentageUsed: 75
  };

  const categories = [
    { name: 'Housing', budget: 2000, spent: 1950, color: 'bg-blue-500' },
    { name: 'Food', budget: 800, spent: 620, color: 'bg-emerald-500' },
    { name: 'Transportation', budget: 400, spent: 380, color: 'bg-yellow-500' },
    { name: 'Entertainment', budget: 300, spent: 280, color: 'bg-purple-500' },
    { name: 'Utilities', budget: 300, spent: 290, color: 'bg-red-500' },
    { name: 'Other', budget: 200, spent: 230, color: 'bg-gray-500' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Grocery Store', amount: -75.50, category: 'Food', date: '2024-01-15', type: 'expense' },
    { id: 2, description: 'Salary Deposit', amount: 3000, category: 'Income', date: '2024-01-15', type: 'income' },
    { id: 3, description: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2024-01-14', type: 'expense' },
    { id: 4, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-14', type: 'expense' },
  ];

  const monthlyTrends = [
    { month: 'Jan', income: 4500, expenses: 3750 },
    { month: 'Feb', income: 4200, expenses: 3900 },
    { month: 'Mar', income: 4800, expenses: 3600 },
    { month: 'Apr', income: 4500, expenses: 4100 },
    { month: 'May', income: 4700, expenses: 3850 },
  ];

  const getStatusColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 90) return 'text-red-600 bg-red-50';
    if (percentage > 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getProgressBarColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header with Beautiful Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-violet-300/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">BudgetBuddy</h1>
              <p className="text-xl text-violet-100 leading-relaxed">
                Smart financial management and expense tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Budget Tracking
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <PieChart className="h-4 w-4 mr-2" />
              Expense Analysis
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm">
              <Target className="h-4 w-4 mr-2" />
              Financial Goals
            </Badge>
          </div>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Budget</p>
                <p className="text-3xl font-bold text-emerald-800">${budgetSummary.totalBudget.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Spent</p>
                <p className="text-3xl font-bold text-blue-800">${budgetSummary.totalSpent.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Remaining</p>
                <p className="text-3xl font-bold text-purple-800">${budgetSummary.remaining.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Usage</p>
                <p className="text-3xl font-bold text-orange-800">{budgetSummary.percentageUsed}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg">Categories</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg">Transactions</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{budgetSummary.percentageUsed}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressBarColor(budgetSummary.totalSpent, budgetSummary.totalBudget)}`}
                        style={{ width: `${budgetSummary.percentageUsed}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-semibold">${budgetSummary.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-semibold">${budgetSummary.remaining.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Set Budget Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Budget Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const percentage = (category.spent / category.budget) * 100;
                  return (
                    <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge className={getStatusColor(category.spent, category.budget)}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${category.spent.toLocaleString()} spent</span>
                        <span>${category.budget.toLocaleString()} budget</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressBarColor(category.spent, category.budget)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className={`text-right font-mono font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((month) => (
                  <div key={month.month} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-600">+${month.income.toLocaleString()}</span>
                        <span className="text-red-600">-${month.expenses.toLocaleString()}</span>
                        <span className={`font-semibold ${month.income - month.expenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Net: {month.income - month.expenses >= 0 ? '+' : ''}${(month.income - month.expenses).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Income</div>
                        <div className="bg-emerald-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${(month.income / 5000) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Expenses</div>
                        <div className="bg-red-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(month.expenses / 5000) * 100}%` }}
                          />
                        </div>
                      </div>
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

export default EnhancedBudgetBuddy;
