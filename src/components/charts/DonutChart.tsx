interface DonutChartProps {
  value: number; // 0..100
  label?: string;
  size?: number;
  tone?: 'primary' | 'success';
}

/** Donut/ring chart ringan berbasis SVG (tanpa dependency). */
export function DonutChart({
  value,
  label,
  size = 140,
  tone = 'primary',
}: DonutChartProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = tone === 'success' ? 'hsl(var(--success))' : 'hsl(var(--primary))';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{Math.round(clamped)}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
