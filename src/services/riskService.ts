
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
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const riskData = {
      ...risk,
      user_id: user.user.id,
      created_by: user.user.id
    };

    const { data, error } = await supabase.rpc('create_risk', { risk_data: riskData });
    
    if (error) {
      console.error('Error creating risk:', error);
      // Fallback to direct insert if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('risks' as any)
        .insert(riskData)
        .select()
        .single();
      
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    
    return data;
  }

  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    const { data, error } = await supabase
      .from('risks' as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRisk(id: string): Promise<void> {
    const { error } = await supabase
      .from('risks' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getRisks(filters?: { status?: string; category?: string; project_id?: string }): Promise<Risk[]> {
    let query = supabase
      .from('risks' as any)
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
  }

  async getRisk(id: string): Promise<Risk> {
    const { data, error } = await supabase
      .from('risks' as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createMitigation(mitigation: Omit<RiskMitigation, 'id' | 'created_at' | 'updated_at'>): Promise<RiskMitigation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('risk_mitigations' as any)
      .insert({
        ...mitigation,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMitigation(id: string, updates: Partial<RiskMitigation>): Promise<RiskMitigation> {
    const { data, error } = await supabase
      .from('risk_mitigations' as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMitigations(riskId: string): Promise<RiskMitigation[]> {
    const { data, error } = await supabase
      .from('risk_mitigations' as any)
      .select('*')
      .eq('risk_id', riskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mitigations:', error);
      return [];
    }
    return data || [];
  }

  async createAssessment(assessment: Omit<RiskAssessment, 'id' | 'created_at' | 'risk_score'>): Promise<RiskAssessment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('risk_assessments' as any)
      .insert({
        ...assessment,
        assessed_by: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAssessments(riskId: string): Promise<RiskAssessment[]> {
    const { data, error } = await supabase
      .from('risk_assessments' as any)
      .select('*')
      .eq('risk_id', riskId)
      .order('assessment_date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }
    return data || [];
  }

  async getRiskAnalytics(): Promise<{
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const { data: risks, error } = await supabase
      .from('risks' as any)
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

    const analytics = {
      totalRisks: risks?.length || 0,
      highRisks: risks?.filter(r => r.risk_score >= 0.7).length || 0,
      mediumRisks: risks?.filter(r => r.risk_score >= 0.3 && r.risk_score < 0.7).length || 0,
      lowRisks: risks?.filter(r => r.risk_score < 0.3).length || 0,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>
    };

    risks?.forEach(risk => {
      analytics.byCategory[risk.category] = (analytics.byCategory[risk.category] || 0) + 1;
      analytics.byStatus[risk.status] = (analytics.byStatus[risk.status] || 0) + 1;
    });

    return analytics;
  }

  // Integration methods
  async getProjectRisks(projectId: string): Promise<Risk[]> {
    const { data, error } = await supabase
      .from('risks' as any)
      .select('*')
      .eq('project_id', projectId)
      .order('risk_score', { ascending: false });

    if (error) {
      console.error('Error fetching project risks:', error);
      return [];
    }
    return data || [];
  }

  async createRiskFromTask(taskId: string, riskData: Partial<Risk>): Promise<Risk> {
    // Get task details for context
    const { data: task } = await supabase
      .from('tasks')
      .select('title, description, project_id')
      .eq('id', taskId)
      .single();

    return this.createRisk({
      title: riskData.title || `Risk related to task: ${task?.title}`,
      description: riskData.description || `Risk identified from task: ${task?.description}`,
      category: riskData.category || 'technical',
      probability: riskData.probability || 0.5,
      impact: riskData.impact || 0.5,
      project_id: task?.project_id,
      status: 'active',
      ...riskData
    });
  }

  async linkRiskToProject(riskId: string, projectId: string): Promise<void> {
    await this.updateRisk(riskId, { project_id: projectId });
  }
}

export const riskService = new RiskService();
