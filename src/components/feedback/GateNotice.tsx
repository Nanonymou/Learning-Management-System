import type { ComponentType } from 'react';
import { Lock, type LucideProps } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GateNoticeProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'warning' | 'success';
}

/**
 * Notifikasi "terkunci/berhasil" untuk gating alur training.
 * Dipakai ulang di Daftar Hadir & Ujian (dan gate lain).
 */
export function GateNotice({
  icon: Icon = Lock,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'warning',
}: GateNoticeProps) {
  const toneClass =
    tone === 'success' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning';
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-7 w-7" />
        </div>
        <p className="font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
      </CardContent>
    </Card>
  );
}
