import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { OutlineModule } from '@/lib/curriculum';
import { cn } from '@/lib/utils';
import { LessonList } from './LessonList';
import { ModuleSummary } from './ModuleSummary';

interface ModuleOutlineCardProps {
  module: OutlineModule;
  completed: ReadonlySet<string>;
  isExtra?: boolean;
  resumeLessonId?: string | null;
  defaultOpen?: boolean;
}

/** Module summary with its lessons in a collapsible list (course overview). */
export function ModuleOutlineCard({ module, completed, isExtra = false, resumeLessonId = null, defaultOpen = false }: ModuleOutlineCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article className="overflow-hidden rounded-2xl border border-border/50 bg-card transition-colors hover:border-accent/40">
      <ModuleSummary module={module} completed={completed} isExtra={isExtra} />
      {module.lessons.length > 0 && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border-t border-border/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
            >
              {open ? 'Ocultar aulas' : `Ver as ${module.lessons.length} aulas`}
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <LessonList lessons={module.lessons} completed={completed} resumeLessonId={resumeLessonId} className="border-t border-border/50" />
          </CollapsibleContent>
        </Collapsible>
      )}
    </article>
  );
}
