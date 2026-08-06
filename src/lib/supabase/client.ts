import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client (konfigurasi saja).
 *
 * Catatan Tahap 2: database BELUM dibuat. Client ini disiapkan agar modul
 * data tinggal memakainya saat tahap database. Bila env belum diisi, client
 * tidak diinisialisasi dan `isSupabaseConfigured` bernilai false — aplikasi
 * tetap berjalan (fitur memakai adapter penyimpanan lokal untuk sementara).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
