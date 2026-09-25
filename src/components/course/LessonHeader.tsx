import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import type { CourseSummary } from '@/hooks/useCourseOutline';
import type { OutlineModule } from '@/lib/curriculum';
import { ModuleCodeBadge } from './ModuleBadges';
import { ReviewSeal } from './ReviewSeal';

interface LessonHeaderProps {
  course: CourseSummary | null;
  module: OutlineModule | null;
  /** 1-based position inside the module and the module's lesson count. */
  position: number | null;
  total: number | null;
  minutes: number;
  completed: boolean;
  title: string;
  description: string | null;
  reviewedAt: string | null;
  actions?: ReactNode;
}

export function LessonHeader({ course, module, position, total, minutes, completed, title, description, reviewedAt, actions }: LessonHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      {module && (
        <nav aria-label="Você está em">
          <ol role="list" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {course && (
              <li className="flex items-center gap-2">
                <Link to={`/membros/cursos/${course.slug}`} className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {course.title}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </li>
            )}
            <li>
              <Link
                to={`/membros/modulos/${module.id}`}
                className="inline-flex items-center gap-2 rounded-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ModuleCodeBadge code={module.code} />
                <span>{module.displayTitle}</span>
              </Link>
            </li>
          </ol>
        </nav>
      )}

      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {actions}
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {position !== null && total !== null && (
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Aula {position} de {total}
          </span>
        )}
        {minutes > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {minutes} min
          </span>
        )}
        {completed && (
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Concluída
          </span>
        )}
      </p>

      {description && <p className="text-muted-foreground">{description}</p>}
      <ReviewSeal reviewedAt={reviewedAt} />
    </header>
  );
}
