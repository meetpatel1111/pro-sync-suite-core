
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  AlertTriangle, 
  Settings, 
  FileText, 
  Search, 
  BarChart3,
  Clock,
  Users,
  Shield
} from 'lucide-react';
import ChangeManagement from './ChangeManagement';
import ProblemManagement from './ProblemManagement';

const ServiceCore = () => {
  const [activeTab, setActiveTab] = useState('incidents');

  const stats = [
    {
      title: 'Open Incidents',
      value: '23',
      change: '+2',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Active Changes',
      value: '8',
      change: '+1',
      icon: Settings,
      color: 'text-blue-600'
    },
    {
      title: 'Problem Tickets',
      value: '5',
      change: '-1',
      icon: Search,
      color: 'text-yellow-600'
    },
    {
      title: 'SLA Compliance',
      value: '94%',
      change: '+2%',
      icon: BarChart3,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ServiceCore</h1>
        <p className="text-muted-foreground">
          Comprehensive IT Service Management and Support Desk
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {stat.change}
                </Badge>
                {' '}from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="changes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="problems" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Problems
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4" />
                <p>Incident management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Service request management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <ChangeManagement />
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <ProblemManagement />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <p>Asset management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Reporting dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceCore;
