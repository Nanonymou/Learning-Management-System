import { EMPTY_COMPANY_SETTINGS, type CompanySettings } from '../types';

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
 * Instance service aktif. Titik pergantian tunggal menuju Supabase nanti:
 *   export const companySettingsService = new SupabaseCompanySettingsService();
 */
export const companySettingsService: CompanySettingsService =
  new LocalCompanySettingsService();
