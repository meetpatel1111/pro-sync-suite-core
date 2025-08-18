
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, MoreHorizontal, AlertTriangle, ShieldAlert, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Risk, RiskMitigation, riskService } from '@/services/riskService';
import { useToast } from '@/hooks/use-toast';
import RiskDialog from './RiskDialog';
import RiskMitigationDialog from './RiskMitigationDialog';

interface RiskTableProps {
  onRefresh?: () => void;
}

const RiskTable: React.FC<RiskTableProps> = ({ onRefresh }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [mitigations, setMitigations] = useState<Record<string, RiskMitigation[]>>({});
  const [loading, setLoading] = useState(true);
  const [deleteRisk, setDeleteRisk] = useState<Risk | null>(null);
  const [editRisk, setEditRisk] = useState<Risk | null>(null);
  const [mitigationDialog, setMitigationDialog] = useState<{
    open: boolean;
    riskId: string;
    mitigation?: RiskMitigation;
  }>({ open: false, riskId: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const risksData = await riskService.getRisks();
      setRisks(risksData);
      
      // Load mitigations for each risk
      const mitigationsData: Record<string, RiskMitigation[]> = {};
      for (const risk of risksData) {
        mitigationsData[risk.id] = await riskService.getMitigations(risk.id);
      }
      setMitigations(mitigationsData);
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

  const handleDelete = async () => {
    if (!deleteRisk) return;
    
    try {
      await riskService.deleteRisk(deleteRisk.id);
      toast({
        title: 'Success',
        description: 'Risk deleted successfully'
      });
      loadData();
      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete risk',
        variant: 'destructive'
      });
    } finally {
      setDeleteRisk(null);
    }
  };

  // Calculate risk level
  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 0.7) return { label: 'High', color: 'bg-red-500' };
    if (riskScore >= 0.3) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Low', color: 'bg-emerald-500' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-amber-500 border-amber-200 bg-amber-50';
      case 'mitigated': return 'text-emerald-500 border-emerald-200 bg-emerald-50';
      case 'monitoring': return 'text-blue-500 border-blue-200 bg-blue-50';
      case 'closed': return 'text-gray-500 border-gray-200 bg-gray-50';
      default: return 'text-amber-500 border-amber-200 bg-amber-50';
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
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
          Start by creating your first risk assessment.
        </p>
        <RiskDialog onSave={loadData} />
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Risk</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mitigations</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => {
            const riskLevel = getRiskLevel(risk.risk_score);
            const riskMitigations = mitigations[risk.id] || [];
            
            return (
              <TableRow key={risk.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {risk.description || 'No description'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {risk.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Score: {Math.round(risk.risk_score * 100) / 100}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(risk.status)}`}>
                    {risk.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{riskMitigations.length} actions</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMitigationDialog({ open: true, riskId: risk.id })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatDate(risk.due_date)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditRisk(risk)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditRisk(risk)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setMitigationDialog({ open: true, riskId: risk.id })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Mitigation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteRisk(risk)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Risk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit Risk Dialog */}
      {editRisk && (
        <RiskDialog
          risk={editRisk}
          onSave={() => {
            loadData();
            onRefresh?.();
            setEditRisk(null);
          }}
          trigger={null}
        />
      )}

      {/* Mitigation Dialog */}
      <RiskMitigationDialog
        riskId={mitigationDialog.riskId}
        mitigation={mitigationDialog.mitigation}
        open={mitigationDialog.open}
        onOpenChange={(open) => setMitigationDialog(prev => ({ ...prev, open }))}
        onSave={() => {
          loadData();
          onRefresh?.();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRisk} onOpenChange={() => setDeleteRisk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Risk</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRisk?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RiskTable;
