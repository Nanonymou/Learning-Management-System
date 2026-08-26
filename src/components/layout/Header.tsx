import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { settings } = useCompanySettings();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold">
          {settings.trainingName || 'Learning Management System'}
        </h2>
        {settings.trainingDescription && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {settings.trainingDescription}
          </p>
        )}
      </div>

      <ThemeToggle />
    </header>
  );
}
