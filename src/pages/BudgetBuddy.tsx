
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter,
  Calendar,
  Target,
  CreditCard,
  Wallet
} from 'lucide-react';
import { GradientBackground } from '@/components/ui/gradient-background';

const BudgetBuddy = () => {
  return (
    <GradientBackground variant="green" className="min-h-screen">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              BudgetBuddy
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Smart budgeting and expense tracking platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ColorfulButton variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </ColorfulButton>
            <ColorfulButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </ColorfulButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Budget', value: '$5,000', icon: Wallet, color: 'from-green-500 to-emerald-600', change: '+5%' },
            { title: 'Spent This Month', value: '$3,247', icon: CreditCard, color: 'from-red-500 to-rose-600', change: '-2%' },
            { title: 'Remaining', value: '$1,753', icon: DollarSign, color: 'from-blue-500 to-cyan-600', change: '+12%' },
            { title: 'Savings Goal', value: '65%', icon: Target, color: 'from-purple-500 to-violet-600', change: '+8%' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/80 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={stat.change.startsWith('+') ? 'default' : 'destructive'} className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Overview */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-green-100/80 via-emerald-100/80 to-teal-100/80 rounded-t-2xl">
                <CardTitle className="text-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <PieChart className="h-24 w-24 mx-auto mb-4 text-green-500 animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">Budget Visualization</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Interactive charts and graphs showing your spending patterns, budget allocation, and financial trends.
                  </p>
                  <ColorfulButton variant="primary" className="mt-4">
                    View Detailed Analytics
                  </ColorfulButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-green-100/80 via-emerald-100/80 to-teal-100/80 rounded-t-2xl">
                <CardTitle className="text-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Grocery Shopping', amount: '-$125.50', category: 'Food', time: '2 hours ago' },
                    { name: 'Salary Deposit', amount: '+$3,200.00', category: 'Income', time: '1 day ago' },
                    { name: 'Utility Bills', amount: '-$180.00', category: 'Bills', time: '2 days ago' }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium">{transaction.name}</div>
                        <div className="text-sm text-gray-500">{transaction.category} • {transaction.time}</div>
                      </div>
                      <div className={`font-semibold ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default BudgetBuddy;
