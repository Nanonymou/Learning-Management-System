import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';

interface BrandLogoProps {
  className?: string;
  /** Sesuaikan warna teks untuk latar gelap (sidebar). */
  inverted?: boolean;
}

/**
 * Menampilkan logo + nama perusahaan dari Company Settings.
 * Bila belum diisi, tampilkan placeholder netral (tanpa identitas hardcode).
 */
export function BrandLogo({ className, inverted }: BrandLogoProps) {
  const { settings } = useCompanySettings();
  const name = settings.companyName || 'Nama Perusahaan';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md',
          inverted ? 'bg-white/10' : 'bg-primary/10',
        )}
      >
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={name} className="h-full w-full object-contain" />
        ) : (
          <GraduationCap
            className={cn('h-5 w-5', inverted ? 'text-white' : 'text-primary')}
          />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'truncate text-sm font-semibold leading-tight',
            !settings.companyName && 'opacity-70',
          )}
        >
          {name}
        </p>
        {settings.trainingName && (
          <p
            className={cn(
              'truncate text-xs leading-tight',
              inverted ? 'text-sidebar-foreground/60' : 'text-muted-foreground',
            )}
          >
            {settings.trainingName}
          </p>
        )}
      </div>
    </div>
  );
}
