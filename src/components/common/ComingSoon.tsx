import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

interface ComingSoonProps {
  title: string;
  description?: string;
  /** Tahap pengembangan yang menargetkan fitur ini (opsional). */
  milestone?: string;
}

/**
 * Placeholder untuk fitur yang dibuat pada tahap berikutnya.
 * Menjaga routing tetap lengkap & scalable tanpa mengimplementasi fitur.
 */
export function ComingSoon({ title, description, milestone }: ComingSoonProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Construction className="h-7 w-7 text-accent-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Segera hadir</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Fitur ini akan dikembangkan pada tahap berikutnya.
              {milestone && ` (${milestone})`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
