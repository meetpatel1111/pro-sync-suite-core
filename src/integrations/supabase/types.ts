export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      billing_rates: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string
          effective_from: string
          effective_to: string | null
          id: string
          is_default: boolean | null
          project_id: string | null
          rate_amount: number
          rate_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_default?: boolean | null
          project_id?: string | null
          rate_amount: number
          rate_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_default?: boolean | null
          project_id?: string | null
          rate_amount?: number
          rate_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_rates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          description: string | null
          file_type: string
          id: string
          is_archived: boolean
          is_public: boolean
          name: string
          project_id: string | null
          size_bytes: number
          storage_path: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type: string
          id?: string
          is_archived?: boolean
          is_public?: boolean
          name: string
          project_id?: string | null
          size_bytes: number
          storage_path: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string
          id?: string
          is_archived?: boolean
          is_public?: boolean
          name?: string
          project_id?: string | null
          size_bytes?: number
          storage_path?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_actions: {
        Row: {
          action_type: string
          config: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          source_app: string
          target_app: string
          trigger_condition: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          source_app: string
          target_app: string
          trigger_condition?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          source_app?: string
          target_app?: string
          trigger_condition?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_to: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_to?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_to?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      productivity_metrics: {
        Row: {
          billable_percentage: number | null
          break_time_minutes: number | null
          created_at: string
          date: string
          distractions_count: number | null
          efficiency_score: number | null
          focus_time_minutes: number | null
          id: string
          total_hours: number
          user_id: string
        }
        Insert: {
          billable_percentage?: number | null
          break_time_minutes?: number | null
          created_at?: string
          date: string
          distractions_count?: number | null
          efficiency_score?: number | null
          focus_time_minutes?: number | null
          id?: string
          total_hours?: number
          user_id: string
        }
        Update: {
          billable_percentage?: number | null
          break_time_minutes?: number | null
          created_at?: string
          date?: string
          distractions_count?: number | null
          efficiency_score?: number | null
          focus_time_minutes?: number | null
          id?: string
          total_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          project?: string | null
          status: string
          title: string
          user_id: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          date: string
          description: string
          hourly_rate: number | null
          id: string
          manual: boolean
          notes: string | null
          project: string
          project_id: string | null
          tags: string[] | null
          task_id: string | null
          time_spent: number
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          date?: string
          description: string
          hourly_rate?: number | null
          id?: string
          manual?: boolean
          notes?: string | null
          project: string
          project_id?: string | null
          tags?: string[] | null
          task_id?: string | null
          time_spent: number
          user_id: string
        }
        Update: {
          billable?: boolean | null
          date?: string
          description?: string
          hourly_rate?: number | null
          id?: string
          manual?: boolean
          notes?: string | null
          project?: string
          project_id?: string | null
          tags?: string[] | null
          task_id?: string | null
          time_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          created_at: string
          id: string
          time_entry_id: string
          timesheet_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          time_entry_id: string
          timesheet_id: string
        }
        Update: {
          created_at?: string
          id?: string
          time_entry_id?: string
          timesheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable_hours: number
          created_at: string
          end_date: string
          id: string
          non_billable_hours: number
          notes: string | null
          start_date: string
          status: string
          submitted_at: string | null
          total_hours: number
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable_hours?: number
          created_at?: string
          end_date: string
          id?: string
          non_billable_hours?: number
          notes?: string | null
          start_date: string
          status?: string
          submitted_at?: string | null
          total_hours?: number
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable_hours?: number
          created_at?: string
          end_date?: string
          id?: string
          non_billable_hours?: number
          notes?: string | null
          start_date?: string
          status?: string
          submitted_at?: string | null
          total_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          app_notifications: Json | null
          created_at: string
          date_format: string | null
          email_notifications: Json | null
          id: string
          language: string | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_notifications?: Json | null
          created_at?: string
          date_format?: string | null
          email_notifications?: Json | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_notifications?: Json | null
          created_at?: string
          date_format?: string | null
          email_notifications?: Json | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      widgets: {
        Row: {
          config: Json
          created_at: string
          dashboard_id: string
          id: string
          position: Json
          title: string
          user_id: string
          widget_type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          dashboard_id: string
          id?: string
          position?: Json
          title: string
          user_id: string
          widget_type: string
        }
        Update: {
          config?: Json
          created_at?: string
          dashboard_id?: string
          id?: string
          position?: Json
          title?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      work_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          project_id: string | null
          start_time: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          start_time: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          start_time?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: { table_name: string }
        Returns: number
      }
      create_auth_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_check_table_exists_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_files_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notifications_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_profiles_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_settings_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      notification_type: "info" | "warning" | "success" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: ["info", "warning", "success", "error"],
    },
  },
} as const
