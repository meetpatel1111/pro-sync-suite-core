
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';

interface WorkflowOptimization {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: string;
  estimatedSavings: string;
  status: 'suggested' | 'implementing' | 'completed';
}

const AIWorkflowOptimizer = () => {
  const [optimizations, setOptimizations] = useState<WorkflowOptimization[]>([
    {
      id: '1',
      title: 'Automate Task Assignment',
      description: 'Use AI to automatically assign tasks based on team member expertise and workload',
      impact: 'high',
      effort: 'medium',
      category: 'Task Management',
      estimatedSavings: '2-3 hours/week',
      status: 'suggested'
    },
    {
      id: '2',
      title: 'Smart Meeting Scheduling',
      description: 'Optimize meeting times based on team availability and productivity patterns',
      impact: 'medium',
      effort: 'low',
      category: 'Time Management',
      estimatedSavings: '1-2 hours/week',
      status: 'suggested'
    },
    {
      id: '3',
      title: 'Predictive Resource Planning',
      description: 'Forecast resource needs based on project complexity and historical data',
      impact: 'high',
      effort: 'high',
      category: 'Resource Management',
      estimatedSavings: '4-6 hours/week',
      status: 'implementing'
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'implementing': return 'bg-blue-100 text-blue-800';
      case 'suggested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const implementOptimization = (id: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === id ? { ...opt, status: 'implementing' as const } : opt
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          AI Workflow Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">32%</div>
            <div className="text-sm text-gray-600">Efficiency Improvement</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">8.5h</div>
            <div className="text-sm text-gray-600">Weekly Time Saved</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <div className="text-sm text-gray-600">Goal Achievement Rate</div>
          </div>
        </div>

        <div className="space-y-4">
          {optimizations.map((optimization) => (
            <div key={optimization.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{optimization.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{optimization.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge className={getStatusColor(optimization.status)}>
                    {optimization.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {optimization.status.charAt(0).toUpperCase() + optimization.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Impact:</span>
                    <Badge className={getImpactColor(optimization.impact)}>
                      {optimization.impact}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Effort:</span>
                    <Badge variant="outline">{optimization.effort}</Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Category:</span>
                    <Badge variant="secondary">{optimization.category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{optimization.estimatedSavings}</div>
                  <div className="text-xs text-gray-500">estimated savings</div>
                </div>
              </div>

              {optimization.status === 'implementing' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Implementation Progress</span>
                    <span className="text-xs text-gray-500">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              )}

              <div className="flex justify-end">
                {optimization.status === 'suggested' && (
                  <Button 
                    size="sm" 
                    onClick={() => implementOptimization(optimization.id)}
                    className="flex items-center gap-1"
                  >
                    Implement <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
                {optimization.status === 'implementing' && (
                  <Button size="sm" variant="outline" disabled>
                    In Progress...
                  </Button>
                )}
                {optimization.status === 'completed' && (
                  <Button size="sm" variant="outline" disabled>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Generate New Optimizations
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIWorkflowOptimizer;
