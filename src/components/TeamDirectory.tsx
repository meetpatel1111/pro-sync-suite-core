
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

// Sample team data for demonstration
const teamMembers = [
  {
    id: 1,
    name: 'Alex Kim',
    role: 'Project Manager',
    avatar: '/avatar-1.png',
    initials: 'AK',
    email: 'alex.kim@prosync.com',
    phone: '+1 (555) 123-4567',
    status: 'online',
    department: 'Management',
  },
  {
    id: 2,
    name: 'Morgan Lee',
    role: 'UI/UX Designer',
    avatar: '/avatar-2.png',
    initials: 'ML',
    email: 'morgan.lee@prosync.com',
    phone: '+1 (555) 234-5678',
    status: 'online',
    department: 'Design',
  },
  {
    id: 3,
    name: 'Jordan Smith',
    role: 'Frontend Developer',
    avatar: '/avatar-3.png',
    initials: 'JS',
    email: 'jordan.smith@prosync.com',
    phone: '+1 (555) 345-6789',
    status: 'online',
    department: 'Development',
  },
  {
    id: 4,
    name: 'Taylor Wong',
    role: 'Backend Developer',
    avatar: '/avatar-4.png',
    initials: 'TW',
    email: 'taylor.wong@prosync.com',
    phone: '+1 (555) 456-7890',
    status: 'offline',
    department: 'Development',
  },
  {
    id: 5,
    name: 'Cameron Zhang',
    role: 'QA Engineer',
    avatar: '/avatar-5.png',
    initials: 'CZ',
    email: 'cameron.zhang@prosync.com',
    phone: '+1 (555) 567-8901',
    status: 'online',
    department: 'Quality Assurance',
  },
  {
    id: 6,
    name: 'Jamie Rivera',
    role: 'Product Manager',
    avatar: '/avatar-6.png',
    initials: 'JR',
    email: 'jamie.rivera@prosync.com',
    phone: '+1 (555) 678-9012',
    status: 'offline',
    department: 'Management',
  },
  {
    id: 7,
    name: 'Casey Johnson',
    role: 'DevOps Engineer',
    avatar: '/avatar-7.png',
    initials: 'CJ',
    email: 'casey.johnson@prosync.com',
    phone: '+1 (555) 789-0123',
    status: 'online',
    department: 'Development',
  },
];

const TeamDirectory = () => {
  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Input placeholder="Search team members..." className="pl-8" />
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="management" className="flex-1">Management</TabsTrigger>
          <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
          <TabsTrigger value="development" className="flex-1">Development</TabsTrigger>
          <TabsTrigger value="qa" className="flex-1">QA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="management" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers
              .filter(member => member.department === 'Management')
              .map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="design" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers
              .filter(member => member.department === 'Design')
              .map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="development" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers
              .filter(member => member.department === 'Development')
              .map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="qa" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers
              .filter(member => member.department === 'Quality Assurance')
              .map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Team member card component
const TeamMemberCard = ({ member }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.initials}</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
            <Badge variant="outline">{member.department}</Badge>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamDirectory;
