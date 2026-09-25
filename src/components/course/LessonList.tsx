import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Lock, PlayCircle, Trophy } from 'lucide-react';
import { isProjectLesson, type OutlineLesson } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

interface LessonListProps {
  lessons: OutlineLesson[];
  completed: ReadonlySet<string>;
  /** Lesson highlighted as "continue here". */
  resumeLessonId?: string | null;
  showDescription?: boolean;
  className?: string;
}

/** Lessons of a module with completion, lock and project state. Locked lessons open the unlock page. */
export function LessonList({ lessons, completed, resumeLessonId, showDescription = false, className }: LessonListProps) {
  return (
    <ol role="list" className={cn('divide-y divide-border/50', className)}>
      {lessons.map((lesson, index) => {
        const done = completed.has(lesson.id);
        const project = isProjectLesson(lesson);
        const isResume = lesson.id === resumeLessonId;
        return (
          <li key={lesson.id}>
            <Link
              to={`/membros/aula/${lesson.id}`}
              className={cn(
                'group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5',
                isResume && 'bg-accent/10',
              )}
            >
              <LessonStatusIcon done={done} locked={!lesson.accessible} project={project} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium text-foreground', !lesson.accessible && 'text-foreground/70')}>{lesson.title}</p>
                {showDescription && lesson.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1">{lesson.description}</p>
                )}
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Aula {index + 1}</span>
                  {lesson.minutes > 0 && <span aria-hidden="true">·</span>}
                  {lesson.minutes > 0 && <span>{lesson.minutes} min</span>}
                  {project && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-foreground">Projeto</span>}
                  {isResume && <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground">Continue aqui</span>}
                  {done && <span className="sr-only">Concluída</span>}
                  {!lesson.accessible && <span className="sr-only">Bloqueada no seu plano</span>}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function LessonStatusIcon({ done, locked, project }: { done: boolean; locked: boolean; project: boolean }) {
  const Icon = done ? CheckCircle2 : locked ? Lock : project ? Trophy : PlayCircle;
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        done && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        !done && locked && 'bg-secondary text-muted-foreground',
        !done && !locked && 'bg-accent/15 text-foreground',
      )}
      aria-hidden="true"
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}
