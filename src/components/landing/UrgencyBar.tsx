import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

export const UrgencyBar = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const getEndTime = () => {
      const stored = localStorage.getItem('urgency_end');
      if (stored) {
        const end = new Date(stored);
        if (end > new Date()) return end;
      }
      const end = new Date();
      end.setHours(end.getHours() + 6);
      localStorage.setItem('urgency_end', end.toISOString());
      return end;
    };

    const endTime = getEndTime();

    const tick = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-accent via-gold to-accent text-accent-foreground">
      <div className="container px-4 flex items-center justify-center gap-2 sm:gap-3 h-9 sm:h-10 text-xs sm:text-sm font-semibold relative">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
        <span className="hidden sm:inline">🔥 50% OFF — Oferta expira em</span>
        <span className="sm:hidden">🔥 50% OFF expira em</span>
        <div className="flex items-center gap-1 font-mono font-bold text-sm sm:text-base">
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>
          <span>:</span>
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>
          <span>:</span>
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="absolute right-2 sm:right-4 p-1 hover:bg-accent-foreground/10 rounded transition-colors" aria-label="Fechar">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
