import { useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, RotateCcw, Save } from 'lucide-react';
import { ModuleCodeBadge } from '@/components/course/ModuleBadges';
import { Button } from '@/components/ui/button';
import { TRACKS, formatMinutes, type TrackKey } from '@/lib/curriculum';
import { joinReasons, type TrailQuizResult } from '@/lib/trailQuiz';

/** Modules of a track (codes from TRACKS, titles from the course when available). */
export function TrackModuleList({ track, titles }: { track: TrackKey; titles: ReadonlyMap<string, string> }) {
  const definition = TRACKS[track];
  return (
    <ol role="list" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {definition.moduleCodes.map((code) => (
        <li key={code} className="flex min-w-0 items-center gap-2 text-sm text-foreground">
          <ModuleCodeBadge code={code} />
          <span className="min-w-0">{titles.get(code) ?? 'Módulo'}</span>
          {definition.highlightCodes.includes(code) && track !== 'completa' && (
            <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-foreground">destaque</span>
          )}
        </li>
      ))}
    </ol>
  );
}

interface TrackRecommendationProps {
  result: TrailQuizResult;
  currentTrack: TrackKey | null;
  titles: ReadonlyMap<string, string>;
  saving: boolean;
  onSave: (track: TrackKey) => void;
  onRetake: () => void;
}

export function TrackRecommendation({ result, currentTrack, titles, saving, onSave, onRetake }: TrackRecommendationProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const definition = TRACKS[result.track];
  const isCurrent = currentTrack === result.track;

  // Move focus to the result so keyboard and screen reader users land on it after submitting.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby="trail-result-title" className="rounded-2xl border-2 border-accent bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trilha recomendada para você</p>
      <h2 id="trail-result-title" ref={headingRef} tabIndex={-1} className="mt-1 rounded-sm font-display text-2xl font-bold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {definition.label}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {definition.hoursLabel} · {definition.moduleCodes.length} módulos
        {result.estimatedWeeks && result.weeklyHours
          ? ` · cerca de ${result.estimatedWeeks} semanas estudando ${formatMinutes(Math.round(result.weeklyHours * 60))} por semana`
          : ''}
      </p>
      <p className="mt-3 text-foreground/85">{definition.description}</p>
      {result.reasons.length > 0 && (
        <p className="mt-3 text-sm text-foreground/85">
          <span className="font-semibold text-foreground">Por que esta trilha: </span>
          {joinReasons(result.reasons)}.
        </p>
      )}
      {result.track !== 'completa' && (
        <p className="mt-2 text-sm text-muted-foreground">Os outros módulos continuam abertos como extras, e dá para trocar de trilha quando quiser.</p>
      )}

      <h3 className="mb-3 mt-5 text-sm font-semibold text-foreground">Módulos da trilha</h3>
      <TrackModuleList track={result.track} titles={titles} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {isCurrent ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Esta já é a sua trilha
          </p>
        ) : (
          <Button type="button" variant="cta" disabled={saving} onClick={() => onSave(result.track)}>
            {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            Salvar como minha trilha
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onRetake}>
          <RotateCcw aria-hidden="true" />
          Refazer o quiz
        </Button>
      </div>
    </section>
  );
}
