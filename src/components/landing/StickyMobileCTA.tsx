import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { PAYMENT_URL } from '@/lib/constants';

export const StickyMobileCTA = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_hsl(var(--navy-dark)/0.15)] animate-fade-in">
      <Button asChild variant="hero" size="lg" className="w-full group text-base py-4">
        <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer">
          Quero começar • 12x R$41
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </Button>
      <p className="text-center text-[10px] text-muted-foreground mt-1.5">
        Garantia de 7 dias • Acesso imediato
      </p>
    </div>
  );
};
