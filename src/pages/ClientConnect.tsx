
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Plus, 
  Filter,
  Mail,
  Building,
  Star,
  TrendingUp
} from 'lucide-react';
import { GradientBackground } from '@/components/ui/gradient-background';

const ClientConnect = () => {
  return (
    <GradientBackground variant="blue" className="min-h-screen">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ClientConnect
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Comprehensive client relationship management platform
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
              Add Client
            </ColorfulButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Active Clients', value: '48', icon: Users, color: 'from-sky-500 to-blue-600' },
            { title: 'Meetings This Week', value: '12', icon: Calendar, color: 'from-blue-500 to-indigo-600' },
            { title: 'Messages Sent', value: '89', icon: MessageSquare, color: 'from-indigo-500 to-purple-600' },
            { title: 'Satisfaction Rate', value: '94%', icon: Star, color: 'from-green-500 to-emerald-600' }
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

        {/* Client Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-sky-100/80 via-blue-100/80 to-indigo-100/80 rounded-t-2xl">
                <CardTitle className="text-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-600" />
                  Client Directory
                  <Badge className="ml-auto bg-gradient-to-r from-sky-500 to-blue-500 text-white">
                    48 Clients
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Acme Corporation', contact: 'John Smith', status: 'Active', value: '$15,000' },
                    { name: 'TechFlow Solutions', contact: 'Sarah Johnson', status: 'Pending', value: '$8,500' },
                    { name: 'Global Dynamics', contact: 'Mike Chen', status: 'Active', value: '$22,000' }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-sky-50 hover:to-blue-50 transition-all duration-300 border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.contact}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <div className="text-sm font-medium text-gray-900">{client.value}</div>
                        <ColorfulButton variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </ColorfulButton>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-sky-100/80 via-blue-100/80 to-indigo-100/80 rounded-t-2xl">
                <CardTitle className="text-lg bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { label: 'Schedule Meeting', icon: Calendar, color: 'primary' },
                  { label: 'Send Email', icon: Mail, color: 'secondary' },
                  { label: 'Make Call', icon: Phone, color: 'accent' },
                  { label: 'Add Note', icon: MessageSquare, color: 'info' }
                ].map((action, index) => (
                  <ColorfulButton 
                    key={index}
                    variant={action.color as any}
                    className="w-full justify-start h-12"
                  >
                    <action.icon className="h-4 w-4 mr-3" />
                    {action.label}
                  </ColorfulButton>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default ClientConnect;
