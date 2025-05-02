import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import RiskRadarChart from '@/components/RiskRadarChart';
import RiskTable from '@/components/RiskTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast';
import dbService from '@/services/dbService';

const RiskRadar = () => {
  const { toast } = useToast();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRiskDescription, setNewRiskDescription] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('medium');
  const [newRiskStatus, setNewRiskStatus] = useState('open');
  const [editingRisk, setEditingRisk] = useState(null);
  const [projectIdFilter, setProjectIdFilter] = useState('');

  useEffect(() => {
    fetchRisks();
  }, [projectIdFilter]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbService.getRisks(projectIdFilter);
      if (error) {
        setError('Failed to fetch risks');
        toast({
          title: 'Error',
          description: 'Failed to load risks',
          variant: 'destructive',
        });
      } else {
        setRisks(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async () => {
    try {
      const response = await dbService.getRisks({
        description: newRiskDescription,
        level: newRiskLevel,
        status: newRiskStatus
      });

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
      const response = await dbService.getRisks(id, updates);
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

  const handleDeleteRisk = async (id) => {
    try {
      const response = await dbService.getRisks(id);
      if (response.error) {
        setError('Failed to delete risk');
        toast({
          title: 'Error',
          description: 'Failed to delete risk',
          variant: 'destructive',
        });
      } else {
        setRisks(risks.filter(risk => risk.id !== id));
        toast({
          title: 'Success',
          description: 'Risk deleted successfully',
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Radar</h1>
            <p className="text-muted-foreground">
              Identify and mitigate project risks effectively
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
            <CardDescription>
              Visualize project risks and their potential impact
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <RiskRadarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
            <CardDescription>
              Manage and track project risks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="projectFilter">Project ID:</Label>
              <Input
                type="text"
                id="projectFilter"
                placeholder="Filter by project ID"
                value={projectIdFilter}
                onChange={(e) => setProjectIdFilter(e.target.value)}
              />
              <Button onClick={fetchRisks} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filter'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="Risk description"
                value={newRiskDescription}
                onChange={(e) => setNewRiskDescription(e.target.value)}
              />
              <Select onValueChange={setNewRiskLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateRisk} disabled={loading}>
                Add Risk
              </Button>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <RiskTable
              risks={risks}
              onUpdateRisk={handleUpdateRisk}
              onDeleteRisk={handleDeleteRisk}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RiskRadar;
