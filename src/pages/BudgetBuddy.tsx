
import React from 'react';
import { PieChart, Target, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BudgetBuddy = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <PieChart className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-green-100 bg-clip-text">
                  BudgetBuddy
                </h1>
                <p className="text-lg text-green-100/90 font-medium">Smart Budgeting & Expense Tracking</p>
              </div>
            </div>
            
            <p className="text-lg text-green-50/95 max-w-3xl mb-6 leading-relaxed">
              Take control of your finances with intelligent budgeting tools, expense tracking, 
              and real-time financial insights to help you achieve your financial goals.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Expense Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Budget Goals
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Financial Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Calculator className="h-4 w-4 mr-2" />
                Smart Calculations
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>BudgetBuddy Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Budget Management</h3>
                <p className="text-muted-foreground">
                  Your comprehensive budgeting and expense tracking features will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default BudgetBuddy;
