
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/utils/dbtypes';
import { safeQueryTable } from '@/utils/db-helpers';

// Helper function for error handling
const handleError = (error: any) => {
  console.error('InsightIQ service error:', error);
  return { error, data: null };
};

// Get reports
export const getReports = async (userId: string) => {
  try {
    // Use safeQueryTable instead of direct query since the reports table might not be in types
    const { data, error } = await safeQueryTable<Report>('reports', query =>
      query.select('*').eq('user_id', userId)
    );
    
    if (error) return handleError(error);
    
    return { data: data as Report[] };
  } catch (error) {
    return handleError(error);
  }
};

// Create report
export const createReport = async (reportData: any) => {
  try {
    // Use safeQueryTable for insert operation
    const { data, error } = await safeQueryTable<Report>('reports', query =>
      query.insert(reportData).select()
    );
    
    if (error) return handleError(error);
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Get report by ID
export const getReportById = async (reportId: string) => {
  try {
    // Use safeQueryTable for select by ID
    const { data, error } = await safeQueryTable<Report>('reports', query =>
      query.select('*').eq('id', reportId).single()
    );
    
    if (error) return handleError(error);
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Alternative implementations using custom types to bypass TypeScript errors
// These would be used if RPC functions aren't available

// Get time entries for report
export const getTimeEntriesForReport = async (params: any) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('*');
    
    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }
    
    if (params.startDate) {
      query = query.gte('date', params.startDate);
    }
    
    if (params.endDate) {
      query = query.lte('date', params.endDate);
    }
    
    if (params.project) {
      query = query.eq('project', params.project);
    }
    
    const { data, error } = await query;
    
    if (error) return handleError(error);
    return { data };
  } catch (error) {
    return handleError(error);
  }
};

// Get project metrics
export const getProjectMetrics = async (projectId: string) => {
  try {
    // This would typically involve multiple queries
    const metrics = {
      totalHours: 0,
      taskCompletion: 0,
      recentActivities: []
    };
    
    // Get time entries for the project
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('project_id', projectId);
    
    if (!timeError && timeEntries) {
      metrics.totalHours = timeEntries.reduce((acc, entry) => acc + entry.time_spent, 0) / 60; // Convert minutes to hours
    }
    
    // Get tasks for the project
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status')
      .eq('project', projectId);
    
    if (!tasksError && tasks && tasks.length > 0) {
      const completed = tasks.filter(t => t.status === 'completed').length;
      metrics.taskCompletion = (completed / tasks.length) * 100;
    }
    
    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (!activitiesError && activities) {
      metrics.recentActivities = activities;
    }
    
    return { data: metrics };
  } catch (error) {
    return handleError(error);
  }
};

export default {
  getReports,
  createReport,
  getReportById,
  getTimeEntriesForReport,
  getProjectMetrics
};
