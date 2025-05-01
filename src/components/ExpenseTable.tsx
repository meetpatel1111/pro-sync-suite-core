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

import { useEffect, useState } from 'react';
import { getAllTransactions, getAllCategories, Transaction, Category } from '@/services/budgetbuddy';
import { useAuth } from '@/hooks/useAuth';

// ExpenseTable now fetches live data from the backend


// Update the Transaction interface to include missing properties
interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  merchant: string;
  category: string; // Add missing property
  status: string; // Add missing property
  approvedBy?: string; // Add missing property
  receipt?: string; // Add missing property
  // Add other properties as needed
}

const ExpenseTable = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getAllTransactions(user.id),
      getAllCategories(user.id)
    ]).then(([txRes, catRes]) => {
      setExpenses(txRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

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
