import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KEY = 'mir-consent';

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(KEY);
    if (!stored) setVisible(true);
  }, []);

  const set = (val: 'accepted' | 'declined') => {
    window.localStorage.setItem(KEY, val);
    setVisible(false);
    // Recarrega para que o Analytics (que só injeta ao aceitar) rode agora
    if (val === 'accepted') window.location.reload();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:p-4 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-8px_32px_hsl(var(--navy-dark)/0.35)] animate-fade-in"
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de cookies"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs md:text-sm text-foreground/85 leading-relaxed">
            Usamos cookies essenciais para o funcionamento do site e, com sua autorização,
            cookies de análise e marketing (Meta Pixel e Google Analytics) para melhorar sua
            experiência. Veja detalhes em{' '}
            <Link to="/privacidade" className="underline underline-offset-2 hover:text-accent">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 md:flex-none text-xs"
            onClick={() => set('declined')}
          >
            Apenas essenciais
          </Button>
          <Button
            variant="hero"
            size="sm"
            className="flex-1 md:flex-none text-xs"
            onClick={() => set('accepted')}
          >
            Aceitar todos
          </Button>
          <button
            aria-label="Fechar"
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => set('declined')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
