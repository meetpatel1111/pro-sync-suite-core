
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  name: string;
  description?: string;
  category: string;
  probability: number;
  impact: number;
  owner?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  status: string;
  lastReview?: string;
  nextReview?: string;
  // For database compatibility
  level?: string;
  project_id?: string;
  task_id?: string;
  created_at?: string;
}

export async function getAllRisks() {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*');
    
    if (error) throw error;
    
    // Transform data to match Risk interface
    const risks: Risk[] = (data || []).map((risk: any) => ({
      id: risk.id,
      name: risk.title || 'Unknown Risk',
      description: risk.description,
      category: risk.category || 'General',
      probability: risk.probability || 0.5,
      impact: risk.impact || 0.5,
      status: risk.status || 'Open',
      level: risk.level,
      project_id: risk.project_id,
      task_id: risk.task_id,
      created_at: risk.created_at
    }));
    
    return { data: risks };
  } catch (error) {
    console.error('Error fetching risks:', error);
    // Return sample data for development
    return { 
      data: [
        { 
          id: '1', 
          name: 'Schedule Delay', 
          description: 'Project timeline may be affected due to resource constraints',
          category: 'Schedule',
          probability: 0.7,
          impact: 0.8,
          status: 'Open',
          owner: {
            name: 'Jane Smith',
            initials: 'JS'
          },
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: '2', 
          name: 'Budget Overrun', 
          description: 'Project may exceed allocated budget due to unforeseen expenses',
          category: 'Financial',
          probability: 0.6,
          impact: 0.9,
          status: 'Mitigated',
          owner: {
            name: 'John Doe',
            initials: 'JD'
          },
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] as Risk[]
    };
  }
}

export async function createRisk(risk: Omit<Risk, 'id'>) {
  try {
    // Map to database schema
    const riskData = {
      title: risk.name,
      description: risk.description,
      level: risk.level || 'Medium',
      status: risk.status,
      project_id: risk.project_id,
      task_id: risk.task_id
    };
    
    const { data, error } = await supabase
      .from('risks')
      .insert(riskData)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating risk:', error);
    return { 
      data: { 
        id: Math.random().toString(), 
        ...risk,
        created_at: new Date().toISOString()
      } 
    };
  }
}

export async function updateRisk(id: string, updates: Partial<Risk>) {
  try {
    // Map to database schema
    const riskData: any = {};
    if (updates.name) riskData.title = updates.name;
    if (updates.description) riskData.description = updates.description;
    if (updates.level) riskData.level = updates.level;
    if (updates.status) riskData.status = updates.status;
    if (updates.project_id) riskData.project_id = updates.project_id;
    if (updates.task_id) riskData.task_id = updates.task_id;
    
    const { data, error } = await supabase
      .from('risks')
      .update(riskData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating risk:', error);
    return { error };
  }
}

export async function deleteRisk(id: string) {
  try {
    const { data, error } = await supabase
      .from('risks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting risk:', error);
    return { error };
  }
}

export default {
  getAllRisks,
  createRisk,
  updateRisk,
  deleteRisk
};
