
import React from 'react';
import { Users, Calendar, Target, BarChart3, Zap, Settings } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ResourceHub = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-orange-100 bg-clip-text">
                  ResourceHub
                </h1>
                <p className="text-lg text-orange-100/90 font-medium">Resource Allocation & Management Center</p>
              </div>
            </div>
            
            <p className="text-lg text-orange-50/95 max-w-3xl mb-6 leading-relaxed">
              Optimize resource utilization with intelligent allocation, capacity planning, 
              skill management, and real-time availability tracking for maximum efficiency.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                Capacity Planning
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Skill Management
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <BarChart3 className="h-4 w-4 mr-2" />
                Utilization Reports
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Smart Allocation
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>ResourceHub Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Resource Management</h3>
                <p className="text-muted-foreground">
                  Your resource allocation and management tools will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ResourceHub;
