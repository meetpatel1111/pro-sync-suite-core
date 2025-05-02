
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  client_id?: string;
  name: string;
  industry?: string;
  user_id?: string;
  created_at?: string;
}

export const getAllClients = async (userId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  return { data, error };
};

export const createClient = async (client: Partial<Client>) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select();

  return { data, error };
};

export const deleteClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .delete()
    .eq('client_id', clientId);

  return { data, error };
};
