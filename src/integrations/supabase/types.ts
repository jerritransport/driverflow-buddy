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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_trail: {
        Row: {
          change_source: string | null
          changed_at: string | null
          changed_by: string | null
          changed_fields: string[] | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
          user_role: string | null
        }
        Insert: {
          change_source?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
          user_role?: string | null
        }
        Update: {
          change_source?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          action: string
          automation_type: string
          completed_at: string | null
          driver_id: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_data: Json | null
          max_retries: number | null
          output_data: Json | null
          retry_count: number | null
          stack_trace: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          action: string
          automation_type: string
          completed_at?: string | null
          driver_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          output_data?: Json | null
          retry_count?: number | null
          stack_trace?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          action?: string
          automation_type?: string
          completed_at?: string | null
          driver_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          output_data?: Json | null
          retry_count?: number | null
          stack_trace?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          accepts_escreen: boolean | null
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string | null
          email: string | null
          escreen_id: string | null
          has_female_observer: boolean | null
          has_male_observer: boolean | null
          hours_of_operation: string | null
          id: string
          is_active: boolean | null
          last_observer_verification_date: string | null
          latitude: number | null
          longitude: number | null
          name: string
          observer_notes: string | null
          offers_alcohol_testing: boolean | null
          offers_observed_collection: boolean | null
          phone: string | null
          reliability_rating: number | null
          state: string
          total_tests_completed: number | null
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          accepts_escreen?: boolean | null
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string | null
          email?: string | null
          escreen_id?: string | null
          has_female_observer?: boolean | null
          has_male_observer?: boolean | null
          hours_of_operation?: string | null
          id?: string
          is_active?: boolean | null
          last_observer_verification_date?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          observer_notes?: string | null
          offers_alcohol_testing?: boolean | null
          offers_observed_collection?: boolean | null
          phone?: string | null
          reliability_rating?: number | null
          state: string
          total_tests_completed?: number | null
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          accepts_escreen?: boolean | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string | null
          email?: string | null
          escreen_id?: string | null
          has_female_observer?: boolean | null
          has_male_observer?: boolean | null
          hours_of_operation?: string | null
          id?: string
          is_active?: boolean | null
          last_observer_verification_date?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          observer_notes?: string | null
          offers_alcohol_testing?: boolean | null
          offers_observed_collection?: boolean | null
          phone?: string | null
          reliability_rating?: number | null
          state?: string
          total_tests_completed?: number | null
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          body: string | null
          created_at: string | null
          delivered_at: string | null
          driver_id: string | null
          email_provider_id: string | null
          error_message: string | null
          id: string
          recipient_email: string | null
          recipient_phone: string | null
          retry_count: number | null
          sent_at: string | null
          sms_provider_id: string | null
          status: string
          subject: string | null
          template_name: string | null
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          email_provider_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sms_provider_id?: string | null
          status?: string
          subject?: string | null
          template_name?: string | null
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          email_provider_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sms_provider_id?: string | null
          status?: string
          subject?: string | null
          template_name?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          driver_id: string
          file_name: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          storage_bucket: string | null
          storage_path: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          driver_id: string
          file_name: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          driver_id?: string
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_notes: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          note_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          note_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          note_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_notes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_notes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_notes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          alcohol_result_url: string | null
          amount_due: number | null
          amount_paid: number | null
          ccf_url: string | null
          cdl_expiration: string | null
          cdl_number: string | null
          cdl_state: string | null
          city: string | null
          clearinghouse_designation_accepted: boolean | null
          clearinghouse_prohibited: boolean | null
          clearinghouse_query_conducted_at: string | null
          clearinghouse_query_result: string | null
          collection_date: string | null
          created_at: string | null
          current_step: number
          date_of_birth: string | null
          documents_uploaded: Json | null
          donor_pass_generated_at: string | null
          donor_pass_number: string | null
          email: string
          employer_contact: string | null
          employer_name: string | null
          first_name: string
          follow_up_date: string | null
          follow_up_note: string | null
          gender: string | null
          id: string
          last_name: string
          middle_name: string | null
          payment_hold: boolean | null
          payment_status: string
          phone: string
          requires_alcohol_test: boolean | null
          rtd_completed: boolean | null
          rtd_completed_at: string | null
          rtd_reported_to_fmcsa_at: string | null
          sample_id: string | null
          sap_id: string | null
          sap_paperwork_received_at: string | null
          state: string | null
          status: string
          test_clinic_id: string | null
          test_completed_at: string | null
          test_result: string | null
          test_result_date: string | null
          test_scheduled_date: string | null
          test_status: string | null
          test_type: string | null
          updated_at: string | null
          urine_result_url: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          alcohol_result_url?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          ccf_url?: string | null
          cdl_expiration?: string | null
          cdl_number?: string | null
          cdl_state?: string | null
          city?: string | null
          clearinghouse_designation_accepted?: boolean | null
          clearinghouse_prohibited?: boolean | null
          clearinghouse_query_conducted_at?: string | null
          clearinghouse_query_result?: string | null
          collection_date?: string | null
          created_at?: string | null
          current_step?: number
          date_of_birth?: string | null
          documents_uploaded?: Json | null
          donor_pass_generated_at?: string | null
          donor_pass_number?: string | null
          email: string
          employer_contact?: string | null
          employer_name?: string | null
          first_name: string
          follow_up_date?: string | null
          follow_up_note?: string | null
          gender?: string | null
          id?: string
          last_name: string
          middle_name?: string | null
          payment_hold?: boolean | null
          payment_status?: string
          phone: string
          requires_alcohol_test?: boolean | null
          rtd_completed?: boolean | null
          rtd_completed_at?: string | null
          rtd_reported_to_fmcsa_at?: string | null
          sample_id?: string | null
          sap_id?: string | null
          sap_paperwork_received_at?: string | null
          state?: string | null
          status?: string
          test_clinic_id?: string | null
          test_completed_at?: string | null
          test_result?: string | null
          test_result_date?: string | null
          test_scheduled_date?: string | null
          test_status?: string | null
          test_type?: string | null
          updated_at?: string | null
          urine_result_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          alcohol_result_url?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          ccf_url?: string | null
          cdl_expiration?: string | null
          cdl_number?: string | null
          cdl_state?: string | null
          city?: string | null
          clearinghouse_designation_accepted?: boolean | null
          clearinghouse_prohibited?: boolean | null
          clearinghouse_query_conducted_at?: string | null
          clearinghouse_query_result?: string | null
          collection_date?: string | null
          created_at?: string | null
          current_step?: number
          date_of_birth?: string | null
          documents_uploaded?: Json | null
          donor_pass_generated_at?: string | null
          donor_pass_number?: string | null
          email?: string
          employer_contact?: string | null
          employer_name?: string | null
          first_name?: string
          follow_up_date?: string | null
          follow_up_note?: string | null
          gender?: string | null
          id?: string
          last_name?: string
          middle_name?: string | null
          payment_hold?: boolean | null
          payment_status?: string
          phone?: string
          requires_alcohol_test?: boolean | null
          rtd_completed?: boolean | null
          rtd_completed_at?: string | null
          rtd_reported_to_fmcsa_at?: string | null
          sample_id?: string | null
          sap_id?: string | null
          sap_paperwork_received_at?: string | null
          state?: string | null
          status?: string
          test_clinic_id?: string | null
          test_completed_at?: string | null
          test_result?: string | null
          test_result_date?: string | null
          test_scheduled_date?: string | null
          test_status?: string | null
          test_type?: string | null
          updated_at?: string | null
          urine_result_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_sap_id_fkey"
            columns: ["sap_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["sap_id"]
          },
          {
            foreignKeyName: "drivers_sap_id_fkey"
            columns: ["sap_id"]
            isOneToOne: false
            referencedRelation: "sap_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_sap_id_fkey"
            columns: ["sap_id"]
            isOneToOne: false
            referencedRelation: "saps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_test_clinic_id_fkey"
            columns: ["test_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinic_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_test_clinic_id_fkey"
            columns: ["test_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_test_clinic_id_fkey"
            columns: ["test_clinic_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          cdl_attachment_url: string | null
          created_at: string | null
          driver_id: string | null
          form_pdf_url: string | null
          id: string
          source: string | null
          status: string | null
          submission_date: string | null
        }
        Insert: {
          cdl_attachment_url?: string | null
          created_at?: string | null
          driver_id?: string | null
          form_pdf_url?: string | null
          id?: string
          source?: string | null
          status?: string | null
          submission_date?: string | null
        }
        Update: {
          cdl_attachment_url?: string | null
          created_at?: string | null
          driver_id?: string | null
          form_pdf_url?: string | null
          id?: string
          source?: string | null
          status?: string | null
          submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          driver_id: string
          failure_reason: string | null
          id: string
          initiated_at: string | null
          payment_method_type: string | null
          payment_type: string
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          driver_id: string
          failure_reason?: string | null
          id?: string
          initiated_at?: string | null
          payment_method_type?: string | null
          payment_type: string
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          driver_id?: string
          failure_reason?: string | null
          id?: string
          initiated_at?: string | null
          payment_method_type?: string | null
          payment_type?: string
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_full_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_needing_attention"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_active_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_active_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
        }
        Relationships: []
      }
      saps: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          certification_expiration: string | null
          certification_number: string | null
          city: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          organization: string | null
          phone: string | null
          state: string | null
          total_drivers_referred: number | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          certification_expiration?: string | null
          certification_number?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          organization?: string | null
          phone?: string | null
          state?: string | null
          total_drivers_referred?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          certification_expiration?: string | null
          certification_number?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          organization?: string | null
          phone?: string | null
          state?: string | null
          total_drivers_referred?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      automation_performance: {
        Row: {
          action: string | null
          automation_type: string | null
          avg_duration_ms: number | null
          executions_last_24h: number | null
          failed_count: number | null
          failures_last_24h: number | null
          last_execution: string | null
          max_duration_ms: number | null
          min_duration_ms: number | null
          success_count: number | null
          success_rate_percent: number | null
          timeout_count: number | null
          total_executions: number | null
        }
        Relationships: []
      }
      clinic_performance: {
        Row: {
          avg_turnaround_days: number | null
          city: string | null
          completion_rate_percent: number | null
          has_female_observer: boolean | null
          has_male_observer: boolean | null
          id: string | null
          is_active: boolean | null
          last_updated: string | null
          name: string | null
          negative_results: number | null
          offers_alcohol_testing: boolean | null
          positive_results: number | null
          reliability_rating: number | null
          state: string | null
          tests_completed: number | null
          total_drivers_assigned: number | null
          total_tests_completed: number | null
          zip_code: string | null
        }
        Relationships: []
      }
      dashboard_summary: {
        Row: {
          active_last_hour: number | null
          alcohol_test_required_count: number | null
          avg_completion_days: number | null
          clearinghouse_pending: number | null
          completed: number | null
          completed_last_30_days: number | null
          completed_last_7_days: number | null
          intake_pending: number | null
          new_drivers_today: number | null
          payment_hold_count: number | null
          payment_pending: number | null
          sap_pending: number | null
          step_1_count: number | null
          step_2_count: number | null
          step_3_count: number | null
          step_4_count: number | null
          step_5_count: number | null
          step_6_count: number | null
          step_7_count: number | null
          test_pending: number | null
          total_drivers: number | null
          total_outstanding: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      driver_full_details: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          cdl_number: string | null
          cdl_state: string | null
          clinic_address: string | null
          clinic_city: string | null
          clinic_id: string | null
          clinic_name: string | null
          clinic_phone: string | null
          clinic_state: string | null
          completion_days: number | null
          created_at: string | null
          current_step: number | null
          date_of_birth: string | null
          document_count: number | null
          donor_pass_number: string | null
          email: string | null
          email_count: number | null
          first_name: string | null
          gender: string | null
          id: string | null
          last_name: string | null
          middle_name: string | null
          payment_status: string | null
          phone: string | null
          rtd_completed: boolean | null
          rtd_completed_at: string | null
          sap_email: string | null
          sap_first_name: string | null
          sap_id: string | null
          sap_last_name: string | null
          sap_organization: string | null
          sap_phone: string | null
          sms_count: number | null
          status: string | null
          test_result: string | null
          test_result_date: string | null
          test_scheduled_date: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      drivers_needing_attention: {
        Row: {
          alert_reason: string | null
          cdl_number: string | null
          created_at: string | null
          current_step: number | null
          days_since_update: number | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          alert_reason?: never
          cdl_number?: string | null
          created_at?: string | null
          current_step?: number | null
          days_since_update?: never
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          priority?: never
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_reason?: never
          cdl_number?: string | null
          created_at?: string | null
          current_step?: number | null
          days_since_update?: never
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          priority?: never
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_summary: {
        Row: {
          alcohol_fee_count: number | null
          alcohol_fee_revenue: number | null
          balance_count: number | null
          balance_revenue: number | null
          deposit_count: number | null
          deposit_revenue: number | null
          failed_amount: number | null
          failed_count: number | null
          payment_date: string | null
          refund_count: number | null
          total_refunded: number | null
          total_revenue: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      recent_activity: {
        Row: {
          activity_description: string | null
          activity_status: string | null
          activity_timestamp: string | null
          activity_type: string | null
          related_id: string | null
          related_name: string | null
        }
        Relationships: []
      }
      sap_performance: {
        Row: {
          alcohol_test_rate_percent: number | null
          avg_response_days: number | null
          email: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          last_updated: string | null
          organization: string | null
          paperwork_received_count: number | null
          rtd_completed_count: number | null
          total_drivers_assigned: number | null
          total_drivers_referred: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_driver_step: {
        Args: { driver_uuid: string; new_status: string }
        Returns: undefined
      }
      calculate_completion_time: {
        Args: { driver_uuid: string }
        Returns: unknown
      }
      get_driver_by_cdl: {
        Args: { cdl: string; cdl_st?: string }
        Returns: {
          address_line1: string | null
          address_line2: string | null
          alcohol_result_url: string | null
          amount_due: number | null
          amount_paid: number | null
          ccf_url: string | null
          cdl_expiration: string | null
          cdl_number: string | null
          cdl_state: string | null
          city: string | null
          clearinghouse_designation_accepted: boolean | null
          clearinghouse_prohibited: boolean | null
          clearinghouse_query_conducted_at: string | null
          clearinghouse_query_result: string | null
          collection_date: string | null
          created_at: string | null
          current_step: number
          date_of_birth: string | null
          documents_uploaded: Json | null
          donor_pass_generated_at: string | null
          donor_pass_number: string | null
          email: string
          employer_contact: string | null
          employer_name: string | null
          first_name: string
          follow_up_date: string | null
          follow_up_note: string | null
          gender: string | null
          id: string
          last_name: string
          middle_name: string | null
          payment_hold: boolean | null
          payment_status: string
          phone: string
          requires_alcohol_test: boolean | null
          rtd_completed: boolean | null
          rtd_completed_at: string | null
          rtd_reported_to_fmcsa_at: string | null
          sample_id: string | null
          sap_id: string | null
          sap_paperwork_received_at: string | null
          state: string | null
          status: string
          test_clinic_id: string | null
          test_completed_at: string | null
          test_result: string | null
          test_result_date: string | null
          test_scheduled_date: string | null
          test_status: string | null
          test_type: string | null
          updated_at: string | null
          urine_result_url: string | null
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "drivers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
      app_role: ["admin", "staff"],
    },
  },
} as const
