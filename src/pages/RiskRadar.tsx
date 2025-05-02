
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import dbService from '@/services/dbService';

const RiskRadar = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRiskDescription, setNewRiskDescription] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('medium');
  const [newRiskStatus, setNewRiskStatus] = useState('identified');
  const [projectIdFilter, setProjectIdFilter] = useState<string | null>(null);

  const handleCreateRisk = async () => {
    try {
      const newRisk = {
        description: newRiskDescription,
        level: newRiskLevel,
        status: newRiskStatus,
        project_id: projectIdFilter || null
      };
      
      // Pass the risk object as the only argument
      const response = await dbService.createRisk(newRisk);

      if (response && response.error) {
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

  const handleUpdateRisk = async (id: string, updates: any) => {
    try {
      // Correctly call updateRisk with separate parameters
      const response = await dbService.updateRisk(id, updates);
      if (response && response.error) {
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

  // Fetch risks
  useEffect(() => {
    const fetchRisks = async () => {
      setLoading(true);
      try {
        const response = await dbService.getRisks();
        if (response && response.error) {
          setError('Failed to fetch risks');
        } else {
          setRisks(response?.data || []);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Risk Radar</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        {/* Risk management components would go here */}
        <p>This is the risk management component.</p>
      </div>
    </AppLayout>
  );
};

export default RiskRadar;
