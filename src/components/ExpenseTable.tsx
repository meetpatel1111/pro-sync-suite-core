
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
import { MoreHorizontal, Download, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample expense data
const expenses = [
  {
    id: 1,
    description: 'Developer Licenses',
    category: 'Development',
    date: '2025-04-10',
    amount: 1250.00,
    status: 'Approved',
    approvedBy: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    receipt: true,
  },
  {
    id: 2,
    description: 'Social Media Campaign',
    category: 'Marketing',
    date: '2025-04-08',
    amount: 3600.00,
    status: 'Approved',
    approvedBy: { name: 'Jamie Rivera', avatar: '/avatar-6.png', initials: 'JR' },
    receipt: true,
  },
  {
    id: 3,
    description: 'Server Hosting (Q2)',
    category: 'Operations',
    date: '2025-04-05',
    amount: 2150.00,
    status: 'Approved',
    approvedBy: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    receipt: true,
  },
  {
    id: 4,
    description: 'Design Software Subscription',
    category: 'Development',
    date: '2025-04-03',
    amount: 980.00,
    status: 'Approved',
    approvedBy: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    receipt: true,
  },
  {
    id: 5,
    description: 'Team Lunch',
    category: 'Operations',
    date: '2025-04-12',
    amount: 345.00,
    status: 'Pending',
    approvedBy: null,
    receipt: true,
  },
];

const ExpenseTable = () => {
  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>{expense.category}</TableCell>
            <TableCell>{formatDate(expense.date)}</TableCell>
            <TableCell>{formatCurrency(expense.amount)}</TableCell>
            <TableCell>
              {expense.status === 'Approved' ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600">Approved</Badge>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={expense.approvedBy.avatar} alt={expense.approvedBy.name} />
                    <AvatarFallback>{expense.approvedBy.initials}</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {expense.receipt && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    {expense.status === 'Pending' && (
                      <DropdownMenuItem>Approve</DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseTable;
