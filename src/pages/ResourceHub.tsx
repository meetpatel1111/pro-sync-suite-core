
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  Plus, 
  Filter,
  UserCheck,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { GradientBackground } from '@/components/ui/gradient-background';

const ResourceHub = () => {
  return (
    <GradientBackground variant="orange" className="min-h-screen">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              ResourceHub
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Intelligent resource allocation and capacity management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ColorfulButton variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </ColorfulButton>
            <ColorfulButton variant="secondary" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </ColorfulButton>
            <ColorfulButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </ColorfulButton>
          </div>
        </div>

        {/* Resource Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Resources', value: '24', icon: Users, color: 'from-orange-500 to-red-600' },
            { title: 'Available Now', value: '18', icon: UserCheck, color: 'from-green-500 to-emerald-600' },
            { title: 'Utilization Rate', value: '75%', icon: BarChart3, color: 'from-blue-500 to-purple-600' },
            { title: 'Avg Efficiency', value: '89%', icon: Target, color: 'from-purple-500 to-pink-600' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/80 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resource Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resource List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-orange-100/80 via-red-100/80 to-pink-100/80 rounded-t-2xl">
                <CardTitle className="text-xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Resource Allocation
                  <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    24 Resources
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', role: 'Frontend Developer', utilization: '85%', status: 'Busy', project: 'Website Redesign' },
                    { name: 'Mike Chen', role: 'Backend Developer', utilization: '60%', status: 'Available', project: 'API Development' },
                    { name: 'Emily Davis', role: 'UI/UX Designer', utilization: '90%', status: 'Busy', project: 'Mobile App Design' }
                  ].map((resource, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-red-50 transition-all duration-300 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {resource.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{resource.name}</div>
                            <div className="text-sm text-gray-600">{resource.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={resource.status === 'Available' ? 'default' : 'secondary'}>
                            {resource.status}
                          </Badge>
                          <div className="text-sm font-medium">{resource.utilization}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Current: {resource.project}</span>
                        <ColorfulButton variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </ColorfulButton>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capacity Planning */}
          <div>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-orange-100/80 via-red-100/80 to-pink-100/80 rounded-t-2xl">
                <CardTitle className="text-lg bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Capacity Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-orange-500 animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">Resource Forecast</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Predictive analytics for optimal resource allocation
                  </p>
                  <div className="space-y-3">
                    <ColorfulButton variant="primary" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Forecast
                    </ColorfulButton>
                    <ColorfulButton variant="outline" size="sm" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Tracking
                    </ColorfulButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default ResourceHub;
