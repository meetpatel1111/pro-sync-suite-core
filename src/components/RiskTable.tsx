
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, MoreHorizontal, AlertTriangle, ShieldAlert, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/dbService';

// Risk type definition (adjust as needed)
type Risk = {
  id: string;
  name: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  owner: { name: string; avatar: string; initials: string };
  status: string;
  lastReview: string;
  nextReview: string;
};


const RiskTable = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    const fetchRisks = async () => {
      setLoading(true);
      try {
        if (!projectId) {
          setRisks([]);
          setLoading(false);
          return;
        }
        const data = await dbService.getAiRisk(projectId);
        setRisks(data ? [data] : []);
      } catch (error) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  // Calculate risk level
  const getRiskLevel = (probability, impact) => {
    const riskScore = probability * impact;
    if (riskScore >= 15) return { label: 'High', color: 'bg-red-500' };
    if (riskScore >= 8) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Low', color: 'bg-emerald-500' };
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="projectIdInput" style={{ marginRight: 8 }}>Project ID:</label>
        <input
          id="projectIdInput"
          type="text"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="Enter project ID"
          style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
        />
      </div>
      {!projectId && (
        <div style={{ marginBottom: 16, color: '#d97706' }}>
          Please enter a Project ID to view risks.
        </div>
      )}
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Risk</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Next Review</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">Loading risks...</TableCell>
          </TableRow>
        ) : risks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">No risks found.</TableCell>
          </TableRow>
        ) : risks.map((risk) => {
          const riskLevel = getRiskLevel(risk.probability, risk.impact);
          
          return (
            <TableRow key={risk.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{risk.name}</div>
                  <div className="text-sm text-muted-foreground">{risk.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{risk.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={risk.owner.avatar} alt={risk.owner.name} />
                    <AvatarFallback>{risk.owner.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{risk.owner.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {risk.status === 'Open' ? (
                  <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                    Open
                  </Badge>
                ) : risk.status === 'Mitigated' ? (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50">
                    Mitigated
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                    Closed
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(risk.nextReview)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="h-8 flex gap-1">
                    {riskLevel.label === 'High' ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : riskLevel.label === 'Medium' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    <span>Manage</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Risk</DropdownMenuItem>
                      <DropdownMenuItem>Add Mitigation</DropdownMenuItem>
                      <DropdownMenuItem>Assign Owner</DropdownMenuItem>
                      <DropdownMenuItem>Close Risk</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
};

export default RiskTable;
