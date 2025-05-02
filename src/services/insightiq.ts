
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  report_id?: string;
  report_type: string;
  user_id: string;
  created_at?: string;
  data?: any;
}

export async function getAllReports(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data: data as Report[] };
  } catch (error) {
    console.error('Error fetching reports:', error);
    // Return sample reports for development
    return { 
      data: [
        { id: '1', report_id: '1', report_type: 'Resource Utilization', user_id: userId, created_at: new Date().toISOString() },
        { id: '2', report_id: '2', report_type: 'Project Performance', user_id: userId, created_at: new Date().toISOString() },
        { id: '3', report_id: '3', report_type: 'Budget Analysis', user_id: userId, created_at: new Date().toISOString() }
      ] as Report[] 
    };
  }
}

export async function createReport(report: Omit<Report, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating report:', error);
    // Return mock data for development
    return { 
      data: { 
        id: Math.random().toString(), 
        ...report, 
        created_at: new Date().toISOString() 
      } 
    };
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
    return { error };
  }
}

export default {
  getAllReports,
  createReport,
  deleteReport
};
