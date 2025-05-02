
// Only updating the problematic functions in RiskRadar.tsx

const handleCreateRisk = async () => {
  try {
    const newRisk = {
      description: newRiskDescription,
      level: newRiskLevel,
      status: newRiskStatus,
      project_id: projectIdFilter || null
    };
    
    // Fix: Pass the risk object directly, not as parameters
    const response = await dbService.createRisk(newRisk);

    if (response.error) {
      setError('Failed to create risk');
      toast({
        title: 'Error',
        description: 'Failed to create risk',
        variant: 'destructive',
      });
    } else {
      setRisks([...risks, response.data]);
      setNewRiskDescription('');
      toast({
        title: 'Success',
        description: 'Risk created successfully',
      });
    }
  } catch (err) {
    setError('An unexpected error occurred');
    toast({
      title: 'Error',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    });
  }
};

const handleUpdateRisk = async (id, updates) => {
  try {
    // Fix: Pass id and updates as separate parameters
    const response = await dbService.updateRisk(id, updates);
    if (response.error) {
      setError('Failed to update risk');
      toast({
        title: 'Error',
        description: 'Failed to update risk',
        variant: 'destructive',
      });
    } else {
      setRisks(risks.map(risk => risk.id === id ? { ...risk, ...response.data } : risk));
      toast({
        title: 'Success',
        description: 'Risk updated successfully',
      });
    }
  } catch (err) {
    setError('An unexpected error occurred');
    toast({
      title: 'Error',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    });
  }
};
