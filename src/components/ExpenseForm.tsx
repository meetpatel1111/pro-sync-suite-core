
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/utils/dbtypes';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState<Date>(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const categories = [
    'Travel',
    'Meals',
    'Supplies',
    'Software',
    'Hardware',
    'Services',
    'Marketing',
    'Utilities',
    'Rent',
    'Other'
  ];
  
  const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'
  ];
  
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }
        
        setProjects(data || []);
      } catch (error) {
        console.error('Exception fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create expenses',
        variant: 'destructive',
      });
      return;
    }
    
    if (!description || !amount) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let receiptUrl = null;
      
      if (receipt) {
        // Upload receipt to storage
        const fileExt = receipt.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `expenses/${user.id}/${fileName}`;
        
        // Create receipts bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets();
        const receiptsBucketExists = buckets?.some(bucket => bucket.name === 'receipts');
        
        if (!receiptsBucketExists) {
          await supabase.storage.createBucket('receipts', {
            public: false
          });
        }
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receipt);
          
        if (uploadError) {
          console.error('Error uploading receipt:', uploadError);
          toast({
            title: 'Upload failed',
            description: 'Failed to upload receipt',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
          
        receiptUrl = publicUrl;
      }
      
      // Create expense record
      const expenseData = {
        description,
        amount: parseFloat(amount),
        date: date.toISOString(),
        category_id: category || null,
        project_id: projectId === 'none' ? null : projectId || null,
        user_id: user.id,
        currency,
        receipt_url: receiptUrl,
        status: 'pending',
      };

      console.log('Creating expense with data:', expenseData);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select();
        
      if (error) {
        console.error('Error creating expense:', error);
        toast({
          title: 'Error',
          description: `Failed to create expense: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Expense created successfully:', data);
      
      toast({
        title: 'Success',
        description: 'Expense created successfully',
      });
      
      // Reset form
      setDescription('');
      setAmount('');
      setCategory('');
      setProjectId('');
      setCurrency('USD');
      setDate(new Date());
      setReceipt(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Exception creating expense:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Create New Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project">Project (Optional)</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="receipt">Receipt (Optional)</Label>
          {receipt ? (
            <div className="flex items-center space-x-2 p-2 border rounded-md">
              <span className="text-sm text-muted-foreground flex-1 truncate">
                {receipt.name}
              </span>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                onClick={removeReceipt}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                className="hidden"
                onChange={handleReceiptChange}
                accept="image/png,image/jpeg,application/pdf"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receipt')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Expense'}
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;
