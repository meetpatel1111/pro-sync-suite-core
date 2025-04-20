import { supabase } from '@/integrations/supabase/client';

export const planBoardService = {
  async getProject(projectId: string) {
    const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    return { data, error };
  },
  async getMeeting(meetingId: string) {
    const { data, error } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
    return { data, error };
  }
};
