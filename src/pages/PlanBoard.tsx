
// In PlanBoard.tsx, update the ResourceAllocation handling

// Fix the resource allocation function to use the correct type
const fetchResourceAllocations = async () => {
  try {
    const response = await dbService.getResourceAllocations(user.id);
    if (response.data) {
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
    const newAllocation = {
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
