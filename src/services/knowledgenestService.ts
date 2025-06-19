
import { supabase } from '@/integrations/supabase/client';
import type { KnowledgePage, PageComment, PageVersion, CreateKnowledgePage, CreatePageComment } from '@/types/knowledgenest';

export const knowledgenestService = {
  // Knowledge Pages
  async getPages(userId: string) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    return { data: data as KnowledgePage[] | null, error };
  },

  async getPage(slug: string) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    return { data: data as KnowledgePage | null, error };
  },

  async createPage(page: CreateKnowledgePage) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .insert(page)
      .select()
      .single();
    
    return { data: data as KnowledgePage | null, error };
  },

  async updatePage(id: string, updates: Partial<KnowledgePage>) {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as KnowledgePage | null, error };
  },

  async deletePage(id: string) {
    const { error } = await supabase
      .from('knowledge_pages')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Page Versions
  async getPageVersions(pageId: string) {
    const { data, error } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', pageId)
      .order('version', { ascending: false });
    
    return { data: data as PageVersion[] | null, error };
  },

  async getPageVersion(pageId: string, version: number) {
    const { data, error } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', pageId)
      .eq('version', version)
      .single();
    
    return { data: data as PageVersion | null, error };
  },

  async revertToVersion(pageId: string, version: number, userId: string) {
    // Get the specific version content
    const { data: versionData, error: versionError } = await this.getPageVersion(pageId, version);
    if (versionError || !versionData) {
      return { data: null, error: versionError };
    }

    // Update the page with the version content
    const { data, error } = await supabase
      .from('knowledge_pages')
      .update({
        content: versionData.content,
        last_edited_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();
    
    return { data: data as KnowledgePage | null, error };
  },

  // Page Comments
  async getPageComments(pageId: string) {
    const { data, error } = await supabase
      .from('page_comments')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });
    
    return { data: data as PageComment[] | null, error };
  },

  async createComment(comment: CreatePageComment) {
    const { data, error } = await supabase
      .from('page_comments')
      .insert(comment)
      .select()
      .single();
    
    return { data: data as PageComment | null, error };
  },

  async updateComment(id: string, updates: Partial<PageComment>) {
    const { data, error } = await supabase
      .from('page_comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as PageComment | null, error };
  },

  async deleteComment(id: string) {
    const { error } = await supabase
      .from('page_comments')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  async resolveComment(id: string) {
    const { data, error } = await supabase
      .from('page_comments')
      .update({ is_resolved: true })
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as PageComment | null, error };
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
    
    return { data: data as KnowledgePage[] | null, error };
  }
};
