import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';

export function Footer() {
  const { settings } = useCompanySettings();
  const year = new Date().getFullYear();
  const company = settings.companyName || 'Nama Perusahaan';

  const contacts = [
    settings.address && { icon: MapPin, text: settings.address },
    settings.phone && { icon: Phone, text: settings.phone },
    settings.email && { icon: Mail, text: settings.email },
    settings.website && { icon: Globe, text: settings.website },
  ].filter(Boolean) as { icon: typeof Mail; text: string }[];

  return (
    <footer className="border-t border-border bg-card px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium">{company}</p>
          {contacts.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
              {contacts.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          © {year} {company}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
