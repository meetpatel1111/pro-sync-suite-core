
// ClientConnect Service API
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  user_id: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at?: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

// Client Functions
export async function getAllClients(userId: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

export async function getClientById(client_id: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
}

export async function updateClient(client_id: string, updates: Partial<Client>) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', client_id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

export async function deleteClient(client_id: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', client_id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

// ClientNote Functions
export async function getClientNotes(client_id: string) {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching client notes:', error);
    throw error;
  }
}

export async function createClientNote(note: Omit<ClientNote, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .insert(note)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating client note:', error);
    throw error;
  }
}

export async function updateClientNote(note_id: string, updates: Partial<ClientNote>) {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .update(updates)
      .eq('id', note_id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating client note:', error);
    throw error;
  }
}

export async function deleteClientNote(note_id: string) {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', note_id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting client note:', error);
    throw error;
  }
}
