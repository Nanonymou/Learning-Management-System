import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Tampilkan spinner & nonaktifkan tombol selama proses. */
  loading?: boolean;
}

/**
 * Tombol interaktif: hover mengangkat (translateY) + kilau bayangan berwarna,
 * tekan (active) sedikit mengecil untuk feedback taktil. Transisi halus dan
 * dihormati oleh prefers-reduced-motion (lihat index.css).
 */
const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_hsl(var(--primary)/0.55)] ' +
    'hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.65)]',
  danger:
    'bg-danger text-white shadow-[0_6px_20px_-8px_hsl(var(--danger)/0.55)] ' +
    'hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_28px_-8px_hsl(var(--danger)/0.65)]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-muted hover:-translate-y-0.5 hover:shadow-md',
  outline:
    'border border-border bg-transparent hover:bg-muted hover:border-primary/40 ' +
    'hover:-translate-y-0.5 hover:shadow-sm',
  ghost: 'bg-transparent hover:bg-muted',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2 rounded-md font-medium',
        'transition-all duration-200 ease-out will-change-transform',
        'active:scale-[0.97] active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
