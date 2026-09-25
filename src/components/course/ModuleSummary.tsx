import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock, Lock, Trophy } from 'lucide-react';
import { formatMinutes, summarizeProgress, type OutlineModule } from '@/lib/curriculum';
import { cn } from '@/lib/utils';
import { ExtraModuleBadge, ModuleCodeBadge, StarModuleBadge } from './ModuleBadges';
import { ProgressBar } from './ProgressBar';

interface ModuleSummaryProps {
  module: OutlineModule;
  completed: ReadonlySet<string>;
  /** Outside the learner's track: labelled "Extra", still open. */
  isExtra?: boolean;
  headingLevel?: 'h2' | 'h3';
  showProject?: boolean;
  className?: string;
}

/**
 * Code, title, hours, lesson count, progress and project of a module. The title link
 * stretches over the whole summary so the card is clickable with a short accessible name.
 */
export function ModuleSummary({ module, completed, isExtra = false, headingLevel = 'h3', showProject = true, className }: ModuleSummaryProps) {
  const progress = summarizeProgress(module.lessons, completed);
  const locked = module.lessons.filter((lesson) => !lesson.accessible).length;
  const done = progress.total > 0 && progress.completed === progress.total;
  const Heading = headingLevel;

  return (
    <div className={cn('relative p-4 sm:p-5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ModuleCodeBadge code={module.code} />
        {module.is_star && <StarModuleBadge />}
        {isExtra && <ExtraModuleBadge />}
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Concluído
          </span>
        )}
      </div>
      <Heading className="mt-2 font-display text-lg font-bold text-foreground">
        <Link
          to={`/membros/modulos/${module.id}`}
          className="rounded-sm after:absolute after:inset-0 after:rounded-2xl hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {module.displayTitle}
        </Link>
      </Heading>
      {module.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{module.description}</p>}

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {module.hours_label ?? formatMinutes(progress.minutes)}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {module.lessons.length} {module.lessons.length === 1 ? 'aula' : 'aulas'}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {progress.completed}/{progress.total} concluídas
        </span>
        {locked > 0 && (
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {locked === module.lessons.length ? 'Bloqueado no seu plano' : `${locked} bloqueadas`}
          </span>
        )}
      </p>
      <ProgressBar value={progress.percent} label={`Progresso do módulo ${module.displayTitle}`} className="mt-3 h-1.5" />

      {showProject && module.project_title && (
        <p className="mt-3 flex items-start gap-2 text-sm text-foreground/85">
          <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-accent" aria-hidden="true" />
          <span>
            <span className="font-semibold text-foreground">Projeto: </span>
            {module.project_title}
          </span>
        </p>
      )}
    </div>
  );
}
