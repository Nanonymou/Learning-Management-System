import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

const tones = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
} as const;

export function StatCard({ icon: Icon, label, value, tone = 'primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
