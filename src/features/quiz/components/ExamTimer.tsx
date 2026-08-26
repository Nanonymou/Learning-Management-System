import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatClock } from '@/lib/utils/format';

interface ExamTimerProps {
  startedAt: string;
  durationSec: number;
  onExpire: () => void;
}

/** Timer hitung mundur berbasis waktu mulai (anti-manipulasi sederhana). */
export function ExamTimer({ startedAt, durationSec, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(() => remainingSec(startedAt, durationSec));

  useEffect(() => {
    const timer = window.setInterval(() => {
      const rem = remainingSec(startedAt, durationSec);
      setRemaining(rem);
      if (rem <= 0) {
        window.clearInterval(timer);
        onExpire();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, durationSec, onExpire]);

  const danger = remaining <= 60;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
        danger ? 'bg-danger/15 text-danger' : 'bg-primary/10 text-primary',
      )}
    >
      <Clock className="h-4 w-4" />
      {formatClock(Math.max(0, remaining))}
    </div>
  );
}

function remainingSec(startedAt: string, durationSec: number): number {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return durationSec - elapsed;
}
