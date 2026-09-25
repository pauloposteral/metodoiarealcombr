import { Link } from 'react-router-dom';
import { Award, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import type { LessonNavigation as LessonNavigationState } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

const CARD_BASE =
  'group flex min-w-0 items-center gap-3 rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** Previous/next in course order; "Ver certificado" only after the course's last lesson. */
export function LessonNavigation({ navigation }: { navigation: LessonNavigationState }) {
  const { previous, next, nextModule, isLastLesson } = navigation;
  if (!previous && !next && !isLastLesson) return null;
  const nextEyebrow = nextModule
    ? `Próximo módulo: ${nextModule.code ? `${nextModule.code} · ` : ''}${nextModule.displayTitle}`
    : 'Próxima aula';

  return (
    <nav aria-label="Aulas do curso" className="mt-10 grid grid-cols-1 gap-3 border-t border-border/50 pt-6 sm:grid-cols-2">
      {previous ? (
        <Link to={`/membros/aula/${previous.id}`} rel="prev" className={cn(CARD_BASE, 'border-border/60 bg-card hover:border-accent/40')}>
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Aula anterior</span>
            <span className="line-clamp-2 text-sm font-medium text-foreground">{previous.title}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {next ? (
        <Link
          to={`/membros/aula/${next.id}`}
          rel="next"
          className={cn(CARD_BASE, 'justify-between border-accent/50 bg-accent/15 text-right hover:bg-accent/25 sm:col-start-2')}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-muted-foreground">{nextEyebrow}</span>
            <span className="line-clamp-2 text-sm font-semibold text-foreground">{next.title}</span>
            {!next.accessible && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Disponível nos planos pagos
              </span>
            )}
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : isLastLesson ? (
        <Link to="/membros/certificado" className={cn(CARD_BASE, 'justify-center border-accent bg-accent font-semibold text-accent-foreground hover:bg-accent/90 sm:col-start-2')}>
          <Award className="h-5 w-5" aria-hidden="true" />
          Ver certificado
        </Link>
      ) : null}
    </nav>
  );
}
