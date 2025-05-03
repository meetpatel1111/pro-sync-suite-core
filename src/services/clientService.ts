
import { supabase } from '@/integrations/supabase/client';

// Client functions
const getClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching clients:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching clients:', error);
    return { data: null, error };
  }
};

const getClientById = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client by ID:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching client by ID:', error);
    return { data: null, error };
  }
};

const createClient = async (clientData: any) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating client:', error);
    return { data: null, error };
  }
};

const updateClient = async (clientId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating client:', error);
    return { data: null, error };
  }
};

const deleteClient = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting client:', error);
    return { data: null, error };
  }
};

// Client Notes functions
const getClientNotes = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client notes:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching client notes:', error);
    return { data: null, error };
  }
};

const createClientNote = async (noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating client note:', error);
    return { data: null, error };
  }
};

const updateClientNote = async (noteId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating client note:', error);
    return { data: null, error };
  }
};

const deleteClientNote = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting client note:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting client note:', error);
    return { data: null, error };
  }
};

// Export all functions
export const clientService = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientNotes,
  createClientNote,
  updateClientNote,
  deleteClientNote
};

export default clientService;
