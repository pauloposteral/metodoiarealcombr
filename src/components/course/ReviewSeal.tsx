import { BadgeCheck } from 'lucide-react';
import { REVIEW_CYCLE_DAYS, formatMonthYear, isReviewOverdue } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

/** "Atualizado em set/2026 · revisão a cada 90 dias"; hidden when the lesson has no review date. */
export function ReviewSeal({ reviewedAt, className }: { reviewedAt: string | null; className?: string }) {
  const monthYear = formatMonthYear(reviewedAt);
  if (!reviewedAt || !monthYear) return null;
  const overdue = isReviewOverdue(reviewedAt);
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground', className)}>
      <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span>
        Atualizado em <time dateTime={reviewedAt}>{monthYear}</time> · revisão a cada {REVIEW_CYCLE_DAYS} dias
      </span>
      {overdue && (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
          Em revisão
          <span className="sr-only">: esta aula passou do ciclo de revisão e será conferida em breve</span>
        </span>
      )}
    </p>
  );
}
