import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { ProgressBar } from '@/components/course/ProgressBar';
import { formatMinutes, trackDisplayName, type CertificateRequirements as Requirements } from '@/lib/curriculum';

interface CertificateRequirementsProps {
  requirements: Requirements;
  totalMinutes: number | null;
}

/** The certificate rule for the learner's track: lesson threshold and final project. */
export function CertificateRequirements({ requirements, totalMinutes }: CertificateRequirementsProps) {
  const legacyRule = requirements.finalProjectLessonId === null;
  return (
    <section aria-labelledby="certificate-requirements-title" className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="certificate-requirements-title" className="font-display text-lg font-bold text-foreground">Requisitos do certificado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {trackDisplayName(requirements.track)}
            {totalMinutes ? ` · carga horária de ${formatMinutes(totalMinutes)}` : ''}
          </p>
        </div>
        {!legacyRule && (
          <Link
            to="/membros/trilha"
            className="shrink-0 rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Trocar trilha
          </Link>
        )}
      </div>

      <ul role="list" className="mt-5 space-y-5">
        <li className="flex gap-3">
          <StatusIcon done={requirements.lessonsMet} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              {legacyRule
                ? `Concluir todas as ${requirements.totalLessons} aulas publicadas`
                : `Concluir ${requirements.neededLessons} das ${requirements.totalLessons} aulas da trilha (${requirements.thresholdPercent}%)`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {requirements.completedLessons} {requirements.completedLessons === 1 ? 'aula concluída' : 'aulas concluídas'}
              {!requirements.lessonsMet && requirements.neededLessons > requirements.completedLessons
                ? ` · faltam ${requirements.neededLessons - requirements.completedLessons}`
                : ''}
            </p>
            <ProgressBar value={requirements.percentOfGoal} label="Aulas concluídas para o certificado" className="mt-2" />
          </div>
        </li>
        {requirements.finalProjectLessonId && (
          <li className="flex gap-3">
            <StatusIcon done={requirements.projectMet} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Concluir e entregar o projeto final do MOD-12</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {requirements.projectMet ? 'Projeto final entregue.' : 'Cole o link do seu portfólio em "Entregar projeto" e conclua a aula.'}
              </p>
              {!requirements.projectMet && (
                <Link
                  to={`/membros/aula/${requirements.finalProjectLessonId}`}
                  className="mt-2 inline-block rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ir para o projeto final
                </Link>
              )}
            </div>
          </li>
        )}
      </ul>
      {!legacyRule && (
        <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Contam as aulas dos módulos da sua trilha. Aulas extras ficam no seu histórico, mas não mudam a meta.
        </p>
      )}
    </section>
  );
}

function StatusIcon({ done }: { done: boolean }) {
  return (
    <span className="mt-0.5 shrink-0">
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="sr-only">{done ? 'Cumprido:' : 'Pendente:'}</span>
    </span>
  );
}
