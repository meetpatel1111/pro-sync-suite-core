
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus, 
  Filter,
  BarChart2,
  Target,
  Clock,
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';

const PlanBoard = () => {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website with modern design",
      status: "in_progress",
      progress: 65,
      team: 8,
      deadline: "2024-08-15",
      priority: "high"
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Native iOS and Android app for customer engagement",
      status: "planning",
      progress: 25,
      team: 12,
      deadline: "2024-09-30",
      priority: "medium"
    },
    {
      id: 3,
      name: "Database Migration",
      description: "Migrate legacy database to cloud infrastructure",
      status: "completed",
      progress: 100,
      team: 5,
      deadline: "2024-06-30",
      priority: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
      case 'planning': return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                PlanBoard
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Project planning and Gantt chart visualization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ColorfulButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </ColorfulButton>
              <ColorfulButton variant="secondary" size="sm">
                <BarChart2 className="h-4 w-4 mr-2" />
                Gantt View
              </ColorfulButton>
              <ColorfulButton variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </ColorfulButton>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Active Projects', value: '12', icon: Target, color: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50' },
              { title: 'Team Members', value: '48', icon: Users, color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' },
              { title: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50' },
              { title: 'On Schedule', value: '9/12', icon: Clock, color: 'from-blue-500 to-purple-600', bg: 'from-blue-50 to-purple-50' }
            ].map((stat, index) => (
              <Card key={index} className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Projects Grid */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-100/80 via-orange-100/80 to-red-100/80 rounded-t-2xl">
              <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="h-6 w-6 text-amber-600" />
                Active Projects
                <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-pulse">
                  {projects.length} Projects
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className="p-6 rounded-2xl border-2 border-gradient-to-r from-amber-200/50 via-orange-200/50 to-red-200/50 bg-gradient-to-br from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="space-y-4">
                      {/* Project Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-gray-600 text-sm">{project.description}</p>
                        </div>
                        <Badge className={`${getPriorityColor(project.priority)} border font-medium px-3 py-1 capitalize`}>
                          {project.priority}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.team} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due {project.deadline}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Badge className={`${getStatusColor(project.status)} border font-medium px-3 py-1 capitalize`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex gap-2">
                          <ColorfulButton variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </ColorfulButton>
                          <ColorfulButton variant="primary" size="sm">
                            View
                          </ColorfulButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gantt Chart Preview */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-100/80 via-orange-100/80 to-red-100/80 rounded-t-2xl">
              <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-amber-600" />
                Project Timeline
                <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Interactive
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center py-12 text-muted-foreground">
                <div className="grid grid-cols-3 gap-8 mb-8">
                  {[
                    { icon: Calendar, label: 'Timeline View', color: 'text-amber-500' },
                    { icon: BarChart3, label: 'Progress Tracking', color: 'text-orange-500' },
                    { icon: Target, label: 'Milestone Management', color: 'text-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="text-center animate-bounce-soft" style={{ animationDelay: `${index * 0.2}s` }}>
                      <item.icon className={`h-12 w-12 mx-auto mb-2 ${item.color}`} />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Zap className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">Interactive Gantt Chart</h3>
                <p className="max-w-md mx-auto">
                  Visualize project timelines, dependencies, and milestones with our interactive Gantt chart view.
                </p>
                <ColorfulButton variant="primary" className="mt-4">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Open Gantt View
                </ColorfulButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
