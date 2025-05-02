
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';
import { ResourceAllocation } from '@/utils/dbtypes';

const PlanBoard = () => {
  const { user } = useAuthContext();
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [allocationAmount, setAllocationAmount] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fix the resource allocation function to use the correct type
  const fetchResourceAllocations = async () => {
    try {
      if (!user) return;
      // Fix: Pass user.id
      const response = await dbService.getResourceAllocations(user.id);
      if (response && response.data) {
        setResourceAllocations(response.data as ResourceAllocation[]);
      } else {
        setResourceAllocations([]);
      }
    } catch (error) {
      console.error('Error fetching resource allocations:', error);
    }
  };

  // And fix the createResourceAllocation function to provide id
  const handleCreateResourceAllocation = async () => {
    try {
      if (!user) return;
      const newAllocation: ResourceAllocation = {
        id: crypto.randomUUID(), // Generate an ID for the new allocation
        resource_id: selectedResource,
        allocation: parseInt(allocationAmount),
        team: selectedTeam,
        user_id: user.id
      };

      const response = await dbService.createResourceAllocation(newAllocation);
      
      if (response && !response.error) {
        setResourceAllocations(prev => [...prev, newAllocation]);
        setSelectedResource('');
        setAllocationAmount('');
        setSelectedTeam('');
      }
    } catch (error) {
      console.error('Error creating resource allocation:', error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchResourceAllocations();
    }
  }, [user]);

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Resource Planning Board</h1>
        {/* Resource allocation components would go here */}
        <p>This is the resource planning board component.</p>
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
