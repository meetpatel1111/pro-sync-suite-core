
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  created_by: string;
  title: string;
  description?: string;
  category: string;
  probability: number;
  impact: number;
  risk_score: number;
  status: 'active' | 'mitigated' | 'closed' | 'monitoring';
  level: 'low' | 'medium' | 'high';
  mitigation_plan?: string;
  contingency_plan?: string;
  owner_id?: string;
  due_date?: string;
  cost_impact_amount?: number;
  time_impact_days?: number;
  affected_areas?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface RiskMitigation {
  id: string;
  risk_id: string;
  title: string;
  description?: string;
  action_type: 'prevent' | 'reduce' | 'transfer' | 'accept';
  assigned_to?: string;
  due_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  effectiveness_rating?: number;
  cost?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  assessed_by: string;
  assessment_date: string;
  probability: number;
  impact: number;
  notes?: string;
  created_at: string;
}

class RiskService {
  async createRisk(risk: Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'risk_score' | 'level'>): Promise<Risk> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const riskData = {
        ...risk,
        created_by: user.user.id,
        user_id: risk.user_id || user.user.id,
      };

      const { data, error } = await supabase
        .from('risks')
        .insert(riskData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw error;
    }
  }

  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating risk:', error);
      throw error;
    }
  }

  async deleteRisk(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting risk:', error);
      throw error;
    }
  }

  async getRisks(filters?: { status?: string; category?: string; project_id?: string }): Promise<Risk[]> {
    try {
      let query = supabase
        .from('risks')
        .select('*')
        .order('risk_score', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching risks:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getRisks:', error);
      return [];
    }
  }

  async getRisk(id: string): Promise<Risk | null> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching risk:', error);
      return null;
    }
  }

  async createMitigation(mitigation: Omit<RiskMitigation, 'id' | 'created_at' | 'updated_at'>): Promise<RiskMitigation> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('risk_mitigations')
        .insert({
          ...mitigation,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating mitigation:', error);
      throw error;
    }
  }

  async updateMitigation(id: string, updates: Partial<RiskMitigation>): Promise<RiskMitigation> {
    try {
      const { data, error } = await supabase
        .from('risk_mitigations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating mitigation:', error);
      throw error;
    }
  }

  async getMitigations(riskId: string): Promise<RiskMitigation[]> {
    try {
      const { data, error } = await supabase
        .from('risk_mitigations')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mitigations:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getMitigations:', error);
      return [];
    }
  }

  async createAssessment(assessment: Omit<RiskAssessment, 'id' | 'created_at'>): Promise<RiskAssessment> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({
          ...assessment,
          assessed_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  async getAssessments(riskId: string): Promise<RiskAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('risk_id', riskId)
        .order('assessment_date', { ascending: false });

      if (error) {
        console.error('Error fetching assessments:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAssessments:', error);
      return [];
    }
  }
}

export const riskService = new RiskService();
