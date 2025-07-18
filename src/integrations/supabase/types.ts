export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      allocations: {
        Row: {
          created_at: string | null
          from_date: string | null
          id: string
          notes: string | null
          percent: number | null
          project_id: string | null
          resource_id: string | null
          to_date: string | null
        }
        Insert: {
          created_at?: string | null
          from_date?: string | null
          id?: string
          notes?: string | null
          percent?: number | null
          project_id?: string | null
          resource_id?: string | null
          to_date?: string | null
        }
        Update: {
          created_at?: string | null
          from_date?: string | null
          id?: string
          notes?: string | null
          percent?: number | null
          project_id?: string | null
          resource_id?: string | null
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      api_endpoints: {
        Row: {
          auth_config: Json | null
          created_at: string | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_tested_at: string | null
          method: string | null
          name: string
          rate_limit: number | null
          test_status: string | null
          timeout_seconds: number | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          auth_config?: Json | null
          created_at?: string | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          method?: string | null
          name: string
          rate_limit?: number | null
          test_status?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          auth_config?: Json | null
          created_at?: string | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          method?: string | null
          name?: string
          rate_limit?: number | null
          test_status?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_availability_checks: {
        Row: {
          app_name: string
          check_type: string
          checked_at: string
          created_at: string
          endpoint_url: string
          error_message: string | null
          id: string
          is_available: boolean
          response_time_ms: number | null
          status_code: number | null
          user_id: string
        }
        Insert: {
          app_name: string
          check_type?: string
          checked_at?: string
          created_at?: string
          endpoint_url: string
          error_message?: string | null
          id?: string
          is_available?: boolean
          response_time_ms?: number | null
          status_code?: number | null
          user_id: string
        }
        Update: {
          app_name?: string
          check_type?: string
          checked_at?: string
          created_at?: string
          endpoint_url?: string
          error_message?: string | null
          id?: string
          is_available?: boolean
          response_time_ms?: number | null
          status_code?: number | null
          user_id?: string
        }
        Relationships: []
      }
      app_health_metrics: {
        Row: {
          app_name: string
          created_at: string
          error_rate: number
          id: string
          last_check_at: string
          response_time_ms: number
          status: string
          updated_at: string
          uptime_percentage: number
          user_id: string
        }
        Insert: {
          app_name: string
          created_at?: string
          error_rate?: number
          id?: string
          last_check_at?: string
          response_time_ms?: number
          status?: string
          updated_at?: string
          uptime_percentage?: number
          user_id: string
        }
        Update: {
          app_name?: string
          created_at?: string
          error_rate?: number
          id?: string
          last_check_at?: string
          response_time_ms?: number
          status?: string
          updated_at?: string
          uptime_percentage?: number
          user_id?: string
        }
        Relationships: []
      }
      app_performance_metrics: {
        Row: {
          app_name: string
          avg_response_time_ms: number
          created_at: string
          error_count: number
          id: string
          recorded_at: string
          requests_per_minute: number
          success_rate: number
          user_id: string
        }
        Insert: {
          app_name: string
          avg_response_time_ms?: number
          created_at?: string
          error_count?: number
          id?: string
          recorded_at?: string
          requests_per_minute?: number
          success_rate?: number
          user_id: string
        }
        Update: {
          app_name?: string
          avg_response_time_ms?: number
          created_at?: string
          error_count?: number
          id?: string
          recorded_at?: string
          requests_per_minute?: number
          success_rate?: number
          user_id?: string
        }
        Relationships: []
      }
      approvals: {
        Row: {
          approval_type: string | null
          approver_id: string | null
          created_at: string | null
          id: string
          message_id: string | null
          status: string | null
        }
        Insert: {
          approval_type?: string | null
          approver_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
        }
        Update: {
          approval_type?: string | null
          approver_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_events: {
        Row: {
          error_message: string | null
          event_type: string | null
          execution_time_ms: number | null
          id: string
          payload: Json | null
          processed_at: string | null
          source_id: string | null
          source_module: string | null
          status: string | null
          target_id: string | null
          target_module: string | null
          triggered_at: string | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          error_message?: string | null
          event_type?: string | null
          execution_time_ms?: number | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          source_id?: string | null
          source_module?: string | null
          status?: string | null
          target_id?: string | null
          target_module?: string | null
          triggered_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          error_message?: string | null
          event_type?: string | null
          execution_time_ms?: number | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          source_id?: string | null
          source_module?: string | null
          status?: string | null
          target_id?: string | null
          target_module?: string | null
          triggered_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_module: string | null
          action_payload: Json | null
          action_type: string | null
          condition: Json | null
          enabled: boolean | null
          id: string
          source_module: string | null
          trigger_event: string | null
        }
        Insert: {
          action_module?: string | null
          action_payload?: Json | null
          action_type?: string | null
          condition?: Json | null
          enabled?: boolean | null
          id: string
          source_module?: string | null
          trigger_event?: string | null
        }
        Update: {
          action_module?: string | null
          action_payload?: Json | null
          action_type?: string | null
          condition?: Json | null
          enabled?: boolean | null
          id?: string
          source_module?: string | null
          trigger_event?: string | null
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          actions_config: Json | null
          conditions_config: Json | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_config: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actions_config?: Json | null
          conditions_config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actions_config?: Json | null
          conditions_config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      board_backlogs: {
        Row: {
          acceptance_criteria: string | null
          board_id: string | null
          business_value: number | null
          created_at: string | null
          effort_estimate: number | null
          epic_id: string | null
          id: string
          priority_order: number
          risk_level: string | null
          story_points: number | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          board_id?: string | null
          business_value?: number | null
          created_at?: string | null
          effort_estimate?: number | null
          epic_id?: string | null
          id?: string
          priority_order?: number
          risk_level?: string | null
          story_points?: number | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          board_id?: string | null
          business_value?: number | null
          created_at?: string | null
          effort_estimate?: number | null
          epic_id?: string | null
          id?: string
          priority_order?: number
          risk_level?: string | null
          story_points?: number | null
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_backlogs_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_backlogs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      board_reports: {
        Row: {
          board_id: string | null
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          parameters: Json | null
          report_data: Json
          report_type: string
          sprint_id: string | null
        }
        Insert: {
          board_id?: string | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_data?: Json
          report_type: string
          sprint_id?: string | null
        }
        Update: {
          board_id?: string | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_data?: Json
          report_type?: string
          sprint_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_reports_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_reports_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          id: string
          name: string
          permissions: Json | null
          project_id: string | null
          swimlane_config: Json | null
          type: string
          updated_at: string | null
          wip_limits: Json | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          name: string
          permissions?: Json | null
          project_id?: string | null
          swimlane_config?: Json | null
          type?: string
          updated_at?: string | null
          wip_limits?: Json | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          name?: string
          permissions?: Json | null
          project_id?: string | null
          swimlane_config?: Json | null
          type?: string
          updated_at?: string | null
          wip_limits?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "boards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_messages: {
        Row: {
          budget_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          sender_id: string
        }
        Insert: {
          budget_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          sender_id: string
        }
        Update: {
          budget_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_messages_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          id: string
          project_id: string | null
          spent: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          id: string
          project_id?: string | null
          spent?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          spent?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          approved_by: string[] | null
          cab_members: string[] | null
          change_type: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          impact_level: string | null
          implementation_plan: string | null
          linked_tickets: string[] | null
          post_implementation_review: string | null
          requested_by: string
          risk_level: string | null
          rollback_plan: string | null
          start_time: string | null
          status: string | null
          success_criteria: string | null
          testing_plan: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          approved_by?: string[] | null
          cab_members?: string[] | null
          change_type?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          impact_level?: string | null
          implementation_plan?: string | null
          linked_tickets?: string[] | null
          post_implementation_review?: string | null
          requested_by: string
          risk_level?: string | null
          rollback_plan?: string | null
          start_time?: string | null
          status?: string | null
          success_criteria?: string | null
          testing_plan?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          approved_by?: string[] | null
          cab_members?: string[] | null
          change_type?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          impact_level?: string | null
          implementation_plan?: string | null
          linked_tickets?: string[] | null
          post_implementation_review?: string | null
          requested_by?: string
          risk_level?: string | null
          rollback_plan?: string | null
          start_time?: string | null
          status?: string | null
          success_criteria?: string | null
          testing_plan?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          about: string | null
          auto_created: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          about?: string | null
          auto_created?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          about?: string | null
          auto_created?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_project_id_fkey"
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
      dashboard_widgets: {
        Row: {
          config: Json | null
          id: string
          position: number | null
          user_id: string | null
          widget_type: string | null
        }
        Insert: {
          config?: Json | null
          id: string
          position?: number | null
          user_id?: string | null
          widget_type?: string | null
        }
        Update: {
          config?: Json | null
          id?: string
          position?: number | null
          user_id?: string | null
          widget_type?: string | null
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
      direct_messages: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      dms: {
        Row: {
          created_at: string | null
          id: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: string | null
          date: string
          description: string
          id: string
          project_id: string | null
          receipt_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          date?: string
          description: string
          id?: string
          project_id?: string | null
          receipt_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          date?: string
          description?: string
          id?: string
          project_id?: string | null
          receipt_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_id: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_id: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_id?: string
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_permissions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_shares: {
        Row: {
          access_level: string
          expires_at: string | null
          file_id: string
          id: string
          link: string | null
          shared_at: string | null
          shared_by: string
          shared_with: string
        }
        Insert: {
          access_level: string
          expires_at?: string | null
          file_id: string
          id?: string
          link?: string | null
          shared_at?: string | null
          shared_by: string
          shared_with: string
        }
        Update: {
          access_level?: string
          expires_at?: string | null
          file_id?: string
          id?: string
          link?: string | null
          shared_at?: string | null
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          file_id: string
          id: string
          notes: string | null
          size_bytes: number
          storage_path: string
          uploaded_at: string | null
          uploaded_by: string
          version: number
        }
        Insert: {
          file_id: string
          id?: string
          notes?: string | null
          size_bytes: number
          storage_path: string
          uploaded_at?: string | null
          uploaded_by: string
          version: number
        }
        Update: {
          file_id?: string
          id?: string
          notes?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string | null
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          app_context: string | null
          channel_id: string | null
          created_at: string
          description: string | null
          file_type: string
          folder_id: string | null
          id: string
          is_archived: boolean
          is_public: boolean
          mime_type: string | null
          name: string
          project_id: string | null
          size_bytes: number
          storage_path: string
          tags: string[] | null
          task_id: string | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          app_context?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          file_type: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean
          mime_type?: string | null
          name: string
          project_id?: string | null
          size_bytes: number
          storage_path: string
          tags?: string[] | null
          task_id?: string | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          app_context?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean
          mime_type?: string | null
          name?: string
          project_id?: string | null
          size_bytes?: number
          storage_path?: string
          tags?: string[] | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "files_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          parent_id: string | null
          project_id: string | null
          shared: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          parent_id?: string | null
          project_id?: string | null
          shared?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          parent_id?: string | null
          project_id?: string | null
          shared?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gemini_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          provider: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          provider?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          provider?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      group_message_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_message_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read_status: boolean | null
          related_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          read_status?: boolean | null
          related_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read_status?: boolean | null
          related_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          project_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
          project_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          project_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          error_count: number | null
          execution_count: number | null
          id: string
          last_error_message: string | null
          last_executed_at: string | null
          source_app: string
          success_count: number | null
          target_app: string
          trigger_condition: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          error_count?: number | null
          execution_count?: number | null
          id?: string
          last_error_message?: string | null
          last_executed_at?: string | null
          source_app: string
          success_count?: number | null
          target_app: string
          trigger_condition?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          error_count?: number | null
          execution_count?: number | null
          id?: string
          last_error_message?: string | null
          last_executed_at?: string | null
          source_app?: string
          success_count?: number | null
          target_app?: string
          trigger_condition?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_health_status: {
        Row: {
          created_at: string | null
          error_details: string | null
          id: string
          integration_id: string | null
          last_checked_at: string | null
          response_time: number | null
          service_name: string
          status: string | null
          updated_at: string | null
          uptime_percentage: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: string | null
          id?: string
          integration_id?: string | null
          last_checked_at?: string | null
          response_time?: number | null
          service_name: string
          status?: string | null
          updated_at?: string | null
          uptime_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: string | null
          id?: string
          integration_id?: string | null
          last_checked_at?: string | null
          response_time?: number | null
          service_name?: string
          status?: string | null
          updated_at?: string | null
          uptime_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_health_status_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          integration_id: string | null
          log_level: string | null
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          integration_id?: string | null
          log_level?: string | null
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          integration_id?: string | null
          log_level?: string | null
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_templates: {
        Row: {
          apps: string[] | null
          category: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          downloads: number | null
          execution_count: number | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          last_used_at: string | null
          name: string
          rating: number | null
          success_rate: number | null
          tags: string[] | null
          template_config: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          apps?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          downloads?: number | null
          execution_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          name: string
          rating?: number | null
          success_rate?: number | null
          tags?: string[] | null
          template_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          apps?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          downloads?: number | null
          execution_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          name?: string
          rating?: number | null
          success_rate?: number | null
          tags?: string[] | null
          template_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_pages: {
        Row: {
          app_context: string | null
          author_id: string
          content: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_published: boolean | null
          is_template: boolean | null
          last_edited_by: string | null
          parent_id: string | null
          permissions: Json | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          app_context?: string | null
          author_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_published?: boolean | null
          is_template?: boolean | null
          last_edited_by?: string | null
          parent_id?: string | null
          permissions?: Json | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          app_context?: string | null
          author_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_published?: boolean | null
          is_template?: boolean | null
          last_edited_by?: string | null
          parent_id?: string | null
          permissions?: Json | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "knowledge_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_installations: {
        Row: {
          configuration: Json | null
          id: string
          installed_at: string | null
          is_active: boolean | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          configuration?: Json | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_installations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "integration_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          meeting_id: string | null
          notes: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          notes: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string | null
          duration: unknown | null
          host_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          recording_url: string | null
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: unknown | null
          host_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          recording_url?: string | null
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: unknown | null
          host_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          recording_url?: string | null
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_files: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_search: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          search_content: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          search_content: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          search_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_search_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          content: string | null
          created_at: string | null
          direct_message_id: string | null
          edited_at: string | null
          file_url: string | null
          group_message_id: string | null
          id: string
          is_pinned: boolean | null
          is_system_message: boolean | null
          mentions: Json | null
          name: string | null
          parent_id: string | null
          reactions: Json | null
          read_by: Json | null
          reply_to_id: string | null
          scheduled_for: string | null
          thread_count: number | null
          type: string
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          content?: string | null
          created_at?: string | null
          direct_message_id?: string | null
          edited_at?: string | null
          file_url?: string | null
          group_message_id?: string | null
          id?: string
          is_pinned?: boolean | null
          is_system_message?: boolean | null
          mentions?: Json | null
          name?: string | null
          parent_id?: string | null
          reactions?: Json | null
          read_by?: Json | null
          reply_to_id?: string | null
          scheduled_for?: string | null
          thread_count?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          content?: string | null
          created_at?: string | null
          direct_message_id?: string | null
          edited_at?: string | null
          file_url?: string | null
          group_message_id?: string | null
          id?: string
          is_pinned?: boolean | null
          is_system_message?: boolean | null
          mentions?: Json | null
          name?: string | null
          parent_id?: string | null
          reactions?: Json | null
          read_by?: Json | null
          reply_to_id?: string | null
          scheduled_for?: string | null
          thread_count?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_direct_message_id_fkey"
            columns: ["direct_message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_group_message_id_fkey"
            columns: ["group_message_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
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
      openai_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          provider: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          provider?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          provider?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      page_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "page_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_comments: {
        Row: {
          author_id: string
          comment: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          line_reference: string | null
          page_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          line_reference?: string | null
          page_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          line_reference?: string | null
          page_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_comments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "knowledge_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "page_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      page_versions: {
        Row: {
          change_summary: string | null
          content: string | null
          editor_id: string
          id: string
          page_id: string
          updated_at: string | null
          version: number
        }
        Insert: {
          change_summary?: string | null
          content?: string | null
          editor_id: string
          id?: string
          page_id: string
          updated_at?: string | null
          version: number
        }
        Update: {
          change_summary?: string | null
          content?: string | null
          editor_id?: string
          id?: string
          page_id?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "knowledge_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_messages: {
        Row: {
          channel_id: string | null
          id: string
          message_id: string
          pinned_at: string | null
          pinned_by: string
        }
        Insert: {
          channel_id?: string | null
          id?: string
          message_id: string
          pinned_at?: string | null
          pinned_by: string
        }
        Update: {
          channel_id?: string | null
          id?: string
          message_id?: string
          pinned_at?: string | null
          pinned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          end_date: string | null
          id: string
          plan_type: string | null
          project_id: string | null
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id: string
          plan_type?: string | null
          project_id?: string | null
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          plan_type?: string | null
          project_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          option_index: number
          poll_id: string | null
          user_id: string | null
          voted_at: string | null
        }
        Insert: {
          id?: string
          option_index: number
          poll_id?: string | null
          user_id?: string | null
          voted_at?: string | null
        }
        Update: {
          id?: string
          option_index?: number
          poll_id?: string | null
          user_id?: string | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          message_id: string | null
          options: Json
          question: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_id?: string | null
          options: Json
          question: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_id?: string | null
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          identified_by: string
          impact_assessment: string | null
          knowledge_articles: string[] | null
          linked_incidents: string[] | null
          preventive_actions: string | null
          priority: string | null
          resolution_plan: string | null
          root_cause: string | null
          status: string | null
          title: string
          updated_at: string | null
          workaround: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          identified_by: string
          impact_assessment?: string | null
          knowledge_articles?: string[] | null
          linked_incidents?: string[] | null
          preventive_actions?: string | null
          priority?: string | null
          resolution_plan?: string | null
          root_cause?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          workaround?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          identified_by?: string
          impact_assessment?: string | null
          knowledge_articles?: string[] | null
          linked_incidents?: string[] | null
          preventive_actions?: string | null
          priority?: string | null
          resolution_plan?: string | null
          root_cause?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          workaround?: string | null
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
      project_clients: {
        Row: {
          client_id: string
          project_id: string
        }
        Insert: {
          client_id: string
          project_id: string
        }
        Update: {
          client_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_clients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          created_at: string | null
          default_view: string | null
          id: string
          project_id: string | null
          updated_at: string | null
          user_id: string | null
          zoom_level: string | null
        }
        Insert: {
          created_at?: string | null
          default_view?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          zoom_level?: string | null
        }
        Update: {
          created_at?: string | null
          default_view?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          zoom_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          key: string | null
          name: string
          org_id: string | null
          owner_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key?: string | null
          name: string
          org_id?: string | null
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key?: string | null
          name?: string
          org_id?: string | null
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resource_allocation: {
        Row: {
          allocation_amount: number | null
          allocation_date: string | null
          id: number
          resource_id: string
          user_id: string
        }
        Insert: {
          allocation_amount?: number | null
          allocation_date?: string | null
          id?: number
          resource_id: string
          user_id: string
        }
        Update: {
          allocation_amount?: number | null
          allocation_date?: string | null
          id?: number
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_resource"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocation: number
          created_at: string | null
          id: string
          team: string
          user_id: string
        }
        Insert: {
          allocation: number
          created_at?: string | null
          id?: string
          team: string
          user_id: string
        }
        Update: {
          allocation?: number
          created_at?: string | null
          id?: string
          team?: string
          user_id?: string
        }
        Relationships: []
      }
      resource_skills: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          skill: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          skill: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          skill?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_skills_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          allocation: number | null
          allocation_history: Json | null
          availability: string | null
          created_at: string | null
          current_project_id: string | null
          id: string
          name: string
          role: string
          schedule: Json | null
          user_id: string | null
          utilization: number | null
          utilization_history: Json | null
        }
        Insert: {
          allocation?: number | null
          allocation_history?: Json | null
          availability?: string | null
          created_at?: string | null
          current_project_id?: string | null
          id?: string
          name: string
          role: string
          schedule?: Json | null
          user_id?: string | null
          utilization?: number | null
          utilization_history?: Json | null
        }
        Update: {
          allocation?: number | null
          allocation_history?: Json | null
          availability?: string | null
          created_at?: string | null
          current_project_id?: string | null
          id?: string
          name?: string
          role?: string
          schedule?: Json | null
          user_id?: string | null
          utilization?: number | null
          utilization_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_current_project_id_fkey"
            columns: ["current_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level: string | null
          project_id: string | null
          status: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          level?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_assets: {
        Row: {
          asset_type: string
          assigned_to: string | null
          cost: number | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          location: string | null
          mac_address: string | null
          maintenance_schedule: Json | null
          model: string | null
          name: string
          purchase_date: string | null
          serial_number: string | null
          specifications: Json | null
          status: string | null
          updated_at: string | null
          vendor: string | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_type: string
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          location?: string | null
          mac_address?: string | null
          maintenance_schedule?: Json | null
          model?: string | null
          name: string
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_type?: string
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          location?: string | null
          mac_address?: string | null
          maintenance_schedule?: Json | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      sla_policies: {
        Row: {
          business_hours_only: boolean | null
          conditions: Json
          created_at: string | null
          description: string | null
          escalation_after: number | null
          escalation_enabled: boolean | null
          escalation_team: string | null
          id: string
          name: string
          priority: string
          resolution_time: number
          response_time: number
          updated_at: string | null
        }
        Insert: {
          business_hours_only?: boolean | null
          conditions: Json
          created_at?: string | null
          description?: string | null
          escalation_after?: number | null
          escalation_enabled?: boolean | null
          escalation_team?: string | null
          id?: string
          name: string
          priority: string
          resolution_time: number
          response_time: number
          updated_at?: string | null
        }
        Update: {
          business_hours_only?: boolean | null
          conditions?: Json
          created_at?: string | null
          description?: string | null
          escalation_after?: number | null
          escalation_enabled?: boolean | null
          escalation_team?: string | null
          id?: string
          name?: string
          priority?: string
          resolution_time?: number
          response_time?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      sprint_tasks: {
        Row: {
          committed_at: string | null
          created_at: string | null
          current_story_points: number | null
          id: string
          initial_story_points: number | null
          sprint_id: string | null
          task_id: string | null
        }
        Insert: {
          committed_at?: string | null
          created_at?: string | null
          current_story_points?: number | null
          id?: string
          initial_story_points?: number | null
          sprint_id?: string | null
          task_id?: string | null
        }
        Update: {
          committed_at?: string | null
          created_at?: string | null
          current_story_points?: number | null
          id?: string
          initial_story_points?: number | null
          sprint_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprint_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          board_id: string | null
          capacity: number | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          goal: string | null
          id: string
          name: string
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          velocity: number | null
        }
        Insert: {
          board_id?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          velocity?: number | null
        }
        Update: {
          board_id?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          next_sync_at: string | null
          records_synced: number | null
          source_app: string
          status: string | null
          sync_config: Json | null
          sync_type: string
          target_app: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          records_synced?: number | null
          source_app: string
          status?: string | null
          sync_config?: Json | null
          sync_type: string
          target_app: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          records_synced?: number | null
          source_app?: string
          status?: string | null
          sync_config?: Json | null
          sync_type?: string
          target_app?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_activity_log: {
        Row: {
          action: string
          description: string | null
          id: string
          task_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          task_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          task_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklists: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          task_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          task_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          depends_on_task_id: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_files: {
        Row: {
          created_at: string | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_mentions: {
        Row: {
          id: string
          mentioned_at: string | null
          message_id: string
          task_id: string
        }
        Insert: {
          id?: string
          mentioned_at?: string | null
          message_id: string
          task_id: string
        }
        Update: {
          id?: string
          mentioned_at?: string | null
          message_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_mentions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_resources: {
        Row: {
          resource_id: string
          task_id: string
        }
        Insert: {
          resource_id: string
          task_id: string
        }
        Update: {
          resource_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tag_assignments: {
        Row: {
          id: string
          tag_id: string | null
          task_id: string | null
        }
        Insert: {
          id?: string
          tag_id?: string | null
          task_id?: string | null
        }
        Update: {
          id?: string
          tag_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "task_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tag_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          color: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string[] | null
          assignee_id: string | null
          blocked_by: string[] | null
          blocks: string[] | null
          board_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          epic_id: string | null
          estimate_hours: number | null
          id: string
          labels: string[] | null
          linked_task_ids: string[] | null
          parent_task_id: string | null
          position: number | null
          priority: string
          project_id: string | null
          recurrence_rule: string | null
          reporter_id: string | null
          reviewer_id: string | null
          sprint_id: string | null
          start_date: string | null
          status: string
          story_points: number | null
          task_key: string | null
          task_number: number | null
          title: string
          type: string | null
          updated_at: string | null
          updated_by: string | null
          visibility: string | null
          watchers: string[] | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string[] | null
          assignee_id?: string | null
          blocked_by?: string[] | null
          blocks?: string[] | null
          board_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          estimate_hours?: number | null
          id?: string
          labels?: string[] | null
          linked_task_ids?: string[] | null
          parent_task_id?: string | null
          position?: number | null
          priority: string
          project_id?: string | null
          recurrence_rule?: string | null
          reporter_id?: string | null
          reviewer_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status: string
          story_points?: number | null
          task_key?: string | null
          task_number?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visibility?: string | null
          watchers?: string[] | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string[] | null
          assignee_id?: string | null
          blocked_by?: string[] | null
          blocks?: string[] | null
          board_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          estimate_hours?: number | null
          id?: string
          labels?: string[] | null
          linked_task_ids?: string[] | null
          parent_task_id?: string | null
          position?: number | null
          priority?: string
          project_id?: string | null
          recurrence_rule?: string | null
          reporter_id?: string | null
          reviewer_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          story_points?: number | null
          task_key?: string | null
          task_number?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visibility?: string | null
          watchers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      ticket_attachments: {
        Row: {
          created_at: string | null
          file_id: string | null
          file_name: string
          file_url: string | null
          id: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_id?: string | null
          file_name: string
          file_url?: string | null
          id?: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_id?: string | null
          file_name?: string
          file_url?: string | null
          id?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          author_id: string
          comment: string
          created_at: string | null
          id: string
          is_private: boolean | null
          is_system_comment: boolean | null
          mentions: string[] | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          is_system_comment?: boolean | null
          mentions?: string[] | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          is_system_comment?: boolean | null
          mentions?: string[] | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          closed_at: string | null
          created_at: string | null
          custom_fields: Json | null
          customer_satisfaction: number | null
          description: string | null
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          sla_due: string | null
          status: string
          subcategory: string | null
          submitted_by: string
          tags: string[] | null
          ticket_number: number
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          customer_satisfaction?: number | null
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          sla_due?: string | null
          status?: string
          subcategory?: string | null
          submitted_by: string
          tags?: string[] | null
          ticket_number?: number
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          customer_satisfaction?: number | null
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          sla_due?: string | null
          status?: string
          subcategory?: string | null
          submitted_by?: string
          tags?: string[] | null
          ticket_number?: number
          title?: string
          type?: string
          updated_at?: string | null
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
        ]
      }
      time_logs: {
        Row: {
          hours: number | null
          id: string
          log_date: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          hours?: number | null
          id: string
          log_date?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          hours?: number | null
          id?: string
          log_date?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      unavailability: {
        Row: {
          approved: boolean | null
          created_at: string | null
          from_date: string | null
          id: string
          reason: string | null
          resource_id: string | null
          to_date: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          from_date?: string | null
          id?: string
          reason?: string | null
          resource_id?: string | null
          to_date?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          from_date?: string | null
          id?: string
          reason?: string | null
          resource_id?: string | null
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unavailability_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          app_context: string | null
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          app_context?: string | null
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          app_context?: string | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          accent_color: string | null
          accentcolor: string | null
          access_role_definitions: Json | null
          admin_only_actions: boolean | null
          alert_priorities: Json | null
          alert_tone: string | null
          api_key_management: boolean | null
          app_notifications: Json | null
          archiving_rules: Json | null
          audit_trail_enabled: boolean | null
          auto_backup: boolean | null
          auto_cleanup_logs: boolean | null
          auto_delete_inactive_accounts: boolean | null
          auto_logout_inactivity: boolean | null
          auto_mark_as_read: boolean | null
          auto_password_rotation: boolean | null
          auto_save_interval: number | null
          avatar_display_option: string | null
          avatardisplayoption: string | null
          backup_schedule: string | null
          block_unverified_clients: boolean | null
          card_styling: string | null
          ccpa_compliance: boolean | null
          chat_panel_drawer_display: boolean | null
          client_activity_notifications: boolean | null
          comment_mentions: boolean | null
          connected_apps: Json | null
          created_at: string
          custom_css: string | null
          custom_data_fields: Json | null
          custom_fields: Json | null
          daily_digest: boolean | null
          dashboard_widget_layout: Json | null
          data_access_level: Json | null
          data_export_options: Json | null
          data_import_templates: Json | null
          data_localization_rules: Json | null
          data_retention: Json | null
          data_retention_policy: string | null
          date_format: string | null
          default_currency: string | null
          default_dashboard: string | null
          default_date_time_format: string | null
          default_file_storage_location: string | null
          default_filters_reports: Json | null
          default_icon_set: string | null
          default_landing_page: string | null
          default_landing_page_role: string | null
          default_time_zone: string | null
          device_activity_log: boolean | null
          display_name: string | null
          email_notifications: Json | null
          enable_all_notifications: boolean | null
          enable_client_portal: boolean | null
          enabled_modules: Json | null
          encryption_standard: string | null
          enforce_https: boolean | null
          escalation_notification_rules: Json | null
          file_storage_provider: string | null
          file_upload_alerts: boolean | null
          file_upload_restrictions: Json | null
          fiscal_year_start: string | null
          font_family: string | null
          font_selection: string | null
          font_size_preset: string | null
          font_size_type: string | null
          font_size_value: number | null
          fontselection: string | null
          gdpr_compliance: boolean | null
          header_behavior: string | null
          headerbehavior: string | null
          holidays: Json | null
          id: string
          inapp_notifications: boolean | null
          integration_token_expiry: number | null
          interface_animation: boolean | null
          interface_spacing: string | null
          interfaceanimation: boolean | null
          interfacespacing: string | null
          ip_whitelist: Json | null
          language: string | null
          login_attempt_limit: number | null
          login_notifications: boolean | null
          login_screen_branding: string | null
          meeting_reminders: boolean | null
          menu_order: Json | null
          mfa_enforcement: boolean | null
          mobile_push_notifications: boolean | null
          new_message_sound: boolean | null
          notification_channel_settings: Json | null
          notification_preferences: Json | null
          notification_snooze_options: Json | null
          organization_logo_url: string | null
          organization_name: string | null
          page_transition_effects: string | null
          password_complexity: string | null
          personal_data_access_request: boolean | null
          preferred_language: string | null
          primary_color: string | null
          primarycolor: string | null
          priority_label_settings: Json | null
          project_color_tags: Json | null
          project_deadline_alerts: boolean | null
          project_naming_conventions: string | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          realtime_sync: boolean | null
          require_password_sensitive: boolean | null
          restore_from_backup: boolean | null
          risk_trigger_alerts: boolean | null
          section_divider_style: string | null
          session_timeout: number | null
          sidebar_layout: string | null
          sidebarlayout: string | null
          sso_enabled: boolean | null
          storage_quotas: Json | null
          sync_settings: Json | null
          task_assignment_alerts: boolean | null
          task_auto_numbering: boolean | null
          theme: string | null
          theme_mode: string | null
          thememode: string | null
          time_off_policies: Json | null
          time_tracking_settings: Json | null
          timezone: string | null
          tooltip_behavior: string | null
          two_factor_auth: boolean | null
          updated_at: string
          user_id: string
          user_invitation_restrictions: boolean | null
          version_history_depth: number | null
          weekly_digest_day: string | null
          weekly_digest_time: string | null
          weekly_summary_reports: boolean | null
          working_days: Json | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          accent_color?: string | null
          accentcolor?: string | null
          access_role_definitions?: Json | null
          admin_only_actions?: boolean | null
          alert_priorities?: Json | null
          alert_tone?: string | null
          api_key_management?: boolean | null
          app_notifications?: Json | null
          archiving_rules?: Json | null
          audit_trail_enabled?: boolean | null
          auto_backup?: boolean | null
          auto_cleanup_logs?: boolean | null
          auto_delete_inactive_accounts?: boolean | null
          auto_logout_inactivity?: boolean | null
          auto_mark_as_read?: boolean | null
          auto_password_rotation?: boolean | null
          auto_save_interval?: number | null
          avatar_display_option?: string | null
          avatardisplayoption?: string | null
          backup_schedule?: string | null
          block_unverified_clients?: boolean | null
          card_styling?: string | null
          ccpa_compliance?: boolean | null
          chat_panel_drawer_display?: boolean | null
          client_activity_notifications?: boolean | null
          comment_mentions?: boolean | null
          connected_apps?: Json | null
          created_at?: string
          custom_css?: string | null
          custom_data_fields?: Json | null
          custom_fields?: Json | null
          daily_digest?: boolean | null
          dashboard_widget_layout?: Json | null
          data_access_level?: Json | null
          data_export_options?: Json | null
          data_import_templates?: Json | null
          data_localization_rules?: Json | null
          data_retention?: Json | null
          data_retention_policy?: string | null
          date_format?: string | null
          default_currency?: string | null
          default_dashboard?: string | null
          default_date_time_format?: string | null
          default_file_storage_location?: string | null
          default_filters_reports?: Json | null
          default_icon_set?: string | null
          default_landing_page?: string | null
          default_landing_page_role?: string | null
          default_time_zone?: string | null
          device_activity_log?: boolean | null
          display_name?: string | null
          email_notifications?: Json | null
          enable_all_notifications?: boolean | null
          enable_client_portal?: boolean | null
          enabled_modules?: Json | null
          encryption_standard?: string | null
          enforce_https?: boolean | null
          escalation_notification_rules?: Json | null
          file_storage_provider?: string | null
          file_upload_alerts?: boolean | null
          file_upload_restrictions?: Json | null
          fiscal_year_start?: string | null
          font_family?: string | null
          font_selection?: string | null
          font_size_preset?: string | null
          font_size_type?: string | null
          font_size_value?: number | null
          fontselection?: string | null
          gdpr_compliance?: boolean | null
          header_behavior?: string | null
          headerbehavior?: string | null
          holidays?: Json | null
          id?: string
          inapp_notifications?: boolean | null
          integration_token_expiry?: number | null
          interface_animation?: boolean | null
          interface_spacing?: string | null
          interfaceanimation?: boolean | null
          interfacespacing?: string | null
          ip_whitelist?: Json | null
          language?: string | null
          login_attempt_limit?: number | null
          login_notifications?: boolean | null
          login_screen_branding?: string | null
          meeting_reminders?: boolean | null
          menu_order?: Json | null
          mfa_enforcement?: boolean | null
          mobile_push_notifications?: boolean | null
          new_message_sound?: boolean | null
          notification_channel_settings?: Json | null
          notification_preferences?: Json | null
          notification_snooze_options?: Json | null
          organization_logo_url?: string | null
          organization_name?: string | null
          page_transition_effects?: string | null
          password_complexity?: string | null
          personal_data_access_request?: boolean | null
          preferred_language?: string | null
          primary_color?: string | null
          primarycolor?: string | null
          priority_label_settings?: Json | null
          project_color_tags?: Json | null
          project_deadline_alerts?: boolean | null
          project_naming_conventions?: string | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          realtime_sync?: boolean | null
          require_password_sensitive?: boolean | null
          restore_from_backup?: boolean | null
          risk_trigger_alerts?: boolean | null
          section_divider_style?: string | null
          session_timeout?: number | null
          sidebar_layout?: string | null
          sidebarlayout?: string | null
          sso_enabled?: boolean | null
          storage_quotas?: Json | null
          sync_settings?: Json | null
          task_assignment_alerts?: boolean | null
          task_auto_numbering?: boolean | null
          theme?: string | null
          theme_mode?: string | null
          thememode?: string | null
          time_off_policies?: Json | null
          time_tracking_settings?: Json | null
          timezone?: string | null
          tooltip_behavior?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string
          user_id: string
          user_invitation_restrictions?: boolean | null
          version_history_depth?: number | null
          weekly_digest_day?: string | null
          weekly_digest_time?: string | null
          weekly_summary_reports?: boolean | null
          working_days?: Json | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          accent_color?: string | null
          accentcolor?: string | null
          access_role_definitions?: Json | null
          admin_only_actions?: boolean | null
          alert_priorities?: Json | null
          alert_tone?: string | null
          api_key_management?: boolean | null
          app_notifications?: Json | null
          archiving_rules?: Json | null
          audit_trail_enabled?: boolean | null
          auto_backup?: boolean | null
          auto_cleanup_logs?: boolean | null
          auto_delete_inactive_accounts?: boolean | null
          auto_logout_inactivity?: boolean | null
          auto_mark_as_read?: boolean | null
          auto_password_rotation?: boolean | null
          auto_save_interval?: number | null
          avatar_display_option?: string | null
          avatardisplayoption?: string | null
          backup_schedule?: string | null
          block_unverified_clients?: boolean | null
          card_styling?: string | null
          ccpa_compliance?: boolean | null
          chat_panel_drawer_display?: boolean | null
          client_activity_notifications?: boolean | null
          comment_mentions?: boolean | null
          connected_apps?: Json | null
          created_at?: string
          custom_css?: string | null
          custom_data_fields?: Json | null
          custom_fields?: Json | null
          daily_digest?: boolean | null
          dashboard_widget_layout?: Json | null
          data_access_level?: Json | null
          data_export_options?: Json | null
          data_import_templates?: Json | null
          data_localization_rules?: Json | null
          data_retention?: Json | null
          data_retention_policy?: string | null
          date_format?: string | null
          default_currency?: string | null
          default_dashboard?: string | null
          default_date_time_format?: string | null
          default_file_storage_location?: string | null
          default_filters_reports?: Json | null
          default_icon_set?: string | null
          default_landing_page?: string | null
          default_landing_page_role?: string | null
          default_time_zone?: string | null
          device_activity_log?: boolean | null
          display_name?: string | null
          email_notifications?: Json | null
          enable_all_notifications?: boolean | null
          enable_client_portal?: boolean | null
          enabled_modules?: Json | null
          encryption_standard?: string | null
          enforce_https?: boolean | null
          escalation_notification_rules?: Json | null
          file_storage_provider?: string | null
          file_upload_alerts?: boolean | null
          file_upload_restrictions?: Json | null
          fiscal_year_start?: string | null
          font_family?: string | null
          font_selection?: string | null
          font_size_preset?: string | null
          font_size_type?: string | null
          font_size_value?: number | null
          fontselection?: string | null
          gdpr_compliance?: boolean | null
          header_behavior?: string | null
          headerbehavior?: string | null
          holidays?: Json | null
          id?: string
          inapp_notifications?: boolean | null
          integration_token_expiry?: number | null
          interface_animation?: boolean | null
          interface_spacing?: string | null
          interfaceanimation?: boolean | null
          interfacespacing?: string | null
          ip_whitelist?: Json | null
          language?: string | null
          login_attempt_limit?: number | null
          login_notifications?: boolean | null
          login_screen_branding?: string | null
          meeting_reminders?: boolean | null
          menu_order?: Json | null
          mfa_enforcement?: boolean | null
          mobile_push_notifications?: boolean | null
          new_message_sound?: boolean | null
          notification_channel_settings?: Json | null
          notification_preferences?: Json | null
          notification_snooze_options?: Json | null
          organization_logo_url?: string | null
          organization_name?: string | null
          page_transition_effects?: string | null
          password_complexity?: string | null
          personal_data_access_request?: boolean | null
          preferred_language?: string | null
          primary_color?: string | null
          primarycolor?: string | null
          priority_label_settings?: Json | null
          project_color_tags?: Json | null
          project_deadline_alerts?: boolean | null
          project_naming_conventions?: string | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          realtime_sync?: boolean | null
          require_password_sensitive?: boolean | null
          restore_from_backup?: boolean | null
          risk_trigger_alerts?: boolean | null
          section_divider_style?: string | null
          session_timeout?: number | null
          sidebar_layout?: string | null
          sidebarlayout?: string | null
          sso_enabled?: boolean | null
          storage_quotas?: Json | null
          sync_settings?: Json | null
          task_assignment_alerts?: boolean | null
          task_auto_numbering?: boolean | null
          theme?: string | null
          theme_mode?: string | null
          thememode?: string | null
          time_off_policies?: Json | null
          time_tracking_settings?: Json | null
          timezone?: string | null
          tooltip_behavior?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string
          user_id?: string
          user_invitation_restrictions?: boolean | null
          version_history_depth?: number | null
          weekly_digest_day?: string | null
          weekly_digest_time?: string | null
          weekly_summary_reports?: boolean | null
          working_days?: Json | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          id: number
          skill: string
          user_id: string | null
        }
        Insert: {
          id?: number
          skill: string
          user_id?: string | null
        }
        Update: {
          id?: number
          skill?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          aud: string | null
          avatar_url: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          custom_password_hash: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          full_name: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean | null
          is_sso_user: boolean | null
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          password_last_changed: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          aud?: string | null
          avatar_url?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          custom_password_hash?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          full_name?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          password_last_changed?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          aud?: string | null
          avatar_url?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          custom_password_hash?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          full_name?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          password_last_changed?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      utilization_history: {
        Row: {
          date: string | null
          id: string
          resource_id: string | null
          utilization_percent: number | null
        }
        Insert: {
          date?: string | null
          id?: string
          resource_id?: string | null
          utilization_percent?: number | null
        }
        Update: {
          date?: string | null
          id?: string
          resource_id?: string | null
          utilization_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "utilization_history_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
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
      create_budget_notification: {
        Args: {
          p_user_id: string
          p_project_name: string
          p_percentage: number
        }
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
      create_time_reminder_notification: {
        Args: { p_user_id: string; p_message: string }
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
      increment_template_downloads: {
        Args: { template_id: string }
        Returns: undefined
      }
      update_app_health_metric: {
        Args: {
          p_user_id: string
          p_app_name: string
          p_status: string
          p_response_time_ms: number
          p_uptime_percentage: number
          p_error_rate: number
        }
        Returns: undefined
      }
      user_has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
