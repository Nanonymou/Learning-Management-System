import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { CompanySettingsProvider } from '@/features/company-settings/CompanySettingsProvider';

/** Menyusun seluruh context provider global aplikasi di satu tempat. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CompanySettingsProvider>{children}</CompanySettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
