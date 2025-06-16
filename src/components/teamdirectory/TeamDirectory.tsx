
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  Star,
  MessageCircle,
  UserPlus,
  Filter,
  MoreHorizontal,
  Globe,
  Award
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  skills: string[];
  projects: string[];
  joinDate: string;
  rating: number;
  isManager: boolean;
}

const TeamDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Frontend Developer',
      department: 'Engineering',
      email: 'sarah.j@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      timezone: 'PST',
      status: 'online',
      skills: ['React', 'TypeScript', 'UI/UX', 'GraphQL'],
      projects: ['ProSync Suite', 'Mobile App'],
      joinDate: '2022-03-15',
      rating: 4.8,
      isManager: false
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Product Manager',
      department: 'Product',
      email: 'michael.c@company.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      timezone: 'EST',
      status: 'busy',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      projects: ['ProSync Suite', 'Client Portal'],
      joinDate: '2021-08-22',
      rating: 4.9,
      isManager: true
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      department: 'Design',
      email: 'emily.r@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      timezone: 'CST',
      status: 'away',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      projects: ['Design System', 'Mobile App'],
      joinDate: '2022-01-10',
      rating: 4.7,
      isManager: false
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'DevOps Engineer',
      department: 'Engineering',
      email: 'david.k@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      timezone: 'PST',
      status: 'online',
      skills: ['AWS', 'Kubernetes', 'CI/CD', 'Monitoring'],
      projects: ['Infrastructure', 'Security'],
      joinDate: '2020-11-05',
      rating: 4.9,
      isManager: false
    }
  ];

  const departments = ['all', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales'];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="org">Org Chart</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-gray-600">{member.role}</p>
                            {member.isManager && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                <Award className="h-3 w-3 mr-1" />
                                Manager
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{member.timezone} • {getStatusText(member.status)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{member.rating}/5.0 rating</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{member.name}</h3>
                              {member.isManager && (
                                <Badge variant="secondary" className="text-xs">
                                  Manager
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {member.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {member.timezone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {member.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="org">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Organization Chart</h3>
                    <p>Interactive organization chart showing team hierarchy and reporting structure.</p>
                    <Button className="mt-4">
                      Build Org Chart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDirectory;
