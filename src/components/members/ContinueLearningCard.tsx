import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Play } from 'lucide-react';
import { ModuleCodeBadge } from '@/components/course/ModuleBadges';
import { Button } from '@/components/ui/button';
import type { OutlineLesson, OutlineModule } from '@/lib/curriculum';

interface ContinueLearningCardProps {
  lesson: OutlineLesson;
  module: OutlineModule | null;
  started: boolean;
}

/** "Continue de onde parou": next incomplete lesson the learner can open, in track order. */
export function ContinueLearningCard({ lesson, module, started }: ContinueLearningCardProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{started ? 'Continue de onde parou' : 'Comece por aqui'}</p>
      {module && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
          <ModuleCodeBadge code={module.code} className="bg-white text-navy" />
          <span>{module.displayTitle}</span>
        </p>
      )}
      <p className="mt-2 font-display text-lg font-bold text-white">{lesson.title}</p>
      {lesson.minutes > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {lesson.minutes} min
        </p>
      )}
      <Button asChild variant="cta" className="mt-4 w-full sm:w-auto">
        <Link to={`/membros/aula/${lesson.id}`}>
          <Play aria-hidden="true" />
          {started ? 'Continuar aula' : 'Começar aula'}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
