
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Risk, riskService } from '@/services/riskService';
import RiskDialog from '@/components/RiskDialog';
import RiskMitigationDialog from '@/components/RiskMitigationDialog';
import { useToast } from '@/hooks/use-toast';

interface RiskTableProps {
  onRefresh: () => void;
}

const RiskTable: React.FC<RiskTableProps> = ({ onRefresh }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<Risk | undefined>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mitigationDialogOpen, setMitigationDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await riskService.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load risks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await riskService.deleteRisk(id);
      toast({
        title: 'Success',
        description: 'Risk deleted successfully'
      });
      loadData();
      onRefresh();
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete risk',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setEditDialogOpen(true);
  };

  const handleAddMitigation = (risk: Risk) => {
    setSelectedRisk(risk);
    setMitigationDialogOpen(true);
  };

  const handleDialogSave = () => {
    loadData();
    onRefresh();
    setEditDialogOpen(false);
    setMitigationDialogOpen(false);
    setSelectedRisk(undefined);
  };

  const getRiskIcon = (riskScore: number) => {
    if (riskScore >= 0.7) return <ShieldAlert className="h-4 w-4 text-red-600" />;
    if (riskScore >= 0.3) return <Shield className="h-4 w-4 text-amber-600" />;
    return <ShieldCheck className="h-4 w-4 text-green-600" />;
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 0.7) return { label: 'High', color: 'bg-red-100 text-red-800' };
    if (riskScore >= 0.3) return { label: 'Medium', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'mitigated': return 'bg-blue-100 text-blue-800';
      case 'monitoring': return 'bg-amber-100 text-amber-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No risks found</h3>
        <p className="text-muted-foreground mb-4">
          Start by creating your first risk assessment
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => {
            const riskLevel = getRiskLevel(risk.risk_score);
            return (
              <TableRow key={risk.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRiskIcon(risk.risk_score)}
                    <div>
                      <div className="font-medium">{risk.title}</div>
                      {risk.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {risk.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {risk.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={riskLevel.color}>
                    {riskLevel.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(risk.status)}>
                    {risk.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {Math.round(risk.risk_score * 100) / 100}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    P: {Math.round(risk.probability * 100)}% | I: {Math.round(risk.impact * 100)}%
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(risk)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddMitigation(risk)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(risk.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedRisk && (
        <>
          <RiskDialog
            risk={selectedRisk}
            onSave={handleDialogSave}
            trigger={<div />}
          />
          
          <RiskMitigationDialog
            riskId={selectedRisk.id}
            open={mitigationDialogOpen}
            onOpenChange={setMitigationDialogOpen}
            onSave={handleDialogSave}
          />
        </>
      )}

      {editDialogOpen && (
        <div className="fixed inset-0 z-50">
          <RiskDialog
            risk={selectedRisk}
            onSave={handleDialogSave}
            trigger={<div />}
          />
        </div>
      )}
    </>
  );
};

export default RiskTable;
