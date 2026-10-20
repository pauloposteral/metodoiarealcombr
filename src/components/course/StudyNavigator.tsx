import { useMemo, useState, type RefObject } from 'react';
import { BookOpen, Eye, ClipboardCheck, ListChecks, type LucideIcon } from 'lucide-react';
import { buildStudyOutline, type StudyKey, type StudyOptions, type StudyTarget } from '@/lib/studyOutline';

const icons: Record<StudyKey, LucideIcon> = { understand: BookOpen, see: Eye, practice: ClipboardCheck, review: ListChecks };
interface StudyNavigatorProps extends StudyOptions {
  content: string | null;
  articleRef: RefObject<HTMLElement>;
}

/** All targets stay mounted: navigating must not erase notes, a quiz answer or project drafts. */
export function StudyNavigator({ content, videoUrl, isProject, promptsCount, articleRef }: StudyNavigatorProps) {
  const steps = useMemo(() => buildStudyOutline(content, { videoUrl, isProject, promptsCount }), [content, videoUrl, isProject, promptsCount]);
  const [announcement, setAnnouncement] = useState('');
  if (steps.length < 2) return null;

  function move(target: StudyTarget, label: string) {
    const article = articleRef.current;
    if (!article) return;
    const body = article.querySelector<HTMLElement>('[data-study-content]');
    let element: HTMLElement | null = null;
    switch (target.kind) {
      case 'heading': element = Array.from(body?.querySelectorAll<HTMLElement>('h2[id],h3[id],h4[id]') ?? []).find(node => node.id === target.id) ?? null; break;
      case 'content': element = body; break;
      case 'code': element = body?.querySelector<HTMLElement>('.markdown-content > pre') ?? null; break;
      case 'table': element = body?.querySelector<HTMLElement>('.markdown-content > [data-markdown-kind="table"]') ?? null; break;
      case 'exercise': element = body?.querySelector<HTMLElement>('[data-callout-kind="exercise"]') ?? null; break;
      default: element = article.querySelector<HTMLElement>(`[data-study-${target.kind}]`);
    }
    if (!element) { setAnnouncement('Esta seção não ficou disponível. Continue pelo conteúdo da aula.'); return; }
    element.tabIndex = -1;
    element.style.scrollMarginTop = '14rem';
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setAnnouncement(`${label}. Seu progresso não foi alterado.`);
  }

  return <nav aria-label="Etapas de estudo" className="sticky top-20 z-20 mb-7 rounded-2xl border border-accent/25 bg-background/95 p-2 shadow-sm backdrop-blur-sm print:hidden" data-study-navigation>
    <p className="px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">Seu caminho nesta aula</p>
    <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const Icon = icons[step.key];
        return <li key={step.key} className="min-w-0"><button type="button" onClick={() => move(step.target, step.label)} aria-label={`${step.label}: ${step.detail}`} className="flex min-h-[64px] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-secondary/60 px-1 py-2 text-foreground transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:items-start sm:px-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-hidden="true"><Icon className="h-4 w-4 text-accent" /><span>{String(index + 1).padStart(2, '0')}</span></span>
          <span className="text-sm font-semibold leading-tight">{step.label}</span>
          <span className="hidden text-left text-xs leading-4 text-muted-foreground md:block">{step.detail}</span>
        </button></li>;
      })}
    </ol>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </nav>;
}
