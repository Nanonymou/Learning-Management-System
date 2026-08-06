import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { CompanySettingsProvider } from '@/features/company-settings/CompanySettingsProvider';

/**
 * Menyusun seluruh context provider global aplikasi di satu tempat.
 * Tambahkan provider baru (mis. Auth, Toast) di sini pada tahap berikutnya.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CompanySettingsProvider>{children}</CompanySettingsProvider>
    </ThemeProvider>
  );
}
