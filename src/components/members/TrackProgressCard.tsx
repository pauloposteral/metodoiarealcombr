import { Link } from 'react-router-dom';
import { Route as RouteIcon } from 'lucide-react';
import { ProgressBar } from '@/components/course/ProgressBar';
import { TRACKS, formatMinutes, type ProgressSummary, type TrackKey } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

interface TrackProgressCardProps {
  track: TrackKey;
  progress: ProgressSummary;
  remainingMinutes: number;
  courseSlug: string | null;
  className?: string;
}

export function TrackProgressCard({ track, progress, remainingMinutes, courseSlug, className }: TrackProgressCardProps) {
  const done = progress.total > 0 && progress.completed === progress.total;
  return (
    <section aria-labelledby="track-progress-title" className={cn('rounded-2xl border border-border/50 bg-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <RouteIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Sua trilha
          </p>
          <h2 id="track-progress-title" className="mt-1 font-display font-bold text-foreground">{TRACKS[track].label}</h2>
        </div>
        <Link
          to="/membros/trilha"
          className="shrink-0 rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Trocar
        </Link>
      </div>
      <p className="mt-4 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-foreground">{progress.completed} de {progress.total} aulas</span>
        <span className="font-bold text-foreground">{progress.percent}%</span>
      </p>
      <ProgressBar value={progress.percent} label="Progresso na trilha" className="mt-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        {done ? 'Trilha concluída. Os outros módulos continuam abertos como extras.' : `Faltam cerca de ${formatMinutes(remainingMinutes)} de aulas.`}
      </p>
      {courseSlug && (
        <Link
          to={`/membros/cursos/${courseSlug}`}
          className="mt-4 inline-block rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ver os módulos da trilha
        </Link>
      )}
    </section>
  );
}
