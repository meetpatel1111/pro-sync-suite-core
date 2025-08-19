
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Risk = Database['public']['Tables']['risks']['Row'];
export type RiskInsert = Database['public']['Tables']['risks']['Insert'];
export type RiskMitigation = Database['public']['Tables']['risk_mitigations']['Row'];
export type RiskMitigationInsert = Database['public']['Tables']['risk_mitigations']['Insert'];

export type RiskStatus = 'active' | 'mitigated' | 'closed' | 'monitoring';
export type MitigationStatus = 'planned' | 'in_progress' | 'completed';

class RiskService {
  async createRisk(riskData: Omit<RiskInsert, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const riskScore = riskData.probability * riskData.impact;
      
      const { data, error } = await supabase
        .from('risks')
        .insert({
          ...riskData,
          risk_score: riskScore
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating risk:', error);
      return { data: null, error };
    }
  }

  async getRisk(id: string) {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching risk:', error);
      return { data: null, error };
    }
  }

  async getRisks(userId?: string) {
    try {
      let query = supabase
        .from('risks')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching risks:', error);
      return { data: [], error };
    }
  }

  async updateRisk(id: string, updates: Partial<Omit<RiskInsert, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const updateData: any = { ...updates };
      
      if (updates.probability !== undefined && updates.impact !== undefined) {
        updateData.risk_score = updates.probability * updates.impact;
      }

      const { data, error } = await supabase
        .from('risks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating risk:', error);
      return { data: null, error };
    }
  }

  async deleteRisk(id: string) {
    try {
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting risk:', error);
      return { error };
    }
  }

  async createMitigation(mitigationData: Omit<RiskMitigationInsert, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('risk_mitigations')
        .insert(mitigationData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating mitigation:', error);
      return { data: null, error };
    }
  }

  async updateMitigation(id: string, updates: Partial<Omit<RiskMitigationInsert, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('risk_mitigations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating mitigation:', error);
      return { data: null, error };
    }
  }

  async getMitigationsByRisk(riskId: string) {
    try {
      const { data, error } = await supabase
        .from('risk_mitigations')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching mitigations:', error);
      return { data: [], error };
    }
  }
}

export const riskService = new RiskService();
