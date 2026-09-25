import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Award, BookOpen, Clock, GraduationCap, Layers, Play, Route as RouteIcon, Sparkles } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { EmptyState, PageError, PageLoading } from '@/components/members/PageStates';
import { TrackInviteCard } from '@/components/members/TrackInviteCard';
import { ModuleOutlineCard } from '@/components/course/ModuleOutlineCard';
import { ProgressBar } from '@/components/course/ProgressBar';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCompletedLessons, useCourseCatalog, type CourseEntry } from '@/hooks/useCourseOutline';
import { useLearningTrack } from '@/hooks/useLearningTrack';
import {
  TRACKS,
  findResumeLesson,
  formatMinutes,
  lessonsForTrack,
  modulesForTrack,
  summarizeProgress,
  type TrackKey,
} from '@/lib/curriculum';

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

type ModuleView = 'track' | 'full';

/** Long CTA labels wrap instead of overflowing a 390px screen. */
const WRAPPING_CTA = 'h-auto min-h-12 whitespace-normal py-3 text-center';

export default function CourseOverview() {
  const { slug } = useParams<{ slug: string }>();
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();
  const track = useLearningTrack();
  const entry = catalog.data?.entries.find((candidate) => candidate.course.slug === slug) ?? null;

  let body;
  if (catalog.isPending || completed.isPending || track.isPending) {
    body = <PageLoading label="Carregando curso…" />;
  } else if (catalog.isError || completed.isError || track.isError) {
    body = (
      <PageError
        title="Não foi possível carregar o curso"
        onRetry={() => {
          void catalog.refetch();
          void completed.refetch();
          void track.refetch();
        }}
      />
    );
  } else if (!entry) {
    body = (
      <EmptyState
        icon={<GraduationCap className="h-12 w-12" />}
        title="Curso não encontrado"
        description="Ele pode ter sido renomeado ou ainda não foi publicado."
        action={
          <Button asChild variant="outline">
            <Link to="/membros/cursos">Ver todos os cursos</Link>
          </Button>
        }
        className="mx-auto max-w-xl"
      />
    );
  } else {
    body = <CourseOverviewView entry={entry} completed={completed.data ?? new Set<string>()} track={track.data ?? null} />;
  }

  return <MembersLayout>{body}</MembersLayout>;
}

interface CourseOverviewViewProps {
  entry: CourseEntry;
  completed: ReadonlySet<string>;
  track: TrackKey | null;
}

function CourseOverviewView({ entry, completed, track }: CourseOverviewViewProps) {
  const { course, outline } = entry;
  const [view, setView] = useState<ModuleView>('track');

  const trackModules = modulesForTrack(outline, track);
  const trackModuleIds = new Set(trackModules.map((module) => module.id));
  // The toggle only makes sense when the track is a real subset of the course.
  const hasTrackSubset = track !== null && track !== 'completa' && trackModules.length > 0 && trackModules.length < outline.modules.length;
  const activeView: ModuleView = hasTrackSubset ? view : 'full';
  const modules = activeView === 'track' ? trackModules : outline.modules;
  const visibleLessons = modules.flatMap((module) => module.lessons);
  const visibleMinutes = visibleLessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  const trackProgress = summarizeProgress(lessonsForTrack(outline, track), completed);
  const courseMinutes = outline.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const resume = findResumeLesson(outline, track, completed);
  const hasLocked = outline.lessons.some((lesson) => !lesson.accessible);
  const started = outline.lessons.some((lesson) => completed.has(lesson.id));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Helmet>
        <title>{`${course.title} | Método IA Real`}</title>
        {course.description && <meta name="description" content={course.description} />}
      </Helmet>

      <Button asChild variant="ghost" className="-ml-2 text-muted-foreground hover:text-foreground">
        <Link to="/membros/cursos">
          <ArrowLeft aria-hidden="true" />
          Todos os cursos
        </Link>
      </Button>

      <section aria-labelledby="course-title" className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        {course.thumbnail_url && (
          <div className="relative aspect-[3/1] overflow-hidden">
            <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        )}
        <div className="space-y-5 p-5 sm:p-6 md:p-8">
          <ul role="list" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {course.difficulty && (
              <li className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {DIFFICULTY_LABELS[course.difficulty] ?? course.difficulty}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" aria-hidden="true" />
              {outline.modules.length} módulos
            </li>
            <li className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {outline.lessons.length} aulas
            </li>
            {courseMinutes > 0 && (
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {formatMinutes(courseMinutes)} de conteúdo
              </li>
            )}
          </ul>

          <div>
            <h1 id="course-title" className="font-display text-2xl font-bold text-foreground md:text-3xl">{course.title}</h1>
            {course.description && <p className="mt-2 leading-relaxed text-muted-foreground">{course.description}</p>}
          </div>

          {track ? (
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm">
                <RouteIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-accent" aria-hidden="true" />
                <span>
                  <span className="text-muted-foreground">Sua trilha: </span>
                  <span className="font-semibold text-foreground">{TRACKS[track].label}</span>
                  <span className="text-muted-foreground"> · {TRACKS[track].hoursLabel} · {trackModules.length || outline.modules.length} módulos</span>
                </span>
              </p>
              <Link
                to="/membros/trilha"
                className="shrink-0 rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Trocar trilha
              </Link>
            </div>
          ) : (
            <TrackInviteCard />
          )}

          {trackProgress.total > 0 && (
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {trackProgress.completed} de {trackProgress.total} aulas {track && track !== 'completa' ? 'da sua trilha ' : ''}concluídas
                </span>
                <span className="font-bold text-foreground">{trackProgress.percent}%</span>
              </div>
              <ProgressBar value={trackProgress.percent} label="Progresso no curso" />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {resume ? (
              <Button asChild variant="cta" size="lg" className={WRAPPING_CTA}>
                <Link to={`/membros/aula/${resume.id}`}>
                  <Play aria-hidden="true" />
                  {started ? 'Continuar de onde parei' : 'Começar o curso'}
                </Link>
              </Button>
            ) : !hasLocked && outline.lessons.length > 0 ? (
              <Button asChild variant="cta" size="lg" className={WRAPPING_CTA}>
                <Link to="/membros/certificado">
                  <Award aria-hidden="true" />
                  Ver certificado
                </Link>
              </Button>
            ) : null}
            {hasLocked && (
              <Button asChild variant={resume ? 'outline' : 'cta'} size="lg" className={WRAPPING_CTA}>
                <Link to="/pricing">
                  <Sparkles aria-hidden="true" />
                  Desbloquear o curso completo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="course-content-title" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="course-content-title" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
              <BookOpen className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
              Conteúdo do curso
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modules.length} módulos · {visibleLessons.length} aulas{visibleMinutes > 0 ? ` · ${formatMinutes(visibleMinutes)}` : ''}
            </p>
          </div>
          {hasTrackSubset && (
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => {
                if (value === 'track' || value === 'full') setView(value);
              }}
              aria-label="Módulos exibidos"
              className="justify-start rounded-lg border border-border/60 bg-card p-1"
            >
              <ToggleGroupItem value="track" size="sm" className="px-3">
                Minha trilha ({trackModules.length})
              </ToggleGroupItem>
              <ToggleGroupItem value="full" size="sm" className="px-3">
                Formação completa ({outline.modules.length})
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        {modules.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-12 w-12" />}
            title="Nenhum módulo publicado ainda"
            description="Os módulos aparecem aqui assim que forem liberados."
          />
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <ModuleOutlineCard
                key={module.id}
                module={module}
                completed={completed}
                isExtra={hasTrackSubset && !trackModuleIds.has(module.id)}
                resumeLessonId={resume?.id ?? null}
                defaultOpen={module.id === resume?.module_id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
