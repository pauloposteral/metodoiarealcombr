import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Play, Route as RouteIcon } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { PageError, PageLoading } from '@/components/members/PageStates';
import { TrailQuiz } from '@/components/members/TrailQuiz';
import { TrackPicker } from '@/components/members/TrackPicker';
import { TrackModuleList, TrackRecommendation } from '@/components/members/TrackRecommendation';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useCompletedLessons, useCourseCatalog, type CourseEntry } from '@/hooks/useCourseOutline';
import { useLearningTrack, useSaveLearningTrack } from '@/hooks/useLearningTrack';
import { TRACKS, findResumeLesson, type TrackKey } from '@/lib/curriculum';
import type { TrailQuizResult } from '@/lib/trailQuiz';

export default function MembersTrail() {
  const track = useLearningTrack();
  const saveTrack = useSaveLearningTrack();
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();
  const [result, setResult] = useState<TrailQuizResult | null>(null);
  const [submissions, setSubmissions] = useState(0);
  const [quizKey, setQuizKey] = useState(0);

  const main = catalog.data?.main ?? null;
  // Module titles come from the course; the quiz still works (codes only) if it fails to load.
  const titles = useMemo(
    () => new Map((main?.outline.modules ?? []).flatMap((module) => (module.code ? [[module.code, module.displayTitle] as const] : []))),
    [main],
  );

  const choose = (next: TrackKey) => {
    saveTrack.mutate(next, {
      onSuccess: () => toast({ title: 'Trilha salva', description: `${TRACKS[next].label}. Você pode trocar quando quiser.` }),
      onError: () => toast({ title: 'Não foi possível salvar a trilha', description: 'Tente de novo em instantes.', variant: 'destructive' }),
    });
  };

  const handleResult = (next: TrailQuizResult) => {
    setResult(next);
    setSubmissions((count) => count + 1);
  };

  const retake = () => {
    setResult(null);
    setQuizKey((key) => key + 1);
    document.getElementById('trail-quiz-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let body;
  if (track.isPending) {
    body = <PageLoading label="Carregando sua trilha…" />;
  } else if (track.isError) {
    body = <PageError title="Não foi possível carregar a sua trilha" onRetry={() => void track.refetch()} />;
  } else {
    const current = track.data ?? null;
    body = (
      <div className="mx-auto max-w-4xl space-y-10">
        <header>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <RouteIcon className="h-4 w-4" aria-hidden="true" />
            Minha trilha
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">Descubra a sua trilha</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            São 5 perguntas, cerca de 2 minutos. A trilha organiza o curso para o seu objetivo: você estuda primeiro o que faz diferença
            para você, e os outros módulos continuam abertos como extras.
          </p>
        </header>

        {current && (
          <CurrentTrack track={current} titles={titles} main={main} completed={completed.data ?? null} />
        )}

        <section aria-labelledby="trail-quiz-title" className="scroll-mt-24 space-y-4">
          <div>
            <h2 id="trail-quiz-title" className="font-display text-xl font-bold text-foreground">
              {current ? 'Refazer o quiz da trilha' : 'Quiz da trilha'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha a opção mais próxima da sua realidade em cada pergunta.</p>
          </div>
          <TrailQuiz key={quizKey} onResult={handleResult} />
        </section>

        {result && (
          <TrackRecommendation
            key={submissions}
            result={result}
            currentTrack={current}
            titles={titles}
            saving={saveTrack.isPending}
            onSave={choose}
            onRetake={retake}
          />
        )}

        <section aria-labelledby="trail-picker-title" className="space-y-4">
          <div>
            <h2 id="trail-picker-title" className="font-display text-xl font-bold text-foreground">Prefere escolher você mesmo?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Todas as trilhas terminam no MOD-12, com o portfólio e o projeto final do certificado.</p>
          </div>
          <TrackPicker currentTrack={current} saving={saveTrack.isPending} onChoose={choose} />
        </section>
      </div>
    );
  }

  return (
    <MembersLayout>
      <Helmet>
        <title>Minha trilha | Método IA Real</title>
      </Helmet>
      {body}
    </MembersLayout>
  );
}

interface CurrentTrackProps {
  track: TrackKey;
  titles: ReadonlyMap<string, string>;
  main: CourseEntry | null;
  completed: ReadonlySet<string> | null;
}

function CurrentTrack({ track, titles, main, completed }: CurrentTrackProps) {
  const definition = TRACKS[track];
  const resume = main && completed ? findResumeLesson(main.outline, track, completed) : null;
  return (
    <section aria-labelledby="current-track-title" className="rounded-2xl border border-accent/50 bg-accent/5 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sua trilha atual</p>
      <h2 id="current-track-title" className="mt-1 font-display text-xl font-bold text-foreground">{definition.label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {definition.hoursLabel} · {definition.moduleCodes.length} módulos
      </p>
      <div className="mt-4">
        <TrackModuleList track={track} titles={titles} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {resume && (
          <Button asChild variant="cta">
            <Link to={`/membros/aula/${resume.id}`}>
              <Play aria-hidden="true" />
              Continuar a trilha
            </Link>
          </Button>
        )}
        {main && (
          <Button asChild variant="outline">
            <Link to={`/membros/cursos/${main.course.slug}`}>
              Ver os módulos no curso
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
