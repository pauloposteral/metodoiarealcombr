import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, BarChart3, BookOpen, CheckCircle2, Clock, Flame, GraduationCap,
  MessageSquare, Sparkles, Star, Target, Trophy, Zap,
} from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { PageError, PageLoading } from '@/components/members/PageStates';
import { CertificateTeaser } from '@/components/members/CertificateTeaser';
import { ContinueLearningCard } from '@/components/members/ContinueLearningCard';
import { TrackInviteCard } from '@/components/members/TrackInviteCard';
import { TrackProgressCard } from '@/components/members/TrackProgressCard';
import { ModuleSummary } from '@/components/course/ModuleSummary';
import { ProgressBar } from '@/components/course/ProgressBar';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCompletedLessons, useCourseCatalog, type CourseCatalog } from '@/hooks/useCourseOutline';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { useGamification } from '@/hooks/useGamification';
import { useLearningTrack } from '@/hooks/useLearningTrack';
import { useStreak } from '@/hooks/useStreak';
import {
  curriculumModules,
  findResumeLesson,
  lessonsForTrack,
  modulesForTrack,
  summarizeProgress,
  type TrackKey,
} from '@/lib/curriculum';

const MembersDashboard = () => {
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();
  const track = useLearningTrack();

  let body;
  if (catalog.isPending || completed.isPending || track.isPending) {
    body = <PageLoading label="Carregando seu painel…" className="max-w-6xl" />;
  } else if (catalog.isError || completed.isError || track.isError) {
    body = (
      <PageError
        title="Não foi possível carregar seu painel"
        onRetry={() => {
          void catalog.refetch();
          void completed.refetch();
          void track.refetch();
        }}
      />
    );
  } else {
    body = <DashboardView catalog={catalog.data} completed={completed.data ?? new Set<string>()} track={track.data ?? null} />;
  }

  return (
    <MembersLayout>
      <Helmet>
        <title>Início | Método IA Real</title>
      </Helmet>
      {body}
    </MembersLayout>
  );
};

interface DashboardViewProps {
  catalog: CourseCatalog;
  completed: ReadonlySet<string>;
  track: TrackKey | null;
}

function DashboardView({ catalog, completed, track }: DashboardViewProps) {
  const { data: user } = useAuthUser();
  const activity = useDashboardActivity();
  const { userPoints, userRank, getLevelTitle } = useGamification(user?.id);
  const { streak } = useStreak(user?.id);

  const main = catalog.main;
  const outline = main?.outline ?? null;
  const resume = outline ? findResumeLesson(outline, track, completed) : null;
  const resumeModule = resume && outline ? outline.modules.find((module) => module.id === resume.module_id) ?? null : null;
  const trackLessons = outline ? lessonsForTrack(outline, track) : [];
  const trackProgress = summarizeProgress(trackLessons, completed);
  const remainingMinutes = trackLessons.filter((lesson) => !completed.has(lesson.id)).reduce((sum, lesson) => sum + lesson.minutes, 0);
  const courseProgress = summarizeProgress(outline?.lessons ?? [], completed);
  const started = (outline?.lessons ?? []).some((lesson) => completed.has(lesson.id));
  const hasLocked = (outline?.lessons ?? []).some((lesson) => !lesson.accessible);
  const trackModules = outline ? modulesForTrack(outline, track) : [];
  const modules = outline ? curriculumModules(trackModules.length > 0 ? trackModules : outline.modules).slice(0, 6) : [];
  const displayName = activity.data?.fullName ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'aluno';
  const level = userPoints?.level ?? 1;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section aria-labelledby="dashboard-title" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-[1fr_minmax(0,24rem)] md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Área de membros
            </p>
            <h1 id="dashboard-title" className="mt-2 font-display text-2xl font-bold md:text-3xl">Olá, {displayName}!</h1>
            <p className="mt-2 max-w-xl text-white/75">
              {track ? 'Siga a sua trilha: uma aula curta por vez, com um resultado prático em cada uma.' : 'Escolha a sua trilha e comece pelo que faz diferença para você.'}
            </p>
          </div>
          {resume ? (
            <ContinueLearningCard lesson={resume} module={resumeModule} started={started} />
          ) : outline && outline.lessons.length > 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="font-display font-bold">
                {hasLocked ? 'Você concluiu todas as aulas liberadas.' : 'Você concluiu todas as aulas!'}
              </p>
              <Button asChild variant="cta" className="mt-4 h-auto min-h-10 whitespace-normal py-2.5 text-center">
                <Link to={hasLocked ? '/pricing' : '/membros/certificado'}>
                  {hasLocked ? 'Desbloquear o curso completo' : 'Ver certificado'}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {track ? (
          <TrackProgressCard track={track} progress={trackProgress} remainingMinutes={remainingMinutes} courseSlug={main?.course.slug ?? null} />
        ) : (
          <TrackInviteCard />
        )}
        <CertificateTeaser />
      </div>

      <ul role="list" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={<Target className="h-5 w-5" />} value={`${courseProgress.percent}%`} label="Progresso no curso" />
        <StatTile icon={<CheckCircle2 className="h-5 w-5" />} value={`${courseProgress.completed}/${courseProgress.total}`} label="Aulas concluídas" />
        <StatTile icon={<Zap className="h-5 w-5" />} value={String(userPoints?.points ?? 0)} label={`Nível ${level} · ${getLevelTitle(level)}`} />
        <StatTile icon={<Flame className="h-5 w-5 text-orange-500" />} value={String(streak.current_streak)} label={streak.current_streak === 1 ? 'dia seguido' : 'dias seguidos'} />
      </ul>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section aria-labelledby="recent-title" className="rounded-2xl border border-border/50 bg-card p-5 md:col-span-2">
          <h2 id="recent-title" className="mb-4 flex items-center gap-2 font-display font-bold text-foreground">
            <Clock className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
            Atividade recente
          </h2>
          {activity.isPending ? (
            <div className="space-y-3" role="status" aria-label="Carregando atividade">
              {[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : activity.isError ? (
            <p className="text-sm text-muted-foreground">Não foi possível carregar sua atividade agora.</p>
          ) : activity.data && activity.data.recentLessons.length > 0 ? (
            <ul role="list" className="space-y-1">
              {activity.data.recentLessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    to={`/membros/aula/${lesson.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10" aria-hidden="true">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{lesson.title}</span>
                      {lesson.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          Concluída em {new Date(lesson.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma aula concluída ainda. A primeira fica a um clique!</p>
          )}
        </section>

        <nav aria-label="Atalhos" className="space-y-3">
          <QuickLink to="/membros/analytics" icon={<BarChart3 className="h-5 w-5" />} title="Meu progresso" description="Gráficos e tempo de estudo" />
          <QuickLink
            to="/membros/ranking"
            icon={<Star className="h-5 w-5" />}
            title="Ranking"
            description={`#${userRank ?? '—'} · ${activity.data?.achievements ?? 0} conquistas`}
          />
          <QuickLink to="/membros/comunidade" icon={<MessageSquare className="h-5 w-5" />} title="Comunidade" description="Tire dúvidas e mostre seus projetos" />
          <QuickLink to="/membros/prompts" icon={<Sparkles className="h-5 w-5" />} title="Biblioteca de prompts" description="Todos os prompts das aulas liberadas" />
        </nav>
      </div>

      {modules.length > 0 && (
        <section aria-labelledby="modules-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="modules-title" className="font-display text-xl font-bold text-foreground">
              {track && track !== 'completa' ? 'Módulos da sua trilha' : 'Módulos'}
            </h2>
            <Link
              to="/membros/modulos"
              className="flex items-center gap-1 rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <li key={module.id} className="overflow-hidden rounded-2xl border border-border/50 bg-card transition-colors hover:border-accent/40">
                <ModuleSummary module={module} completed={completed} showProject={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {catalog.entries.length > 1 && <CoursesSection catalog={catalog} completed={completed} />}
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <li className="rounded-xl border border-border/50 bg-card p-4 text-center">
      <span className="mx-auto mb-2 flex justify-center text-gold-dark dark:text-accent" aria-hidden="true">{icon}</span>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </li>
  );
}

function QuickLink({ to, icon, title, description }: { to: string; icon: ReactNode; title: string; description: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-accent/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="shrink-0 text-gold-dark dark:text-accent" aria-hidden="true">{icon}</span>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

function CoursesSection({ catalog, completed }: { catalog: CourseCatalog; completed: ReadonlySet<string> }) {
  return (
    <section aria-labelledby="courses-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="courses-title" className="font-display text-xl font-bold text-foreground">Meus cursos</h2>
        <Link
          to="/membros/cursos"
          className="flex items-center gap-1 rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.entries.map(({ course, outline }) => {
          const progress = summarizeProgress(outline.lessons, completed);
          const done = progress.total > 0 && progress.completed === progress.total;
          return (
            <li key={course.id}>
              <Link
                to={`/membros/cursos/${course.slug}`}
                className="block h-full rounded-2xl border border-border/50 bg-card p-5 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mb-3 flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-foreground" aria-hidden="true">
                    {done ? <Trophy className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </span>
                  <span className="text-xs font-bold text-foreground">{progress.percent}%</span>
                </span>
                <span className="mb-2 line-clamp-2 block font-display font-bold text-foreground">{course.title}</span>
                <ProgressBar value={progress.percent} label={`Progresso em ${course.title}`} className="mb-2 h-1.5" />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  {progress.completed}/{progress.total} aulas
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default MembersDashboard;
