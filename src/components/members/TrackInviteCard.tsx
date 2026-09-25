import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Shown while `profiles.learning_track` is empty: invites to the 2-minute trail quiz. */
export function TrackInviteCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-5 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground" aria-hidden="true">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-bold text-foreground">Descubra a sua trilha em 2 minutos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Responda 5 perguntas e estude só os módulos que fazem diferença para você. Dá para trocar quando quiser.
          </p>
        </div>
      </div>
      <Button asChild variant="cta" className="shrink-0">
        <Link to="/membros/trilha">
          Fazer o quiz da trilha
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
