
// InsightIQ Service API
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  report_id?: string;  // Handle both id formats
  user_id: string;
  report_type: string;
  created_at?: string;
  data?: any;
}

// Report Functions
export async function getAllReports(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}

export async function createReport(report: Omit<Report, 'id' | 'report_id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

export async function getReportById(id: string) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
}

export async function updateReport(id: string, updates: Partial<Report>) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
}

export async function deleteReport(id: string) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}
