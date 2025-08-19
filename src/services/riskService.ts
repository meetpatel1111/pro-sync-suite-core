
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  probability: number;
  impact: number;
  status: 'active' | 'mitigated' | 'closed' | 'monitoring';
  risk_score: number;
  project_id?: string;
  task_id?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  mitigation_plan?: string;
  tags?: string[];
  affected_areas?: string[];
  likelihood_description?: string;
  impact_description?: string;
  cost_impact?: number;
  time_impact_days?: number;
}

export interface RiskMitigation {
  id: string;
  risk_id: string;
  action: string;
  responsible_party?: string;
  due_date?: string;
  status: 'planned' | 'in_progress' | 'completed';
  cost?: number;
  effectiveness_rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  assessed_by: string;
  assessment_date: string;
  probability: number;
  impact: number;
  risk_score: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class RiskService {
  async createRisk(risk: Omit<Risk, 'id' | 'user_id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Risk> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const riskScore = risk.probability * risk.impact;

      const { data, error } = await supabase
        .from('risks')
        .insert({
          user_id: user.user.id,
          created_by: user.user.id,
          risk_score: riskScore,
          tags: risk.tags || [],
          affected_areas: risk.affected_areas || [],
          ...risk
        })
        .select()
        .single();

      if (error) throw error;
      return data as Risk;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw error;
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
      return data as Risk;
    } catch (error) {
      console.error('Error getting risk:', error);
      return null;
    }
  }

  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    try {
      let updateData = { ...updates };
      
      // Calculate risk_score if probability or impact changed
      if (updates.probability !== undefined || updates.impact !== undefined) {
        const current = await this.getRisk(id);
        if (current) {
          const probability = updates.probability ?? current.probability;
          const impact = updates.impact ?? current.impact;
          updateData.risk_score = probability * impact;
        }
      }

      const { data, error } = await supabase
        .from('risks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Risk;
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

  async getUserRisks(userId: string): Promise<Risk[]> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Risk[]) || [];
    } catch (error) {
      console.error('Error getting user risks:', error);
      return [];
    }
  }

  async getProjectRisks(projectId: string): Promise<Risk[]> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId)
        .order('risk_score', { ascending: false });

      if (error) throw error;
      return (data as Risk[]) || [];
    } catch (error) {
      console.error('Error getting project risks:', error);
      return [];
    }
  }

  async createMitigation(mitigation: Omit<RiskMitigation, 'id' | 'created_at' | 'updated_at'>): Promise<RiskMitigation> {
    try {
      // For now, return a mock object since risk_mitigations table may not exist
      const mockMitigation: RiskMitigation = {
        id: 'mock-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...mitigation
      };
      return mockMitigation;
    } catch (error) {
      console.error('Error creating mitigation:', error);
      throw error;
    }
  }

  async getMitigations(riskId: string): Promise<RiskMitigation[]> {
    try {
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Error getting mitigations:', error);
      return [];
    }
  }

  async createAssessment(assessment: Omit<RiskAssessment, 'id' | 'assessed_by' | 'created_at' | 'updated_at'>): Promise<RiskAssessment> {
    try {
      // For now, return a mock object since risk_assessments table may not exist
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const mockAssessment: RiskAssessment = {
        id: 'mock-id',
        assessed_by: user.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...assessment
      };
      return mockAssessment;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  async getAssessments(riskId: string): Promise<RiskAssessment[]> {
    try {
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Error getting assessments:', error);
      return [];
    }
  }
}

export const riskService = new RiskService();
