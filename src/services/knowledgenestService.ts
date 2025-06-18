
import { supabase } from '@/integrations/supabase/client';
import type { KnowledgePage, PageComment } from '@/types/knowledgenest';

export const knowledgenestService = {
  // Knowledge Pages
  async getPages(userId: string) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    return { data, error };
  },

  async getPage(slug: string) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    return { data, error };
  },

  async createPage(page: Partial<KnowledgePage>) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .insert(page)
      .select()
      .single();
    
    return { data, error };
  },

  async updatePage(id: string, updates: Partial<KnowledgePage>) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  async deletePage(id: string) {
    const { error } = await supabase
      .from('knowledge_pages')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Page Comments
  async getPageComments(pageId: string) {
    const { data, error } = await supabase
      .from('page_comments')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  async createComment(comment: Partial<PageComment>) {
    const { data, error } = await supabase
      .from('page_comments')
      .insert(comment)
      .select()
      .single();
    
    return { data, error };
  },

  // Search
  async searchPages(query: string) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('is_published', true)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    return { data, error };
  }
};
