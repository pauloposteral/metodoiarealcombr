import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Layers } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { EmptyState, PageError, PageLoading } from '@/components/members/PageStates';
import { ModuleSummary } from '@/components/course/ModuleSummary';
import { useCompletedLessons, useCourseCatalog, type CourseCatalog } from '@/hooks/useCourseOutline';
import { useLearningTrack } from '@/hooks/useLearningTrack';
import { TRACKS, curriculumModules, formatMinutes, isModuleInTrack, type OutlineModule, type TrackKey } from '@/lib/curriculum';

/** Curriculum modules (with a MOD-NN code) of every published course; all modules before the import. */
function listModules(catalog: CourseCatalog): OutlineModule[] {
  const entries = catalog.main ? [catalog.main, ...catalog.entries.filter((entry) => entry !== catalog.main)] : catalog.entries;
  const curriculum = curriculumModules(entries.flatMap((entry) => entry.outline.modules));
  // Coded modules follow order_index; the pre-import fallback keeps each course's own order.
  return curriculum.some((module) => module.code) ? [...curriculum].sort((a, b) => a.order_index - b.order_index) : curriculum;
}

const MembersModules = () => {
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();
  const track = useLearningTrack();

  let body;
  if (catalog.isPending || completed.isPending || track.isPending) {
    body = <PageLoading label="Carregando módulos…" className="max-w-5xl" />;
  } else if (catalog.isError || completed.isError || track.isError) {
    body = (
      <PageError
        title="Não foi possível carregar os módulos"
        onRetry={() => {
          void catalog.refetch();
          void completed.refetch();
          void track.refetch();
        }}
      />
    );
  } else {
    body = <ModulesView modules={listModules(catalog.data)} completed={completed.data ?? new Set<string>()} track={track.data ?? null} />;
  }

  return (
    <MembersLayout>
      <Helmet>
        <title>Módulos | Método IA Real</title>
      </Helmet>
      {body}
    </MembersLayout>
  );
};

function ModulesView({ modules, completed, track }: { modules: OutlineModule[]; completed: ReadonlySet<string>; track: TrackKey | null }) {
  const minutes = modules.reduce((sum, module) => sum + module.lessons.reduce((total, lesson) => total + lesson.minutes, 0), 0);
  const inTrack = modules.filter((module) => isModuleInTrack(module, track));
  const hasTrackSubset = track !== null && track !== 'completa' && inTrack.length > 0 && inTrack.length < modules.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Módulos do curso</h1>
        <p className="mt-1 text-muted-foreground">
          {modules.length} módulos{minutes > 0 ? ` · ${formatMinutes(minutes)} de conteúdo` : ''}
          {hasTrackSubset && ` · ${inTrack.length} na sua trilha ${TRACKS[track].shortLabel}`}
        </p>
        {track === null && (
          <p className="mt-2 text-sm text-muted-foreground">
            Não sabe por onde começar?{' '}
            <Link
              to="/membros/trilha"
              className="rounded-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Descubra a sua trilha
            </Link>
            .
          </p>
        )}
      </header>

      {modules.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-12 w-12" />}
          title="Nenhum módulo publicado ainda"
          description="Os módulos aparecem aqui assim que forem liberados."
          action={
            <Link to="/membros/cursos" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Ver cursos
            </Link>
          }
        />
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <li key={module.id} className="overflow-hidden rounded-2xl border border-border/50 bg-card transition-colors hover:border-accent/40">
              <ModuleSummary
                module={module}
                completed={completed}
                isExtra={hasTrackSubset && !isModuleInTrack(module, track)}
                headingLevel="h2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MembersModules;
