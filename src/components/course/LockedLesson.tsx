import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, PlayCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LessonContext } from '@/hooks/useCourseOutline';
import { ModuleCodeBadge } from './ModuleBadges';

interface LockedLessonProps {
  context: LessonContext;
  /** First lesson the learner can open, offered while they decide. */
  openLesson: { id: string; title: string } | null;
}

/** Shown when the outline lists the lesson but the learner's plan does not open it. */
export function LockedLesson({ context, openLesson }: LockedLessonProps) {
  const { module, lesson, position, moduleLessonCount } = context;
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card p-6 text-center sm:p-10">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15" aria-hidden="true">
        <Lock className="h-7 w-7 text-foreground" />
      </div>
      <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <ModuleCodeBadge code={module.code} />
        <span>{module.displayTitle}</span>
        <span aria-hidden="true">·</span>
        <span>Aula {position} de {moduleLessonCount}</span>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-foreground">{lesson.title}</h1>
      {lesson.description && <p className="mt-2 text-muted-foreground">{lesson.description}</p>}
      <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">
        Esta aula faz parte do conteúdo completo do curso. Escolha um plano para liberar todas as aulas, os quizzes e os projetos.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button asChild variant="cta" size="lg">
          <Link to="/pricing">
            <Sparkles aria-hidden="true" />
            Ver planos e desbloquear
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to={`/membros/modulos/${module.id}`}>
            <ArrowLeft aria-hidden="true" />
            Voltar ao módulo
          </Link>
        </Button>
      </div>
      {openLesson && (
        <p className="mt-6 text-sm text-muted-foreground">
          Enquanto isso, continue pelas aulas liberadas:{' '}
          <Link
            to={`/membros/aula/${openLesson.id}`}
            className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {openLesson.title}
          </Link>
        </p>
      )}
    </section>
  );
}
