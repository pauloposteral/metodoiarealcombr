import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** "MOD-04" pill. */
export function ModuleCodeBadge({ code, className }: { code: string | null; className?: string }) {
  if (!code) return null;
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-primary-foreground', className)}>
      {code}
    </span>
  );
}

export function StarModuleBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground', className)}>
      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
      Módulo-estrela
    </span>
  );
}

/** Module outside the learner's track: still open, just not required. */
export function ExtraModuleBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground', className)}>
      Extra
      <span className="sr-only"> (fora da sua trilha)</span>
    </span>
  );
}
