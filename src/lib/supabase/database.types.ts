/**
 * Tipe skema database (Supabase) — helper untuk data layer.
 *
 * Ditulis manual agar selaras dengan migrasi di `supabase/migrations`.
 * Belum dipakai UI pada tahap ini; menjadi acuan tipe saat modul data dibuat.
 * (Dapat diganti hasil `supabase gen types typescript` saat proyek terhubung.)
 */

export type CertificateStatus = 'lulus' | 'tidak_lulus';

export type MaterialBlockType =
  | 'heading'
  | 'paragraph'
  | 'list_bullet'
  | 'list_check'
  | 'temperature'
  | 'case_finding'
  | 'commitment'
  | 'quote';

export interface Database {
  public: {
    Tables: {
      company_settings: {
        Row: {
          id: string;
          is_singleton: boolean;
          company_name: string;
          logo_url: string;
          address: string;
          website: string;
          email: string;
          phone: string;
          training_name: string;
          training_description: string;
          signer1_name: string;
          signer1_title: string;
          signer1_signature_url: string;
          signer2_name: string;
          signer2_title: string;
          signer2_signature_url: string;
          certificate_background_url: string;
          certificate_logo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['company_settings']['Row']>;
        Update: Partial<Database['public']['Tables']['company_settings']['Row']>;
      };
      admin: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admin']['Row']>;
      };
      positions: {
        Row: { id: string; name: string; is_active: boolean; created_at: string };
        Insert: { id?: string; name: string; is_active?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['positions']['Row']>;
      };
      locations: {
        Row: { id: string; name: string; is_active: boolean; created_at: string };
        Insert: { id?: string; name: string; is_active?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['locations']['Row']>;
      };
      users: {
        Row: {
          id: string;
          full_name: string;
          position_id: string | null;
          location_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          position_id?: string | null;
          location_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      material_chapters: {
        Row: {
          id: string;
          training_key: string;
          order_no: number;
          code: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          training_key?: string;
          order_no: number;
          code?: string;
          title: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_chapters']['Row']>;
      };
      material_blocks: {
        Row: {
          id: string;
          chapter_id: string;
          order_no: number;
          type: MaterialBlockType;
          payload: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          order_no: number;
          type: MaterialBlockType;
          payload?: unknown;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_blocks']['Row']>;
      };
      training_progress: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          progress: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          progress?: number;
          completed?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['training_progress']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          position_id: string | null;
          location_id: string | null;
          attend_date: string;
          attend_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          position_id?: string | null;
          location_id?: string | null;
          attend_date?: string;
          attend_time?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      questions: {
        Row: {
          id: string;
          training_key: string;
          chapter_ref: string;
          question_text: string;
          explanation: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          training_key?: string;
          chapter_ref?: string;
          question_text: string;
          explanation?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Row']>;
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          order_no: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          order_no?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['question_options']['Row']>;
      };
      quiz_result: {
        Row: {
          id: string;
          user_id: string;
          training_key: string;
          score: number;
          total_questions: number;
          correct_count: number;
          wrong_count: number;
          status: CertificateStatus;
          attempt_no: number;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          training_key?: string;
          score?: number;
          total_questions?: number;
          correct_count?: number;
          wrong_count?: number;
          status?: CertificateStatus;
          attempt_no?: number;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_result']['Row']>;
      };
      quiz_answers: {
        Row: {
          id: string;
          quiz_result_id: string;
          question_id: string;
          selected_option_id: string | null;
          is_correct: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_result_id: string;
          question_id: string;
          selected_option_id?: string | null;
          is_correct?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_answers']['Row']>;
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          quiz_result_id: string | null;
          certificate_number: string;
          training_name: string;
          participant_name: string;
          position_name: string;
          location_name: string;
          score: number;
          qr_payload: string;
          issued_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_result_id?: string | null;
          certificate_number: string;
          training_name?: string;
          participant_name?: string;
          position_name?: string;
          location_name?: string;
          score?: number;
          qr_payload?: string;
          issued_date?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['certificates']['Row']>;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      generate_certificate_number: { Args: Record<string, never>; Returns: string };
    };
  };
}

/** Alias praktis: baris tabel by nama. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
