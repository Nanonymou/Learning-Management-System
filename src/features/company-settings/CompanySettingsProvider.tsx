import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { companySettingsService } from './services/companySettings.service';
import { EMPTY_COMPANY_SETTINGS, type CompanySettings } from './types';

interface CompanySettingsContextValue {
  settings: CompanySettings;
  loading: boolean;
  save: (settings: CompanySettings) => Promise<void>;
  reload: () => Promise<void>;
}

const CompanySettingsContext = createContext<CompanySettingsContextValue | undefined>(
  undefined,
);

/**
 * Menyediakan Company Settings ke seluruh aplikasi (header, footer, dsb).
 * Menghindari hardcode identitas — semua komponen membaca dari context ini.
 */
export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(EMPTY_COMPANY_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await companySettingsService.get();
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (next: CompanySettings) => {
    const saved = await companySettingsService.save(next);
    setSettings(saved);
  }, []);

  const value = useMemo(
    () => ({ settings, loading, save, reload }),
    [settings, loading, save, reload],
  );

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompanySettings(): CompanySettingsContextValue {
  const ctx = useContext(CompanySettingsContext);
  if (!ctx)
    throw new Error('useCompanySettings harus dipakai di dalam CompanySettingsProvider');
  return ctx;
}
