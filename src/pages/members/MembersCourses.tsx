import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, GraduationCap, Layers, Lock, Sparkles } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { EmptyState, PageError, PageLoading } from '@/components/members/PageStates';
import { ProgressBar } from '@/components/course/ProgressBar';
import { Button } from '@/components/ui/button';
import { useCompletedLessons, useCourseCatalog, type CourseEntry } from '@/hooks/useCourseOutline';
import { curriculumModules, formatMinutes, summarizeProgress } from '@/lib/curriculum';

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export default function MembersCourses() {
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();

  let body;
  if (catalog.isPending || completed.isPending) {
    body = <PageLoading label="Carregando cursos…" className="max-w-6xl" />;
  } else if (catalog.isError || completed.isError) {
    body = (
      <PageError
        title="Não foi possível carregar os cursos"
        onRetry={() => {
          void catalog.refetch();
          void completed.refetch();
        }}
      />
    );
  } else {
    const entries = catalog.data.entries;
    const anyLocked = entries.some((entry) => entry.outline.lessons.some((lesson) => !lesson.accessible));
    body = (
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground md:text-3xl">
              <GraduationCap className="h-7 w-7 text-gold-dark dark:text-accent" aria-hidden="true" />
              Cursos
            </h1>
            <p className="mt-1 text-muted-foreground">Escolha um curso para ver os módulos, a sua trilha e continuar de onde parou.</p>
          </div>
          {anyLocked && (
            <Button asChild variant="cta">
              <Link to="/pricing">
                <Sparkles aria-hidden="true" />
                Desbloquear tudo
              </Link>
            </Button>
          )}
        </header>

        {entries.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="Nenhum curso disponível"
            description="Novos cursos aparecem aqui assim que forem publicados."
          />
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <li key={entry.course.id}>
                <CourseCard entry={entry} completed={completed.data ?? new Set<string>()} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <MembersLayout>
      <Helmet>
        <title>Cursos | Método IA Real</title>
        <meta name="description" content="Todos os cursos disponíveis na sua área de membros." />
      </Helmet>
      {body}
    </MembersLayout>
  );
}

function CourseCard({ entry, completed }: { entry: CourseEntry; completed: ReadonlySet<string> }) {
  const { course, outline } = entry;
  const progress = summarizeProgress(outline.lessons, completed);
  const accessible = outline.lessons.filter((lesson) => lesson.accessible).length;
  const locked = outline.lessons.length > 0 && accessible === 0;
  const partial = accessible > 0 && accessible < outline.lessons.length;
  const modules = curriculumModules(outline.modules).length;
  const duration = progress.minutes > 0 ? formatMinutes(progress.minutes) : course.estimated_hours ? `${course.estimated_hours}h` : null;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-colors hover:border-accent/40">
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm" aria-hidden="true">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {course.is_free && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">Grátis</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {course.difficulty && (
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              {DIFFICULTY_LABELS[course.difficulty] ?? course.difficulty}
            </span>
          )}
          {modules > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" aria-hidden="true" />
              {modules} módulos
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {duration}
            </span>
          )}
        </p>

        <h2 className="line-clamp-2 font-display font-bold text-foreground">
          <Link
            to={`/membros/cursos/${course.slug}`}
            className="rounded-sm after:absolute after:inset-0 after:rounded-2xl hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {course.title}
          </Link>
        </h2>
        {course.description && <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>}

        <div className="mt-auto space-y-2 pt-2">
          {progress.total > 0 && !locked && (
            <>
              <p className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progress.completed}/{progress.total} aulas</span>
                <span className="font-semibold text-foreground">{progress.percent}%</span>
              </p>
              <ProgressBar value={progress.percent} label={`Progresso em ${course.title}`} className="h-1.5" />
            </>
          )}
          {locked && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Disponível nos planos pagos
            </p>
          )}
          {partial && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Amostra grátis: {accessible} de {outline.lessons.length} aulas liberadas
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
