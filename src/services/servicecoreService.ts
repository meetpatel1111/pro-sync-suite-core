
import { supabase } from '@/integrations/supabase/client';
import type { Ticket, TicketComment, ChangeRequest, ProblemTicket } from '@/types/servicecore';

export const servicecoreService = {
  // Tickets
  async getTickets(userId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async getTicket(id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  async createTicket(ticket: Partial<Ticket>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();
    
    return { data, error };
  },

  async updateTicket(id: string, updates: Partial<Ticket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Ticket Comments
  async getTicketComments(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  async createTicketComment(comment: Partial<TicketComment>) {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert(comment)
      .select()
      .single();
    
    return { data, error };
  },

  // Change Requests
  async getChangeRequests(userId: string) {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createChangeRequest(changeRequest: Partial<ChangeRequest>) {
    const { data, error } = await supabase
      .from('change_requests')
      .insert(changeRequest)
      .select()
      .single();
    
    return { data, error };
  },

  // Problem Tickets
  async getProblemTickets(userId: string) {
    const { data, error } = await supabase
      .from('problem_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createProblemTicket(problemTicket: Partial<ProblemTicket>) {
    const { data, error } = await supabase
      .from('problem_tickets')
      .insert(problemTicket)
      .select()
      .single();
    
    return { data, error };
  }
};
