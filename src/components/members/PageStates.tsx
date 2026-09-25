import type { ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Skeleton shown while a members page loads its data. */
export function PageLoading({ label = 'Carregando…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('mx-auto max-w-4xl space-y-6', className)}>
      <span className="sr-only">{label}</span>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

interface PageErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** h1 when the error replaces the whole page, h2 inside a page section. */
  headingLevel?: 1 | 2;
  className?: string;
}

export function PageError({
  title = 'Não foi possível carregar esta página',
  description = 'Verifique sua conexão e tente de novo. Se o problema continuar, fale com o suporte.',
  onRetry,
  headingLevel = 1,
  className,
}: PageErrorProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div role="alert" className={cn('mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center sm:p-8', className)}>
      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" aria-hidden="true" />
      <Heading className="font-display text-lg font-bold text-foreground">{title}</Heading>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-5">
          <RotateCcw aria-hidden="true" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card px-6 py-12 text-center', className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-muted-foreground" aria-hidden="true">{icon}</div>
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
