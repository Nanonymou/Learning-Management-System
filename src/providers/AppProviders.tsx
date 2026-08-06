import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { CompanySettingsProvider } from '@/features/company-settings/CompanySettingsProvider';

/**
 * Menyusun seluruh context provider global aplikasi di satu tempat.
 * Tambahkan provider baru (mis. Auth) di sini pada tahap berikutnya.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CompanySettingsProvider>{children}</CompanySettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
