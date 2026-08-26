import { Check, X, Thermometer, Quote } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { MaterialBlock } from '../types';

/**
 * Render satu blok materi sesuai tipenya.
 * Mapping ke "box" pada PRD:
 *  - list_check ok=true  -> Best Practice Box (✔)
 *  - list_check ok=false -> Warning Box (✘)
 *  - temperature         -> Highlight Box (angka/suhu)
 */
export function BlockRenderer({ block }: { block: MaterialBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="mt-6 text-lg font-semibold text-foreground first:mt-0">
          {block.text}
        </h3>
      );

    case 'paragraph':
      return <p className="leading-relaxed text-foreground/90">{block.text}</p>;

    case 'quote':
      return (
        <blockquote className="flex gap-3 rounded-lg border-l-4 border-primary bg-accent/50 p-4 italic text-accent-foreground">
          <Quote className="h-5 w-5 shrink-0 opacity-60" />
          <span>{block.text}</span>
        </blockquote>
      );

    case 'list_bullet':
      return (
        <ul className="ml-1 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-foreground/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'list_check':
      return <CheckBox ok={block.ok} items={block.items} />;

    case 'temperature':
      return (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
            <Thermometer className="h-4 w-4" /> Suhu Penting
          </div>
          <ul className="flex flex-wrap gap-2">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

function CheckBox({ ok, items }: { ok: boolean; items: string[] }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        ok ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10',
      )}
    >
      <p
        className={cn(
          'mb-2 text-sm font-semibold',
          ok ? 'text-success' : 'text-danger',
        )}
      >
        {ok ? 'Best Practice' : 'Hindari'}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-foreground/90">
            {ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
