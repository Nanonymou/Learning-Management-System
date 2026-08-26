import { BookOpen, ClipboardCheck, FileQuestion, Award, BadgeCheck, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TrainingFlow } from './useTrainingFlow';

/** Timeline langkah training dengan status nyata dari alur peserta. */
export function TrainingTimeline({ flow }: { flow: TrainingFlow }) {
  const steps = [
    { icon: BookOpen, label: 'Membaca Materi', done: flow.readingComplete },
    { icon: ClipboardCheck, label: 'Mengisi Daftar Hadir', done: flow.attendedToday },
    { icon: FileQuestion, label: 'Mengerjakan Ujian', done: flow.hasResult },
    { icon: Award, label: 'Lulus', done: flow.passed },
    { icon: BadgeCheck, label: 'Mendapat Sertifikat', done: flow.hasCertificate },
  ];

  // Langkah aktif = langkah pertama yang belum selesai.
  const activeIndex = steps.findIndex((s) => !s.done);

  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => {
        const active = i === activeIndex;
        const locked = activeIndex !== -1 && i > activeIndex;
        return (
          <li
            key={step.label}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3',
              step.done && 'border-success/30 bg-success/5',
              active && 'border-primary bg-accent/40',
              locked && 'opacity-60',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                step.done
                  ? 'bg-success text-white'
                  : active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {step.done ? (
                <Check className="h-4 w-4" />
              ) : locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Langkah {i + 1}</p>
              <p className="truncate text-sm font-medium">{step.label}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
