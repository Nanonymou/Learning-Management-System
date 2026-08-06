import { EmptyState } from '@/components/feedback/EmptyState';

interface BarListProps {
  data: { label: string; value: number }[];
  emptyText?: string;
}

/** Daftar bar horizontal (kategori) — ringan, tanpa dependency. */
export function BarList({ data, emptyText = 'Belum ada data.' }: BarListProps) {
  if (data.length === 0) {
    return <EmptyState title={emptyText} />;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate text-foreground/90">{d.label}</span>
            <span className="font-medium text-muted-foreground">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
