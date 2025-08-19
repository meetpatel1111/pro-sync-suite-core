
import { supabase } from '@/integrations/supabase/client';

export interface Risk {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  probability: number;
  impact: number;
  risk_score: number;
  status: 'active' | 'mitigated' | 'closed' | 'monitoring';
  mitigation_plan?: string;
  owner_id?: string;
  project_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_reviewed_at?: string;
  review_frequency_days?: number;
  tags?: string[];
  affected_areas?: string[];
  cost_impact?: number;
  time_impact_days?: number;
}

export interface RiskMitigation {
  id: string;
  risk_id: string;
  action: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  assignee_id?: string;
  due_date?: string;
  progress: number;
  cost?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  completed_at?: string;
  notes?: string;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  assessment_date: string;
  probability: number;
  impact: number;
  risk_score: number;
  rationale?: string;
  assessed_by: string;
  created_at: string;
}

class RiskService {
  async createRisk(risk: Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'risk_score' | 'user_id'>): Promise<Risk> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const riskScore = risk.probability * risk.impact;
      const riskData = {
        ...risk,
        user_id: user.user.id,
        created_by: user.user.id,
        risk_score: riskScore,
      };

      const { data, error } = await supabase
        .from('risks')
        .insert(riskData)
        .select()
        .single();

      if (error) throw error;
      return data as Risk;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw error;
    }
  }

  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    try {
      const updateData = { ...updates };
      
      // Calculate risk score if probability or impact is being updated
      if (updates.probability !== undefined || updates.impact !== undefined) {
        const { data: currentRisk } = await supabase
          .from('risks')
          .select('probability, impact')
          .eq('id', id)
          .single();

        if (currentRisk) {
          const probability = updates.probability ?? currentRisk.probability;
          const impact = updates.impact ?? currentRisk.impact;
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
      
      return (data || []) as Risk[];
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
      return data as Risk;
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
      return data as RiskMitigation;
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
      return data as RiskMitigation;
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
      
      return (data || []) as RiskMitigation[];
    } catch (error) {
      console.error('Error in getMitigations:', error);
      return [];
    }
  }

  async createAssessment(assessment: Omit<RiskAssessment, 'id' | 'created_at' | 'risk_score'>): Promise<RiskAssessment> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const riskScore = assessment.probability * assessment.impact;
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({
          ...assessment,
          risk_score: riskScore,
          assessed_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as RiskAssessment;
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
      
      return (data || []) as RiskAssessment[];
    } catch (error) {
      console.error('Error in getAssessments:', error);
      return [];
    }
  }

  async getRiskAnalytics(): Promise<{
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const { data: risks, error } = await supabase
        .from('risks')
        .select('risk_score, category, status');

      if (error) {
        console.error('Error fetching risk analytics:', error);
        return {
          totalRisks: 0,
          highRisks: 0,
          mediumRisks: 0,
          lowRisks: 0,
          byCategory: {},
          byStatus: {}
        };
      }

      const safeRisks = (risks || []) as Array<{
        risk_score: number;
        category: string;
        status: string;
      }>;

      const analytics = {
        totalRisks: safeRisks.length,
        highRisks: safeRisks.filter(r => r.risk_score >= 0.7).length,
        mediumRisks: safeRisks.filter(r => r.risk_score >= 0.3 && r.risk_score < 0.7).length,
        lowRisks: safeRisks.filter(r => r.risk_score < 0.3).length,
        byCategory: {} as Record<string, number>,
        byStatus: {} as Record<string, number>
      };

      safeRisks.forEach(risk => {
        analytics.byCategory[risk.category] = (analytics.byCategory[risk.category] || 0) + 1;
        analytics.byStatus[risk.status] = (analytics.byStatus[risk.status] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error('Error in getRiskAnalytics:', error);
      return {
        totalRisks: 0,
        highRisks: 0,
        mediumRisks: 0,
        lowRisks: 0,
        byCategory: {},
        byStatus: {}
      };
    }
  }

  async getProjectRisks(projectId: string): Promise<Risk[]> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId)
        .order('risk_score', { ascending: false });

      if (error) {
        console.error('Error fetching project risks:', error);
        return [];
      }
      
      return (data || []) as Risk[];
    } catch (error) {
      console.error('Error in getProjectRisks:', error);
      return [];
    }
  }

  async createRiskFromTask(taskId: string, riskData: Partial<Risk>): Promise<Risk | null> {
    try {
      // Get task details for context
      const { data: task } = await supabase
        .from('tasks')
        .select('title, description, project_id')
        .eq('id', taskId)
        .single();

      return this.createRisk({
        title: riskData.title || `Risk related to task: ${task?.title || 'Unknown Task'}`,
        description: riskData.description || `Risk identified from task: ${task?.description || 'No description'}`,
        category: riskData.category || 'technical',
        probability: riskData.probability || 0.5,
        impact: riskData.impact || 0.5,
        project_id: task?.project_id,
        status: 'active',
        ...riskData
      });
    } catch (error) {
      console.error('Error creating risk from task:', error);
      return null;
    }
  }

  async linkRiskToProject(riskId: string, projectId: string): Promise<void> {
    try {
      await this.updateRisk(riskId, { project_id: projectId });
    } catch (error) {
      console.error('Error linking risk to project:', error);
      throw error;
    }
  }
}

export const riskService = new RiskService();
