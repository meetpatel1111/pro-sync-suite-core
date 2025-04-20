import { supabase } from '@/integrations/supabase/client';

export const fileVaultService = {
  async getFile(fileId: string) {
    const { data, error } = await supabase.from('files').select('*').eq('id', fileId).single();
    return { data, error };
  }
};
