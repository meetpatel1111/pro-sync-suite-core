
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expense } from '@/utils/dbtypes';
import { format } from 'date-fns';
import { FileText, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExpenseTableProps {
  expensesData?: Expense[];
  loading?: boolean;
}

const ExpenseTable = ({ expensesData = [], loading = false }: ExpenseTableProps) => {
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  
  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }
  
  if (expensesData.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No expenses found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first expense to get started.
        </p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expensesData.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: expense.currency || 'USD'
                }).format(expense.amount)}
              </TableCell>
              <TableCell>
                {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>{expense.category_id || 'Uncategorized'}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(expense.status)}>
                  {expense.status || 'Pending'}
                </Badge>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                    {expense.receipt_url && (
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        View Receipt
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;
