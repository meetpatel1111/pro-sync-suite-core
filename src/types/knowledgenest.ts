
export interface KnowledgePage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  author_id: string;
  parent_id?: string;
  tags: string[];
  version: number;
  permissions: {
    visibility: 'public' | 'internal' | 'restricted';
    editors: string[];
    viewers: string[];
    commenters: string[];
  };
  app_context?: string;
  is_template: boolean;
  is_published: boolean;
  is_archived: boolean;
  last_edited_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  version: number;
  content?: string;
  editor_id: string;
  change_summary?: string;
  updated_at: string;
}

export interface PageComment {
  id: string;
  page_id: string;
  author_id: string;
  parent_id?: string;
  comment: string;
  line_reference?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}
