import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, Layers, Play, Sparkles, Trophy } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { EmptyState, PageError, PageLoading } from '@/components/members/PageStates';
import { LessonList } from '@/components/course/LessonList';
import { MarkdownRenderer } from '@/components/course/MarkdownRenderer';
import { ModuleCodeBadge, StarModuleBadge } from '@/components/course/ModuleBadges';
import { ProgressBar } from '@/components/course/ProgressBar';
import { Button } from '@/components/ui/button';
import { useCompletedLessons, useModuleContext, useModuleIntro, type ModuleContext } from '@/hooks/useCourseOutline';
import { useLearningTrack } from '@/hooks/useLearningTrack';
import {
  TRACKS,
  formatMinutes,
  isModuleInTrack,
  moduleProjectLesson,
  moduleTrails,
  summarizeProgress,
  type OutlineModule,
  type TrackKey,
} from '@/lib/curriculum';
import { cn } from '@/lib/utils';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const context = useModuleContext(moduleId);
  const completed = useCompletedLessons();
  const track = useLearningTrack();
  const intro = useModuleIntro(moduleId);

  let body;
  if (context.isPending || completed.isPending || track.isPending) {
    body = <PageLoading label="Carregando módulo…" />;
  } else if (context.isError || completed.isError || track.isError) {
    body = (
      <PageError
        title="Não foi possível carregar o módulo"
        onRetry={() => {
          context.refetch();
          void completed.refetch();
          void track.refetch();
        }}
      />
    );
  } else if (!context.data) {
    body = (
      <EmptyState
        icon={<Layers className="h-12 w-12" />}
        title="Módulo não encontrado"
        description="O link pode estar desatualizado ou o módulo ainda não foi publicado."
        action={
          <Button asChild variant="outline">
            <Link to="/membros/modulos">Ver todos os módulos</Link>
          </Button>
        }
        className="mx-auto max-w-xl"
      />
    );
  } else {
    body = (
      <ModuleDetailView
        context={context.data}
        completed={completed.data ?? new Set<string>()}
        track={track.data ?? null}
        intro={intro.data ?? null}
      />
    );
  }

  return <MembersLayout>{body}</MembersLayout>;
};

interface ModuleDetailViewProps {
  context: ModuleContext;
  completed: ReadonlySet<string>;
  track: TrackKey | null;
  intro: string | null;
}

function ModuleDetailView({ context, completed, track, intro }: ModuleDetailViewProps) {
  const { module, course, outline } = context;
  const progress = summarizeProgress(module.lessons, completed);
  const resume = module.lessons.find((lesson) => lesson.accessible && !completed.has(lesson.id)) ?? null;
  const allLocked = module.lessons.length > 0 && module.lessons.every((lesson) => !lesson.accessible);
  const project = moduleProjectLesson(module);
  const trails = moduleTrails(module);
  const isExtra = track !== null && track !== 'completa' && !isModuleInTrack(module, track);
  const index = outline.modules.findIndex((candidate) => candidate.id === module.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Helmet>
        <title>{`${module.code ? `${module.code} · ` : ''}${module.displayTitle} | Método IA Real`}</title>
      </Helmet>

      <Button asChild variant="ghost" className="-ml-2 text-muted-foreground hover:text-foreground">
        <Link to={course ? `/membros/cursos/${course.slug}` : '/membros/modulos'}>
          <ArrowLeft aria-hidden="true" />
          {course ? course.title : 'Todos os módulos'}
        </Link>
      </Button>

      <section aria-labelledby="module-title" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <ModuleCodeBadge code={module.code} className="bg-white text-navy" />
          {module.is_star && <StarModuleBadge />}
          {isExtra && (
            <span className="rounded-full border border-white/40 px-2 py-0.5 text-xs font-medium text-white/90">Extra para a sua trilha</span>
          )}
        </div>
        <h1 id="module-title" className="mt-3 font-display text-2xl font-bold md:text-3xl">{module.displayTitle}</h1>
        {module.description && <p className="mt-2 text-white/80">{module.description}</p>}

        <ul role="list" className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {module.hours_label ?? formatMinutes(progress.minutes)}
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {module.lessons.length} {module.lessons.length === 1 ? 'aula' : 'aulas'}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {progress.percent}% concluído
          </li>
        </ul>
        <ProgressBar value={progress.percent} label="Progresso do módulo" className="mt-4 bg-white/20" />

        {trails.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Faz parte das trilhas</p>
            <ul role="list" className="mt-2 flex flex-wrap gap-2">
              {trails.map((trail) => (
                <li
                  key={trail}
                  className={cn('rounded-full px-3 py-1 text-xs font-medium', trail === track ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white')}
                >
                  {TRACKS[trail].label}
                  {trail === track && <span className="sr-only"> (sua trilha)</span>}
                </li>
              ))}
              <li className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{TRACKS.completa.label}</li>
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {resume ? (
            <Button asChild variant="cta" size="lg">
              <Link to={`/membros/aula/${resume.id}`}>
                <Play aria-hidden="true" />
                {progress.completed > 0 ? 'Continuar o módulo' : 'Começar o módulo'}
              </Link>
            </Button>
          ) : allLocked ? (
            <Button asChild variant="cta" size="lg">
              <Link to="/pricing">
                <Sparkles aria-hidden="true" />
                Desbloquear este módulo
              </Link>
            </Button>
          ) : progress.total > 0 && progress.completed === progress.total ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Módulo concluído
            </p>
          ) : null}
        </div>
      </section>

      {intro && (
        <section aria-labelledby="module-intro-title" className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 md:p-8">
          <h2 id="module-intro-title" className="font-display text-lg font-bold text-foreground">Sobre este módulo</h2>
          <MarkdownRenderer content={intro} size="base" className="mt-3" />
        </section>
      )}

      {module.project_title && (
        <section aria-labelledby="module-project-title" className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Trophy className="h-4 w-4 text-gold-dark dark:text-accent" aria-hidden="true" />
            Projeto do módulo
          </p>
          <h2 id="module-project-title" className="mt-2 font-display text-lg font-bold text-foreground">{module.project_title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">A última aula do módulo guia o projeto e tem o campo para entregar o link do resultado.</p>
          {project && (
            <Button asChild variant="outline" className="mt-4">
              <Link to={`/membros/aula/${project.id}`}>
                {completed.has(project.id) ? 'Rever o projeto' : 'Ver o projeto'}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </section>
      )}

      <section aria-labelledby="module-lessons-title">
        <h2 id="module-lessons-title" className="mb-3 font-display text-lg font-bold text-foreground">Aulas do módulo</h2>
        {module.lessons.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-12 w-12" />} title="As aulas deste módulo estão a caminho" description="Elas aparecem aqui assim que forem publicadas." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <LessonList lessons={module.lessons} completed={completed} resumeLessonId={resume?.id ?? null} showDescription />
          </div>
        )}
      </section>

      <ModuleSiblings previous={outline.modules[index - 1] ?? null} next={outline.modules[index + 1] ?? null} />
    </div>
  );
}

function ModuleSiblings({ previous, next }: { previous: OutlineModule | null; next: OutlineModule | null }) {
  if (!previous && !next) return null;
  const label = (module: OutlineModule) => `${module.code ? `${module.code} · ` : ''}${module.displayTitle}`;
  const linkClass =
    'flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  return (
    <nav aria-label="Outros módulos" className="grid grid-cols-1 gap-3 border-t border-border/50 pt-6 sm:grid-cols-2">
      {previous ? (
        <Link to={`/membros/modulos/${previous.id}`} className={linkClass}>
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Módulo anterior</span>
            <span className="line-clamp-2 text-sm font-medium text-foreground">{label(previous)}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}
      {next && (
        <Link to={`/membros/modulos/${next.id}`} className={cn(linkClass, 'justify-between text-right sm:col-start-2')}>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">Próximo módulo</span>
            <span className="line-clamp-2 text-sm font-medium text-foreground">{label(next)}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

export default ModuleDetail;
