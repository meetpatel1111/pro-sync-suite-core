
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
import { Shield, MoreHorizontal, AlertTriangle, ShieldAlert, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample risk data
const risks = [
  {
    id: 1,
    name: 'Server Outage',
    description: 'Risk of cloud server outage affecting service availability',
    category: 'Technical',
    probability: 2,
    impact: 5,
    owner: { name: 'Taylor Wong', avatar: '/avatar-4.png', initials: 'TW' },
    status: 'Open',
    lastReview: '2025-04-05',
    nextReview: '2025-04-20',
  },
  {
    id: 2,
    name: 'Data Breach',
    description: 'Risk of unauthorized access to sensitive customer data',
    category: 'Technical',
    probability: 1,
    impact: 5,
    owner: { name: 'Casey Johnson', avatar: '/avatar-7.png', initials: 'CJ' },
    status: 'Mitigated',
    lastReview: '2025-04-08',
    nextReview: '2025-04-22',
  },
  {
    id: 3,
    name: 'API Integration Delay',
    description: 'Potential delay in third-party API integration',
    category: 'Technical',
    probability: 4,
    impact: 3,
    owner: { name: 'Jordan Smith', avatar: '/avatar-3.png', initials: 'JS' },
    status: 'Open',
    lastReview: '2025-04-01',
    nextReview: '2025-04-15',
  },
  {
    id: 4,
    name: 'Scope Creep',
    description: 'Expanding project requirements beyond initial specifications',
    category: 'Schedule',
    probability: 4,
    impact: 4,
    owner: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    status: 'Open',
    lastReview: '2025-04-07',
    nextReview: '2025-04-21',
  },
  {
    id: 5,
    name: 'Budget Overrun',
    description: 'Project expenses exceeding allocated budget',
    category: 'Financial',
    probability: 3,
    impact: 4,
    owner: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    status: 'Mitigated',
    lastReview: '2025-04-06',
    nextReview: '2025-04-20',
  },
];

const RiskTable = () => {
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
        {risks.map((risk) => {
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
  );
};

export default RiskTable;
