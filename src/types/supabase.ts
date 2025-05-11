import { FileItem } from './file-vault';

export type Database = {
  public: {
    Tables: {
      file_vault: {
        Row: FileItem;
        Insert: Omit<FileItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FileItem, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [
          {
            foreignKeyName: "file_vault_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
