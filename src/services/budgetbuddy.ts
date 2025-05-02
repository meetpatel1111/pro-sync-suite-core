
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  merchant: string;
  category: string;
  status: string;
  approvedBy?: {
    avatar: string;
    name: string;
    initials: string;
  };
  receipt?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at?: string;
}

export const getAllTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  return { data, error };
};

export const getAllCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  return { data, error };
};

export const createTransaction = async (transaction: Partial<Transaction>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();

  return { data, error };
};

export const deleteTransaction = async (transactionId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  return { data, error };
};
