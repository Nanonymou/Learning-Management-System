import { EMPTY_COMPANY_SETTINGS, type CompanySettings } from '../types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  loadCompanySettingsRemote,
  saveCompanySettingsRemote,
} from '@/lib/supabase/sync';

/**
 * Kontrak service Company Settings.
 *
 * Abstraksi ini memisahkan UI dari sumber data. Pada Tahap 2 (belum ada
 * database) dipakai `LocalCompanySettingsService` (localStorage). Saat tahap
 * database, cukup buat `SupabaseCompanySettingsService` dengan interface yang
 * sama — komponen tidak perlu diubah.
 */
export interface CompanySettingsService {
  get(): Promise<CompanySettings>;
  save(settings: CompanySettings): Promise<CompanySettings>;
}

const STORAGE_KEY = 'lms-company-settings';

/** Implementasi sementara berbasis localStorage. */
export class LocalCompanySettingsService implements CompanySettingsService {
  async get(): Promise<CompanySettings> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...EMPTY_COMPANY_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<CompanySettings>;
      // Merge agar field baru tetap punya default bila data lama belum lengkap.
      return { ...EMPTY_COMPANY_SETTINGS, ...parsed };
    } catch {
      return { ...EMPTY_COMPANY_SETTINGS };
    }
  }

  async save(settings: CompanySettings): Promise<CompanySettings> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }
}

/**
 * Implementasi Supabase (dipakai bila env Supabase terisi). Menyimpan identitas
 * perusahaan secara terpusat sehingga terlihat sama di semua perangkat. Bila
 * gagal (mis. offline), jatuh ke localStorage sebagai cadangan.
 */
export class SupabaseCompanySettingsService implements CompanySettingsService {
  private local = new LocalCompanySettingsService();

  async get(): Promise<CompanySettings> {
    try {
      const remote = await loadCompanySettingsRemote();
      if (remote) {
        // Cache lokal agar peserta tetap punya salinan.
        await this.local.save(remote);
        return remote;
      }
    } catch {
      /* fallback ke lokal */
    }
    return this.local.get();
  }

  async save(settings: CompanySettings): Promise<CompanySettings> {
    await this.local.save(settings);
    await saveCompanySettingsRemote(settings);
    return settings;
  }
}

/**
 * Instance service aktif — Supabase bila dikonfigurasi, jika tidak localStorage.
 * Titik pergantian tunggal sumber data Company Settings.
 */
export const companySettingsService: CompanySettingsService = isSupabaseConfigured
  ? new SupabaseCompanySettingsService()
  : new LocalCompanySettingsService();
