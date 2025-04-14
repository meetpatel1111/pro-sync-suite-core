
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Plus, Users, Calendar, Clock, Briefcase, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for resources
const resourcesData = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'UI Designer',
    avatar: '/placeholder.svg',
    availability: 'Available',
    utilization: 75,
    skills: ['UI/UX', 'Figma', 'Sketch'],
    schedule: []
  },
  {
    id: 2,
    name: 'Jamie Smith',
    role: 'Frontend Developer',
    avatar: '/placeholder.svg',
    availability: 'Unavailable',
    utilization: 90,
    skills: ['React', 'TypeScript', 'Tailwind'],
    schedule: []
  },
  {
    id: 3,
    name: 'Taylor Lee',
    role: 'Backend Developer',
    avatar: '/placeholder.svg',
    availability: 'Available',
    utilization: 60,
    skills: ['Node.js', 'PostgreSQL', 'Express'],
    schedule: []
  },
  {
    id: 4,
    name: 'Morgan Chen',
    role: 'Project Manager',
    avatar: '/placeholder.svg',
    availability: 'Limited',
    utilization: 85,
    skills: ['Agile', 'Scrum', 'Jira'],
    schedule: []
  }
];

const ResourceHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter resources based on search query
  const filteredResources = resourcesData.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 gap-1" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Resource Hub</h1>
            <p className="text-muted-foreground">
              Manage team resources, availability, and allocation
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="utilization" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Utilization</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="team" className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={resource.avatar} alt={resource.name} />
                    <AvatarFallback>{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{resource.name}</CardTitle>
                    <CardDescription>{resource.role}</CardDescription>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={resource.availability === 'Available' ? 'success' : resource.availability === 'Limited' ? 'warning' : 'destructive'}>
                        {resource.availability}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Utilization</p>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.utilization} className="h-2" />
                      <span className="text-sm">{resource.utilization}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Availability This Week</p>
                    <div className="flex items-center gap-2">
                      <Progress value={100 - resource.utilization} className="h-2" />
                      <span className="text-sm">{100 - resource.utilization}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resource.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Resource Schedule</CardTitle>
                <CardDescription>View and manage team member schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Schedule content will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilization">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Track resource allocation and utilization rates</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Utilization content will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Allocations</CardTitle>
                <CardDescription>Manage resource allocations across projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Project allocations content will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ResourceHub;
