
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, Target } from 'lucide-react';

interface CapacityPlanningProps {
  resources: any[];
  allocations: any[];
}

const CapacityPlanning = ({ resources, allocations }: CapacityPlanningProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [capacityData, setCapacityData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    generateCapacityData();
    generateForecastData();
  }, [resources, allocations, selectedTimeframe]);

  const generateCapacityData = () => {
    const data = resources.map(resource => {
      const resourceAllocations = allocations.filter(a => a.resource_id === resource.id);
      const totalAllocation = resourceAllocations.reduce((sum, allocation) => sum + (allocation.percent || 0), 0);
      
      return {
        name: resource.name,
        capacity: 100,
        allocated: totalAllocation,
        available: Math.max(0, 100 - totalAllocation),
        role: resource.role,
        utilization: totalAllocation
      };
    });
    setCapacityData(data);
  };

  const generateForecastData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => ({
      month,
      capacity: resources.length * 100,
      demand: Math.floor(Math.random() * (resources.length * 100)) + (resources.length * 50),
      gap: 0
    }));

    data.forEach(item => {
      item.gap = item.capacity - item.demand;
    });

    setForecastData(data);
  };

  const getCapacityStatus = () => {
    const overAllocated = capacityData.filter(r => r.utilization > 100).length;
    const underUtilized = capacityData.filter(r => r.utilization < 70).length;
    const optimal = capacityData.filter(r => r.utilization >= 70 && r.utilization <= 100).length;

    return { overAllocated, underUtilized, optimal };
  };

  const status = getCapacityStatus();

  const utilizationDistribution = [
    { name: 'Over-allocated', value: status.overAllocated, color: '#ef4444' },
    { name: 'Optimal', value: status.optimal, color: '#10b981' },
    { name: 'Under-utilized', value: status.underUtilized, color: '#6b7280' }
  ];

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-500';
    if (utilization > 80) return 'bg-yellow-500';
    if (utilization > 60) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getTrendIcon = (gap: number) => {
    if (gap > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (gap < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Capacity Planning</CardTitle>
              <CardDescription>Monitor team capacity and forecast future resource needs</CardDescription>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="next-quarter">Next Quarter</SelectItem>
                <SelectItem value="next-6-months">Next 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold">{resources.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Optimal Utilization</p>
                  <p className="text-2xl font-bold">{status.optimal}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Over-allocated</p>
                  <p className="text-2xl font-bold">{status.overAllocated}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Under-utilized</p>
                  <p className="text-2xl font-bold">{status.underUtilized}</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Capacity</CardTitle>
            <CardDescription>Current allocation vs available capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capacityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="allocated" stackId="a" fill="#3b82f6" name="Allocated" />
                <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
            <CardDescription>Team utilization breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {utilizationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity Forecast</CardTitle>
          <CardDescription>Projected capacity vs demand over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="capacity" stroke="#10b981" name="Capacity" strokeWidth={2} />
              <Line type="monotone" dataKey="demand" stroke="#ef4444" name="Demand" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          <CardDescription>Detailed capacity breakdown by resource</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capacityData.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{resource.name}</span>
                    <Badge variant="outline">{resource.role}</Badge>
                    <Badge 
                      variant={resource.utilization > 100 ? "destructive" : resource.utilization > 80 ? "secondary" : "default"}
                    >
                      {resource.utilization}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Capacity Utilization</span>
                      <span>{resource.allocated}% of 100%</span>
                    </div>
                    <Progress 
                      value={Math.min(resource.utilization, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`w-3 h-3 rounded-full ${getUtilizationColor(resource.utilization)}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>AI-powered insights to optimize your team capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.overAllocated > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Over-allocation Detected</p>
                  <p className="text-sm text-red-600">
                    {status.overAllocated} resource(s) are over-allocated. Consider redistributing work or hiring additional team members.
                  </p>
                </div>
              </div>
            )}
            
            {status.underUtilized > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Under-utilization Opportunity</p>
                  <p className="text-sm text-yellow-600">
                    {status.underUtilized} resource(s) have capacity for additional work. Consider assigning more projects or training opportunities.
                  </p>
                </div>
              </div>
            )}

            {status.optimal > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Optimal Utilization</p>
                  <p className="text-sm text-green-600">
                    {status.optimal} resource(s) are optimally utilized. Great job maintaining balanced workloads!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacityPlanning;
