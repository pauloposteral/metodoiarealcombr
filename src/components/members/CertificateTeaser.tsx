import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Circle } from 'lucide-react';
import { ProgressBar } from '@/components/course/ProgressBar';
import { useCertificateStatus } from '@/hooks/useCertificate';
import { certificateRequirements, trackDisplayName } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

/** Dashboard teaser: progress towards the certificate rule (75% of the track + final project). */
export function CertificateTeaser({ className }: { className?: string }) {
  const status = useCertificateStatus();

  if (status.isPending) {
    return <div className={cn('h-44 animate-pulse rounded-2xl bg-muted', className)} role="status" aria-label="Carregando certificado" />;
  }
  if (status.isError || !status.data) {
    return (
      <div className={cn('rounded-2xl border border-border/50 bg-card p-5 text-sm text-muted-foreground', className)}>
        Não foi possível carregar o progresso do certificado.{' '}
        <button type="button" onClick={() => void status.refetch()} className="rounded-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Tentar de novo
        </button>
      </div>
    );
  }

  const requirements = certificateRequirements(status.data);
  return (
    <section aria-labelledby="certificate-teaser-title" className={cn('rounded-2xl border border-border/50 bg-card p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="certificate-teaser-title" className="flex items-center gap-2 font-display font-bold text-foreground">
          <Award className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
          Certificado
        </h2>
        {requirements.eligible && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Liberado</span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{trackDisplayName(requirements.track)}</p>
      <p className="mt-3 text-sm text-foreground">
        {requirements.completedLessons} de {requirements.neededLessons} aulas necessárias
        <span className="text-muted-foreground"> ({requirements.thresholdPercent}% das aulas)</span>
      </p>
      <ProgressBar value={requirements.percentOfGoal} label="Aulas para o certificado" className="mt-2" />
      {requirements.finalProjectLessonId && (
        <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
          {requirements.projectMet ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          Projeto final do MOD-12 {requirements.projectMet ? 'entregue' : 'pendente'}
        </p>
      )}
      <Link
        to="/membros/certificado"
        className="mt-4 inline-block rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {requirements.eligible ? 'Emitir certificado' : 'Ver requisitos do certificado'}
      </Link>
    </section>
  );
}
