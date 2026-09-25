import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  /** Accessible name, e.g. "Progresso do módulo". */
  label: string;
  className?: string;
  indicatorClassName?: string;
}

/** Progress bar with a gold indicator that stays visible on light, dark and navy surfaces. */
export function ProgressBar({ value, label, className, indicatorClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped}%`}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    >
      <div className={cn('h-full rounded-full bg-accent transition-[width] duration-500', indicatorClassName)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
