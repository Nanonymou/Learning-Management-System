import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  value: number; // 0..100
  className?: string;
  tone?: 'primary' | 'success';
}

export function Progress({ value, className, tone = 'primary' }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          tone === 'success' ? 'bg-success' : 'bg-primary',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
