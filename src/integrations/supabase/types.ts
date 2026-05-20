export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          batch_id: string | null
          body: string
          created_at: string
          id: string
          pinned: boolean
          program: Database["public"]["Enums"]["program_code"] | null
          title: string
        }
        Insert: {
          author_id: string
          batch_id?: string | null
          body: string
          created_at?: string
          id?: string
          pinned?: boolean
          program?: Database["public"]["Enums"]["program_code"] | null
          title: string
        }
        Update: {
          author_id?: string
          batch_id?: string | null
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          program?: Database["public"]["Enums"]["program_code"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      batch_enrollments: {
        Row: {
          batch_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          batch_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          batch_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          capacity: number
          created_at: string
          end_date: string | null
          id: string
          instructor_id: string | null
          is_active: boolean
          name: string
          program: Database["public"]["Enums"]["program_code"]
          start_date: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean
          name: string
          program: Database["public"]["Enums"]["program_code"]
          start_date: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean
          name?: string
          program?: Database["public"]["Enums"]["program_code"]
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          program: Database["public"]["Enums"]["program_code"]
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          program: Database["public"]["Enums"]["program_code"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          program?: Database["public"]["Enums"]["program_code"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      instructor_lab_overrides: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          instructor_id: string
          lab_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          instructor_id: string
          lab_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          instructor_id?: string
          lab_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      k8s_trials: {
        Row: {
          created_at: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_attempts: {
        Row: {
          completed_at: string | null
          id: string
          lab_id: string
          score: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lab_id: string
          score?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lab_id?: string
          score?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_attempts_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_questions: {
        Row: {
          correct_index: number
          explanation: string | null
          id: string
          lab_id: string
          options: Json
          points: number
          question: string
          question_number: number
        }
        Insert: {
          correct_index: number
          explanation?: string | null
          id?: string
          lab_id: string
          options: Json
          points?: number
          question: string
          question_number: number
        }
        Update: {
          correct_index?: number
          explanation?: string | null
          id?: string
          lab_id?: string
          options?: Json
          points?: number
          question?: string
          question_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_questions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_steps: {
        Row: {
          expected_action: Json | null
          hint: string | null
          id: string
          instructions: string
          lab_id: string
          points: number
          step_number: number
          title: string
        }
        Insert: {
          expected_action?: Json | null
          hint?: string | null
          id?: string
          instructions: string
          lab_id: string
          points?: number
          step_number: number
          title: string
        }
        Update: {
          expected_action?: Json | null
          hint?: string | null
          id?: string
          instructions?: string
          lab_id?: string
          points?: number
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_steps_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          created_at: string
          difficulty: string
          duration_min: number
          id: string
          is_published: boolean
          module_id: string
          ms_learn_url: string | null
          objective: string | null
          scenario: string | null
          simulator: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          duration_min?: number
          id?: string
          is_published?: boolean
          module_id: string
          ms_learn_url?: string | null
          objective?: string | null
          scenario?: string | null
          simulator: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          duration_min?: number
          id?: string
          is_published?: boolean
          module_id?: string
          ms_learn_url?: string | null
          objective?: string | null
          scenario?: string | null
          simulator?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          domain_code: string
          exam_weight: string | null
          icon: string | null
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_code: string
          exam_weight?: string | null
          icon?: string | null
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_code?: string
          exam_weight?: string | null
          icon?: string | null
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          pdi_instance_url: string | null
          ssid: string | null
          suspended: boolean
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          pdi_instance_url?: string | null
          ssid?: string | null
          suspended?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          pdi_instance_url?: string | null
          ssid?: string | null
          suspended?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      program_access: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          program: Database["public"]["Enums"]["program_code"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          program: Database["public"]["Enums"]["program_code"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          program?: Database["public"]["Enums"]["program_code"]
          user_id?: string
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean
          question_id: string
          selected_index: number
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_index: number
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "lab_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "lab_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      step_progress: {
        Row: {
          attempt_id: string
          attempts: number
          completed: boolean
          completed_at: string | null
          id: string
          step_id: string
        }
        Insert: {
          attempt_id: string
          attempts?: number
          completed?: boolean
          completed_at?: string | null
          id?: string
          step_id: string
        }
        Update: {
          attempt_id?: string
          attempts?: number
          completed?: boolean
          completed_at?: string | null
          id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_progress_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "lab_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "lab_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_alerts: {
        Row: {
          affected_device_id: string | null
          affected_user_id: string | null
          category: string
          created_at: string
          description: string | null
          detected_at: string
          id: string
          incident_id: string | null
          mitre_technique: string | null
          product: string
          severity: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          affected_device_id?: string | null
          affected_user_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          incident_id?: string | null
          mitre_technique?: string | null
          product?: string
          severity?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          affected_device_id?: string | null
          affected_user_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          incident_id?: string | null
          mitre_technique?: string | null
          product?: string
          severity?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_alerts_affected_device_id_fkey"
            columns: ["affected_device_id"]
            isOneToOne: false
            referencedRelation: "tenant_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_alerts_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_alerts_incident_fk"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "tenant_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_ca_policies: {
        Row: {
          conditions: Json
          created_at: string
          display_name: string
          grant_controls: Json
          id: string
          session_controls: Json | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          display_name: string
          grant_controls?: Json
          id?: string
          session_controls?: Json | null
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          display_name?: string
          grant_controls?: Json
          id?: string
          session_controls?: Json | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_classified_files: {
        Row: {
          classification_source: string
          created_at: string
          file_name: string
          id: string
          label_id: string | null
          location: string
          owner_id: string | null
          sensitivity_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          classification_source?: string
          created_at?: string
          file_name: string
          id?: string
          label_id?: string | null
          location?: string
          owner_id?: string | null
          sensitivity_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          classification_source?: string
          created_at?: string
          file_name?: string
          id?: string
          label_id?: string | null
          location?: string
          owner_id?: string | null
          sensitivity_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_classified_files_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "tenant_sensitivity_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_classified_files_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_devices: {
        Row: {
          compliance_state: string
          created_at: string
          display_name: string
          id: string
          join_type: string
          operating_system: string
          os_version: string | null
          owner_id: string | null
          user_id: string
        }
        Insert: {
          compliance_state?: string
          created_at?: string
          display_name: string
          id?: string
          join_type?: string
          operating_system?: string
          os_version?: string | null
          owner_id?: string | null
          user_id: string
        }
        Update: {
          compliance_state?: string
          created_at?: string
          display_name?: string
          id?: string
          join_type?: string
          operating_system?: string
          os_version?: string | null
          owner_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_devices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_dlp_policies: {
        Row: {
          action: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          locations: Json
          rules: Json
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          locations?: Json
          rules?: Json
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          locations?: Json
          rules?: Json
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_group_members: {
        Row: {
          added_at: string
          group_id: string
          id: string
          member_user_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          group_id: string
          id?: string
          member_user_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          group_id?: string
          id?: string
          member_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tenant_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_group_members_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_groups: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          dynamic_rule: string | null
          group_type: string
          id: string
          membership_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          dynamic_rule?: string | null
          group_type?: string
          id?: string
          membership_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          dynamic_rule?: string | null
          group_type?: string
          id?: string
          membership_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_incidents: {
        Row: {
          assigned_to: string | null
          classification: string | null
          created_at: string
          description: string | null
          determination: string | null
          display_name: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          classification?: string | null
          created_at?: string
          description?: string | null
          determination?: string | null
          display_name: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          classification?: string | null
          created_at?: string
          description?: string | null
          determination?: string | null
          display_name?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_role_assignments: {
        Row: {
          assigned_at: string
          id: string
          principal_id: string
          principal_type: string
          role_name: string
          scope: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          principal_id: string
          principal_type?: string
          role_name: string
          scope?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          principal_id?: string
          principal_type?: string
          role_name?: string
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_sensitivity_labels: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_name: string
          encryption_enabled: boolean
          id: string
          priority: number
          scope: string
          updated_at: string
          user_id: string
          watermark_text: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_name: string
          encryption_enabled?: boolean
          id?: string
          priority?: number
          scope?: string
          updated_at?: string
          user_id: string
          watermark_text?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_name?: string
          encryption_enabled?: boolean
          id?: string
          priority?: number
          scope?: string
          updated_at?: string
          user_id?: string
          watermark_text?: string | null
        }
        Relationships: []
      }
      tenant_sign_in_logs: {
        Row: {
          app_display_name: string
          ca_applied: Json | null
          id: string
          ip_address: string | null
          location: string | null
          principal_id: string | null
          risk_detail: string | null
          risk_level: string
          signed_in_at: string
          status: string
          user_id: string
        }
        Insert: {
          app_display_name: string
          ca_applied?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          principal_id?: string | null
          risk_detail?: string | null
          risk_level?: string
          signed_in_at?: string
          status?: string
          user_id: string
        }
        Update: {
          app_display_name?: string
          ca_applied?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          principal_id?: string | null
          risk_detail?: string | null
          risk_level?: string
          signed_in_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_sign_in_logs_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "tenant_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          account_enabled: boolean
          created_at: string
          department: string | null
          display_name: string
          id: string
          job_title: string | null
          mfa_enabled: boolean
          updated_at: string
          usage_location: string | null
          user_id: string
          user_principal_name: string
        }
        Insert: {
          account_enabled?: boolean
          created_at?: string
          department?: string | null
          display_name: string
          id?: string
          job_title?: string | null
          mfa_enabled?: boolean
          updated_at?: string
          usage_location?: string | null
          user_id: string
          user_principal_name: string
        }
        Update: {
          account_enabled?: boolean
          created_at?: string
          department?: string | null
          display_name?: string
          id?: string
          job_title?: string | null
          mfa_enabled?: boolean
          updated_at?: string
          usage_location?: string | null
          user_id?: string
          user_principal_name?: string
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          attempt_id: string | null
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "lab_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_user_email: { Args: { _user_id: string }; Returns: string }
      admin_grant_access_by_email: {
        Args: {
          _email: string
          _program: Database["public"]["Enums"]["program_code"]
        }
        Returns: string
      }
      get_learner_progress: {
        Args: { _user_id: string }
        Returns: {
          completed_labs: number
          last_active_at: string
          total_labs: number
        }[]
      }
      has_program_access: {
        Args: {
          _program: Database["public"]["Enums"]["program_code"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_tenant: { Args: never; Returns: undefined }
      reset_user_lab_progress: {
        Args: { _user_id: string }
        Returns: undefined
      }
      seed_tenant: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "learner" | "instructor" | "admin"
      program_code:
        | "soc"
        | "itsm"
        | "pen200"
        | "csa"
        | "k8s"
        | "cdl"
        | "ccna"
        | "splunkes"
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
      app_role: ["learner", "instructor", "admin"],
      program_code: [
        "soc",
        "itsm",
        "pen200",
        "csa",
        "k8s",
        "cdl",
        "ccna",
        "splunkes",
      ],
    },
  },
} as const
