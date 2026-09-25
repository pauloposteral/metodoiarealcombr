import { useId, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Lightbulb, type LucideIcon } from 'lucide-react';
import type { CalloutKind } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface CalloutStyle {
  label: string;
  icon: LucideIcon;
  box: string;
  iconColor: string;
}

const CALLOUT_STYLES: Record<CalloutKind, CalloutStyle> = {
  tip: { label: 'Dica', icon: Lightbulb, box: 'border-l-4 border-accent bg-accent/10 rounded-r-xl', iconColor: 'text-gold-dark dark:text-accent' },
  warning: { label: 'Atenção', icon: AlertTriangle, box: 'border-l-4 border-orange-500 bg-orange-500/10 rounded-r-xl', iconColor: 'text-orange-600 dark:text-orange-400' },
  success: { label: 'Resultado', icon: CheckCircle2, box: 'border-l-4 border-emerald-500 bg-emerald-500/10 rounded-r-xl', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  exercise: { label: 'Exercício prático', icon: ClipboardCheck, box: 'border border-primary/25 bg-primary/5 rounded-2xl dark:border-primary/40', iconColor: 'text-primary' },
};

interface CalloutProps {
  kind: CalloutKind;
  /** Visible title; the kind label ("Dica", "Atenção"…) is used when absent. */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * `:::tip`, `:::warning`, `:::success` and `:::exercise` blocks of the lesson content.
 * The icon sits in the title row so the content keeps the full width on phones.
 */
export function Callout({ kind, title, children, className }: CalloutProps) {
  const style = CALLOUT_STYLES[kind];
  const Icon = style.icon;
  const titleId = useId();
  return (
    <div role="note" aria-labelledby={titleId} className={cn('p-4 sm:p-5', style.box, className)}>
      <p id={titleId} className="flex items-start gap-2 font-display font-bold text-foreground">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.iconColor)} aria-hidden="true" />
        <span className="min-w-0">
          {title ? (
            <>
              <span className="sr-only">{style.label}: </span>
              {title}
            </>
          ) : (
            style.label
          )}
        </span>
      </p>
      <div className="mt-3 min-w-0">{children}</div>
    </div>
  );
}
