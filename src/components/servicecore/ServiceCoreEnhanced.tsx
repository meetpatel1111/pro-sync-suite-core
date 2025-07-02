
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Settings,
  TrendingUp,
  Users,
  Bell,
  Star
} from 'lucide-react';

const ServiceCoreEnhanced = () => {
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'incident'
  });

  const tickets = [
    {
      id: 'T-001',
      title: 'Login System Not Working',
      description: 'Users unable to login to the application',
      priority: 'high',
      status: 'open',
      type: 'incident',
      assignee: 'John Smith',
      created: '2024-07-02 10:30',
      sla: '2h remaining'
    },
    {
      id: 'T-002',
      title: 'Request New Software License',
      description: 'Need additional Adobe Creative Cloud license',
      priority: 'medium',
      status: 'in_progress',
      type: 'request',
      assignee: 'Sarah Johnson',
      created: '2024-07-02 09:15',
      sla: '4h remaining'
    },
    {
      id: 'T-003',
      title: 'Database Performance Issues',
      description: 'Slow query responses affecting user experience',
      priority: 'critical',
      status: 'resolved',
      type: 'problem',
      assignee: 'Mike Davis',
      created: '2024-07-01 16:45',
      sla: 'Met SLA'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300';
      case 'high': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  const handleCreateTicket = () => {
    console.log('Creating ticket:', newTicket);
    // Reset form
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      type: 'incident'
    });
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Open Tickets', value: '24', icon: Ticket, color: 'from-blue-500 to-purple-600', bg: 'from-blue-50 to-purple-50' },
          { title: 'Avg Response', value: '15m', icon: Clock, color: 'from-green-500 to-teal-600', bg: 'from-green-50 to-teal-50' },
          { title: 'SLA Compliance', value: '94%', icon: TrendingUp, color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' },
          { title: 'Active Agents', value: '8', icon: Users, color: 'from-pink-500 to-rose-600', bg: 'from-pink-50 to-rose-50' }
        ].map((stat, index) => (
          <Card key={index} className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Bell className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Ticket */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-pink-100/80 rounded-t-2xl">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Plus className="h-6 w-6 text-blue-600" />
            Create New Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  className="border-2 border-blue-200 focus:border-blue-400 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={newTicket.type} onValueChange={(value) => setNewTicket({...newTicket, type: value})}>
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="request">Service Request</SelectItem>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="change">Change Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  placeholder="Detailed description of the issue or request"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="border-2 border-blue-200 focus:border-blue-400 rounded-xl h-32"
                />
              </div>
              <div className="flex justify-end pt-4">
                <ColorfulButton variant="primary" onClick={handleCreateTicket} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Ticket
                </ColorfulButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-pink-100/80 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Ticket className="h-6 w-6 text-blue-600" />
              Recent Tickets
              <Badge className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {tickets.length} Active
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <ColorfulButton variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </ColorfulButton>
              <ColorfulButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </ColorfulButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div 
                key={ticket.id}
                className="p-6 rounded-2xl border-2 border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 bg-gradient-to-r from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                      <Badge variant="outline" className="text-xs font-mono bg-gradient-to-r from-gray-50 to-slate-50">
                        {ticket.id}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {ticket.created}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        SLA: {ticket.sla}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={`${getStatusColor(ticket.status)} border font-medium px-3 py-1 capitalize`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${getPriorityColor(ticket.priority)} border font-medium px-3 py-1 capitalize`}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-gray-50 to-slate-50">
                      {ticket.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <ColorfulButton variant="outline" size="sm">
                      View Details
                    </ColorfulButton>
                    <ColorfulButton variant="secondary" size="sm">
                      Add Comment
                    </ColorfulButton>
                  </div>
                  <div className="flex gap-2">
                    {ticket.status === 'open' && (
                      <ColorfulButton variant="info" size="sm">
                        Assign
                      </ColorfulButton>
                    )}
                    {ticket.status === 'in_progress' && (
                      <ColorfulButton variant="success" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </ColorfulButton>
                    )}
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

export default ServiceCoreEnhanced;
