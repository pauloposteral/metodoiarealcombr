import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { PageError, PageLoading, EmptyState } from '@/components/members/PageStates';
import { LessonComments } from '@/components/community/LessonComments';
import { AISandbox } from '@/components/course/AISandbox';
import { BookmarkButton } from '@/components/course/BookmarkButton';
import { CompleteLessonButton } from '@/components/course/CompleteLessonButton';
import { LessonHeader } from '@/components/course/LessonHeader';
import { LessonNavigation } from '@/components/course/LessonNavigation';
import { LessonNotes } from '@/components/course/LessonNotes';
import { LessonPrompts } from '@/components/course/LessonPrompts';
import { LessonVideo } from '@/components/course/LessonVideo';
import { LockedLesson } from '@/components/course/LockedLesson';
import { MarkdownRenderer } from '@/components/course/MarkdownRenderer';
import { ProjectBanner, ProjectSubmission } from '@/components/course/ProjectSubmission';
import { QuizPlayer } from '@/components/course/QuizPlayer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCompletedLessons, useLessonContext, type LessonContext } from '@/hooks/useCourseOutline';
import { useCompleteLesson, useLesson, useProjectSubmission, type LessonRow } from '@/hooks/useLessonData';
import { useLessonTimeTracker } from '@/hooks/useLessonTimeTracker';
import { lessonNavigation, type LessonNavigation as LessonNavigationState } from '@/lib/curriculum';

const NO_NAVIGATION: LessonNavigationState = { previous: null, next: null, nextModule: null, isLastLesson: false };
const AUTO_ADVANCE_MS = 800;

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const lessonQuery = useLesson(lessonId);
  const lesson = lessonQuery.data ?? null;
  const context = useLessonContext(lessonId, lesson?.module_id ?? null);
  const completed = useCompletedLessons();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [lessonId]);

  let body;
  if (lessonQuery.isPending || context.isPending) {
    body = <PageLoading label="Carregando aula…" />;
  } else if (lessonQuery.isError || context.isError) {
    body = (
      <PageError
        title="Não foi possível abrir esta aula"
        onRetry={() => {
          void lessonQuery.refetch();
          context.refetch();
        }}
      />
    );
  } else if (!lesson && context.data) {
    // The outline lists the lesson but RLS returns no row: the learner's plan does not open it.
    const open = context.data.outline.lessons.filter((candidate) => candidate.accessible);
    const openLesson = open.find((candidate) => !completed.data?.has(candidate.id)) ?? open[0] ?? null;
    body = <LockedLesson context={context.data} openLesson={openLesson} />;
  } else if (!lesson) {
    body = (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="Aula não encontrada"
        description="O link pode estar desatualizado ou a aula foi removida do curso."
        action={
          <Button asChild variant="outline">
            <Link to="/membros/cursos">Ver cursos</Link>
          </Button>
        }
        className="mx-auto max-w-xl"
      />
    );
  } else {
    body = <LessonView key={lesson.id} lesson={lesson} context={context.data} />;
  }

  return <MembersLayout>{body}</MembersLayout>;
};

function LessonTimeTracker({ lessonId, userId }: { lessonId: string; userId: string }) {
  useLessonTimeTracker({ lessonId, userId });
  return null;
}

function LessonView({ lesson, context }: { lesson: LessonRow; context: LessonContext | null }) {
  const navigate = useNavigate();
  const { data: user } = useAuthUser();
  const completedQuery = useCompletedLessons();
  const completeLesson = useCompleteLesson();
  const isProject = lesson.type === 'project';
  const { submission, isLoading: submissionLoading } = useProjectSubmission(lesson.id, isProject);
  const [advanceTo, setAdvanceTo] = useState<string | null>(null);

  // Short pause so the "Aula concluída" toast is seen; leaving the page cancels it.
  useEffect(() => {
    if (!advanceTo) return;
    const timer = setTimeout(() => navigate(`/membros/aula/${advanceTo}`), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [advanceTo, navigate]);

  const module = context?.module ?? null;
  const navigation = context ? lessonNavigation(context.outline, lesson.id) : NO_NAVIGATION;
  const isCompleted = completedQuery.data?.has(lesson.id) ?? false;
  const isFinalProject = isProject && module?.code === 'MOD-12';
  const minutes = lesson.estimated_minutes ?? lesson.duration_minutes ?? context?.lesson.minutes ?? 0;

  const handleComplete = () => {
    completeLesson.mutate(lesson.id, {
      onSuccess: () => {
        const next = navigation.next;
        if (next?.accessible) {
          toast({ title: 'Aula concluída!', description: 'Seu progresso foi salvo. Indo para a próxima aula…' });
          setAdvanceTo(next.id);
        } else if (navigation.isLastLesson) {
          toast({ title: 'Você concluiu a última aula do curso!', description: 'Veja os requisitos do certificado.' });
        } else {
          toast({ title: 'Aula concluída!', description: 'Seu progresso foi salvo.' });
        }
      },
      onError: () =>
        toast({ title: 'Não foi possível salvar seu progresso', description: 'Verifique sua conexão e tente de novo.', variant: 'destructive' }),
    });
  };

  return (
    <article className="mx-auto max-w-4xl">
      <Helmet>
        <title>{`${lesson.title} | Método IA Real`}</title>
      </Helmet>
      {user && <LessonTimeTracker lessonId={lesson.id} userId={user.id} />}

      <LessonHeader
        course={context?.course ?? null}
        module={module}
        position={context?.position ?? null}
        total={context?.moduleLessonCount ?? null}
        minutes={minutes}
        completed={isCompleted}
        title={lesson.title}
        description={lesson.description}
        reviewedAt={lesson.reviewed_at}
        actions={<BookmarkButton lessonId={lesson.id} />}
      />

      {isProject && <ProjectBanner moduleCode={module?.code ?? null} projectTitle={module?.project_title ?? null} isFinalProject={isFinalProject} />}

      <LessonVideo url={lesson.video_url} title={lesson.title} />

      {lesson.content && (
        <div className="mb-8 rounded-2xl border border-border/50 bg-card p-5 sm:p-6 md:p-8">
          <MarkdownRenderer content={lesson.content} size="base" headingIds />
        </div>
      )}

      <LessonPrompts prompts={lesson.prompts} />

      {isProject && <ProjectSubmission lessonId={lesson.id} />}

      <LessonNotes lessonId={lesson.id} />
      <QuizPlayer lessonId={lesson.id} />
      <AISandbox lessonId={lesson.id} lessonTitle={lesson.title} prompts={lesson.prompts ?? undefined} />

      <div className="mb-8 flex justify-center">
        {isCompleted ? (
          <p className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Você já concluiu esta aula
          </p>
        ) : (
          <CompleteLessonButton
            pending={completeLesson.isPending || completedQuery.isPending}
            onComplete={handleComplete}
            confirmMissingProject={isProject && !submissionLoading && !submission}
            isFinalProject={isFinalProject}
            isLastLesson={navigation.isLastLesson}
          />
        )}
      </div>

      <LessonComments lessonId={lesson.id} />
      <LessonNavigation navigation={navigation} />
    </article>
  );
}

export default LessonPlayer;
