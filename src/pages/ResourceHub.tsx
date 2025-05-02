
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart2, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import ResourceHubApp from '@/components/ResourceHubApp';
import dbService from '@/services/dbService';

const ResourceHub = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch resources data
  useEffect(() => {
    const fetchResources = async () => {
      if (!user) return;
      
      try {
        const response = await dbService.getResources(user.id);
        // Fix the type conversion by safely handling the response
        if (response && response.data) {
          setResources(response.data || []);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resources data',
          variant: 'destructive',
        });
        setResources([]);
      }
    };
    
    fetchResources();
  }, [user, toast]);

  // Fetch resource allocations
  useEffect(() => {
    const fetchResourceAllocations = async () => {
      if (!user) return;
      
      try {
        // Fix the function call
        const response = await dbService.getResourceAllocations(user.id);
        // Fix the type conversion
        if (response && response.data) {
          setAllocations(response.data || []);
        } else {
          setAllocations([]);
        }
      } catch (error) {
        console.error('Error fetching resource allocations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load allocation data',
          variant: 'destructive',
        });
        setAllocations([]);
      }
    };
    
    fetchResourceAllocations();
  }, [user, toast]);

  // Fetch resource skills
  useEffect(() => {
    const fetchResourceSkills = async () => {
      if (!user) return;
      
      try {
        // Fix the function call
        const response = await dbService.getResourceSkills(user.id);
        // Fix the type conversion
        if (response && response.data) {
          setSkills(response.data || []);
        } else {
          setSkills([]);
        }
      } catch (error) {
        console.error('Error fetching resource skills:', error);
        toast({
          title: 'Error',
          description: 'Failed to load skills data',
          variant: 'destructive',
        });
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResourceSkills();
  }, [user, toast]);

  // Get all team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user) return;
      
      try {
        const response = await dbService.getTeamMembers(user.id);
        // Safe handling of the response
        if (response && response.data) {
          // Process team members if needed
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    
    fetchTeamMembers();
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ResourceHub</h1>
            <p className="text-muted-foreground">
              Manage your resources, allocations, and skills matrix
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Allocations</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Skills Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <ResourceHubApp 
              mode="resources"
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <ResourceHubApp 
              mode="allocations"
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="matrix" className="space-y-4">
            <ResourceHubApp 
              mode="matrix"
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ResourceHubApp
              mode="settings"
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ResourceHub;
