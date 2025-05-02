
import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Eye, FileText, MoreHorizontal, ArrowUpDown, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Updated Transaction interface
interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  payee: string;
  category?: string;
  status?: string;
  approvedBy?: {
    name: string;
    avatar: string;
    initials: string;
  };
  receipt?: string;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export interface ExpenseTableProps {
  transactions: Transaction[];
  title?: string;
  description?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ExpenseTable({ 
  transactions,
  title = "Recent Expenses",
  description = "A list of your recent expenses and receipts.",
  onApprove,
  onReject
}: ExpenseTableProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (sortColumn === 'amount') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (sortColumn === 'date') {
      return sortDirection === 'asc' 
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortDirection === 'asc' ? -1 : 1;
    if (!bValue) return sortDirection === 'asc' ? 1 : -1;
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const viewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('date')} className="cursor-pointer w-[100px]">
                Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('description')} className="cursor-pointer">
                Description {sortColumn === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('amount')} className="cursor-pointer text-right">
                Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category || 'N/A'}</TableCell>
                <TableCell className="text-right">{formatter.format(transaction.amount)}</TableCell>
                <TableCell>
                  {transaction.status === 'approved' ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Approved</Badge>
                      {transaction.approvedBy && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={transaction.approvedBy.avatar} alt={transaction.approvedBy.name} />
                          <AvatarFallback>{transaction.approvedBy.initials}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ) : transaction.status === 'rejected' ? (
                    <Badge className="bg-red-500">Rejected</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {transaction.receipt && (
                        <DropdownMenuItem onClick={() => viewReceipt(transaction.receipt!)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Receipt
                        </DropdownMenuItem>
                      )}
                      {transaction.status === 'pending' && onApprove && (
                        <DropdownMenuItem onClick={() => onApprove(transaction.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {transaction.status === 'pending' && onReject && (
                        <DropdownMenuItem onClick={() => onReject(transaction.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
              <DialogDescription>Transaction receipt or invoice</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              {selectedReceipt && (
                <img 
                  src={selectedReceipt}
                  alt="Receipt"
                  className="max-h-[500px] object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ExpenseTable;
