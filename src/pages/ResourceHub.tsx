import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Resource {
  id: string;
  name: string;
  type: string;
  availability: number;
  skills?: string[];
  image?: string;
  department?: string;
  utilization?: number;
}

interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
}

// Sample resource data
const sampleResources: Resource[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    type: 'Developer',
    availability: 80,
    skills: ['React', 'TypeScript', 'Node.js'],
    department: 'Engineering',
    utilization: 85
  },
  {
    id: '2',
    name: 'Michael Chen',
    type: 'Designer',
    availability: 60,
    skills: ['UI/UX', 'Figma', 'Illustrator'],
    department: 'Design',
    utilization: 70
  },
  {
    id: '3',
    name: 'Jessica Williams',
    type: 'Project Manager',
    availability: 40,
    skills: ['Agile', 'Scrum', 'Jira'],
    department: 'Project Management',
    utilization: 95
  },
  {
    id: '4',
    name: 'David Smith',
    type: 'QA Engineer',
    availability: 90,
    skills: ['Testing', 'Automation', 'Selenium'],
    department: 'Quality Assurance',
    utilization: 60
  },
  {
    id: '5',
    name: 'Lisa Rodriguez',
    type: 'Developer',
    availability: 70,
    skills: ['Python', 'Django', 'SQL'],
    department: 'Engineering',
    utilization: 75
  }
];

// Sample allocation data
const sampleAllocations: ResourceAllocation[] = [
  {
    id: 'a1',
    resource_id: '1',
    project_id: 'p1',
    start_date: '2025-04-01',
    end_date: '2025-05-15',
    allocation_percentage: 75
  },
  {
    id: 'a2',
    resource_id: '2',
    project_id: 'p2',
    start_date: '2025-04-10',
    end_date: '2025-06-10',
    allocation_percentage: 50
  },
  {
    id: 'a3',
    resource_id: '3',
    project_id: 'p1',
    start_date: '2025-04-01',
    end_date: '2025-07-01',
    allocation_percentage: 25
  },
  {
    id: 'a4',
    resource_id: '4',
    project_id: 'p3',
    start_date: '2025-05-01',
    end_date: '2025-05-30',
    allocation_percentage: 100
  },
  {
    id: 'a5',
    resource_id: '5',
    project_id: 'p2',
    start_date: '2025-04-15',
    end_date: '2025-06-15',
    allocation_percentage: 60
  }
];

const ResourceHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('team');
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>(sampleAllocations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResourceData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          setResources(sampleResources);
          setAllocations(sampleAllocations);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching resource data:', error);
        setIsLoading(false);
      }
    };

    fetchResourceData();
  }, []);

  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">ResourceHub</h1>
          <p className="text-muted-foreground">Resource allocation and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Resource Schedule
          </TabsTrigger>
          <TabsTrigger value="utilization" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Utilization
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <div className="mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-8" />
          </div>
        </div>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map(resource => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={resource.image} />
                      <AvatarFallback>{resource.name.charAt(0)}{resource.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-medium">{resource.name}</h3>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          {resource.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {resource.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Availability</span>
                      <span>{resource.availability}%</span>
                    </div>
                    <Progress value={resource.availability} className="h-2" />
                    
                    <div className="flex justify-between text-sm mt-3 mb-1">
                      <span>Utilization</span>
                      <span>{resource.utilization}%</span>
                    </div>
                    <Progress 
                      value={resource.utilization} 
                      className={`h-2 ${resource.utilization > 90 ? 'bg-red-600' : ''}`} 
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills?.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">View Profile</Button>
                      <Button variant="outline" size="sm">Allocate</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Schedule</CardTitle>
              <CardDescription>View and manage resource allocations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Resource scheduling visualization coming soon.</p>
                <p className="text-sm mt-2">Track resource allocations across projects and time periods.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>Track how resources are being utilized across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Utilization metrics and charts coming soon.</p>
                <p className="text-sm mt-2">Get insights into resource utilization and identify optimization opportunities.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Resources</CardTitle>
              <CardDescription>View resource allocation by project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Project resource allocation dashboard coming soon.</p>
                <p className="text-sm mt-2">Manage and optimize resource allocation across your projects.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default ResourceHub;
