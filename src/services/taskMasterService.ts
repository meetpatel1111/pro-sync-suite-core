import { supabase } from '@/integrations/supabase/client';

export const taskMasterService = {
  async getTask(taskId: string) {
    // Replace with real TaskMaster API call if external
    const { data, error } = await supabase.from('tasks').select('*').eq('id', taskId).single();
    return { data, error };
  },
  async createTask(details: any) {
    // Replace with real TaskMaster API call if external
    const { data, error } = await supabase.from('tasks').insert([details]).select('*').single();
    return { data, error };
  }
};
