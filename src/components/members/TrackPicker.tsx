import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRACKS, TRACK_KEYS, type TrackKey } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

interface TrackPickerProps {
  currentTrack: TrackKey | null;
  saving: boolean;
  onChoose: (track: TrackKey) => void;
}

/** Manual choice among the four tracks and the full formation. */
export function TrackPicker({ currentTrack, saving, onChoose }: TrackPickerProps) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {TRACK_KEYS.map((key) => {
        const track = TRACKS[key];
        const isCurrent = key === currentTrack;
        const codes = key === 'completa' ? 'MOD-00 a MOD-12' : track.moduleCodes.join(' · ');
        return (
          <li
            key={key}
            className={cn('flex flex-col rounded-2xl border bg-card p-5', isCurrent ? 'border-accent ring-1 ring-accent' : 'border-border/50')}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-foreground">{track.label}</h3>
              {isCurrent && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Sua trilha
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {track.hoursLabel} · {track.moduleCodes.length} módulos
            </p>
            <p className="mt-2 flex-1 text-sm text-foreground/85">{track.description}</p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{codes}</p>
            <Button
              type="button"
              variant={isCurrent ? 'secondary' : 'outline'}
              disabled={isCurrent || saving}
              onClick={() => onChoose(key)}
              aria-label={isCurrent ? undefined : `Escolher esta trilha: ${track.label}`}
              className="mt-4"
            >
              {isCurrent ? 'Trilha atual' : 'Escolher esta trilha'}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
