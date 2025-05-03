
import { supabase } from '@/integrations/supabase/client';

// InsightIQ functions
const getDashboards = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboards:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching dashboards:', error);
    return { data: null, error };
  }
};

const getWidgets = async (dashboardId: string) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching widgets:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching widgets:', error);
    return { data: null, error };
  }
};

const createDashboard = async (dashboardData: any) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .insert(dashboardData)
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating dashboard:', error);
    return { data: null, error };
  }
};

const updateDashboard = async (dashboardId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .update(updates)
      .eq('id', dashboardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating dashboard:', error);
    return { data: null, error };
  }
};

const deleteDashboard = async (dashboardId: string) => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) {
      console.error('Error deleting dashboard:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting dashboard:', error);
    return { data: null, error };
  }
};

const createWidget = async (widgetData: any) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .insert(widgetData)
      .select()
      .single();

    if (error) {
      console.error('Error creating widget:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating widget:', error);
    return { data: null, error };
  }
};

const deleteWidget = async (widgetId: string) => {
  try {
    const { data, error } = await supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId);

    if (error) {
      console.error('Error deleting widget:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting widget:', error);
    return { data: null, error };
  }
};

// Export all functions
export const insightService = {
  getDashboards,
  getWidgets,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createWidget,
  deleteWidget
};

export default insightService;
