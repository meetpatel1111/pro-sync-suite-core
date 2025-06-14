
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';

interface UtilizationData {
  resourceName: string;
  utilization: number;
  availability: number;
  allocatedHours: number;
  totalHours: number;
  role: string;
}

const UtilizationDashboard = ({ resources, allocations }: { resources: any[], allocations: any[] }) => {
  const [utilizationData, setUtilizationData] = useState<UtilizationData[]>([]);

  useEffect(() => {
    if (resources && allocations) {
      const data = resources.map(resource => {
        const resourceAllocations = allocations.filter(a => a.resource_id === resource.id);
        const totalUtilization = resourceAllocations.reduce((sum, allocation) => sum + allocation.percent, 0);
        const totalHours = 40; // Assuming 40 hours per week
        const allocatedHours = (totalUtilization / 100) * totalHours;
        
        return {
          resourceName: resource.name,
          utilization: totalUtilization,
          availability: Math.max(0, 100 - totalUtilization),
          allocatedHours,
          totalHours,
          role: resource.role
        };
      });
      
      setUtilizationData(data);
    }
  }, [resources, allocations]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return '#ef4444'; // red
    if (utilization > 80) return '#f59e0b'; // yellow
    if (utilization > 60) return '#10b981'; // green
    return '#6b7280'; // gray
  };

  const chartData = utilizationData.map(item => ({
    name: item.resourceName.split(' ')[0], // First name only for chart
    utilization: item.utilization,
    availability: item.availability
  }));

  const utilizationStats = {
    totalResources: resources.length,
    overUtilized: utilizationData.filter(r => r.utilization > 100).length,
    wellUtilized: utilizationData.filter(r => r.utilization >= 70 && r.utilization <= 100).length,
    underUtilized: utilizationData.filter(r => r.utilization < 70).length
  };

  const pieData = [
    { name: 'Over-utilized', value: utilizationStats.overUtilized, color: '#ef4444' },
    { name: 'Well-utilized', value: utilizationStats.wellUtilized, color: '#10b981' },
    { name: 'Under-utilized', value: utilizationStats.underUtilized, color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{utilizationStats.totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Well Utilized</p>
                <p className="text-2xl font-bold">{utilizationStats.wellUtilized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Over Utilized</p>
                <p className="text-2xl font-bold">{utilizationStats.overUtilized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Under Utilized</p>
                <p className="text-2xl font-bold">{utilizationStats.underUtilized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization Chart</CardTitle>
            <CardDescription>Current utilization levels across all resources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
            <CardDescription>Resource distribution by utilization level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization Details</CardTitle>
          <CardDescription>Detailed breakdown of each resource's current utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilizationData.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{resource.resourceName}</span>
                    <Badge variant="outline">{resource.role}</Badge>
                    <Badge 
                      variant={resource.utilization > 100 ? "destructive" : resource.utilization > 80 ? "secondary" : "default"}
                    >
                      {resource.utilization}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Utilization</span>
                      <span>{resource.allocatedHours.toFixed(1)}h / {resource.totalHours}h</span>
                    </div>
                    <Progress 
                      value={Math.min(resource.utilization, 100)} 
                      className="h-2"
                      style={{ 
                        backgroundColor: resource.utilization > 100 ? '#fee2e2' : undefined 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilizationDashboard;
