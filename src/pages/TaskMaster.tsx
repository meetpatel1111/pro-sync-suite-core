
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

const TaskMaster = () => {
  const tasks = [
    {
      id: 1,
      title: "Complete project proposal",
      description: "Draft and finalize the Q2 project proposal for client review",
      status: "in_progress",
      priority: "high",
      dueDate: "2024-07-05",
      assignee: "John Doe",
      tags: ["proposal", "client", "urgent"]
    },
    {
      id: 2,
      title: "Design system updates",
      description: "Update component library with new brand guidelines",
      status: "pending",
      priority: "medium",
      dueDate: "2024-07-08",
      assignee: "Jane Smith",
      tags: ["design", "ui/ux"]
    },
    {
      id: 3,
      title: "Database optimization",
      description: "Optimize database queries for better performance",
      status: "completed",
      priority: "low",
      dueDate: "2024-07-01",
      assignee: "Mike Johnson",
      tags: ["database", "performance"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-300';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                TaskMaster
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Manage tasks and workflows with intelligent automation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ColorfulButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </ColorfulButton>
              <ColorfulButton variant="secondary" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </ColorfulButton>
              <ColorfulButton variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </ColorfulButton>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Tasks', value: '24', icon: Target, color: 'from-blue-500 to-purple-600', bg: 'from-blue-50 to-purple-50' },
              { title: 'In Progress', value: '8', icon: Clock, color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' },
              { title: 'Completed', value: '16', icon: CheckCircle, color: 'from-green-500 to-teal-600', bg: 'from-green-50 to-teal-50' },
              { title: 'Efficiency', value: '94%', icon: TrendingUp, color: 'from-pink-500 to-rose-600', bg: 'from-pink-50 to-rose-50' }
            ].map((stat, index) => (
              <Card key={index} className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks List */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-orange-100/80 rounded-t-2xl">
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                Active Tasks
                <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                  {tasks.length} Tasks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="p-6 rounded-2xl border-2 border-gradient-to-r from-purple-200/50 via-pink-200/50 to-orange-200/50 bg-gradient-to-r from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                        <p className="text-gray-600 mb-4">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {task.dueDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {task.assignee}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={`${getStatusColor(task.status)} border font-medium px-3 py-1 capitalize`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} border font-medium px-3 py-1 capitalize`}>
                          {task.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {task.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <ColorfulButton variant="outline" size="sm">
                          Edit
                        </ColorfulButton>
                        <ColorfulButton variant="success" size="sm">
                          Complete
                        </ColorfulButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
