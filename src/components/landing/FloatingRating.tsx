import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export const FloatingRating = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero, hide near footer
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setIsVisible(scrollY > 800 && scrollY < docHeight - 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden md:flex fixed top-20 right-4 z-40 items-center gap-1.5 bg-card/95 backdrop-blur-sm border border-accent/20 rounded-full px-3 py-1.5 shadow-md animate-fade-in">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-gold text-gold" />
        ))}
      </div>
      <span className="text-xs font-semibold text-foreground">4.9/5</span>
      <span className="text-[10px] text-muted-foreground">(2.847)</span>
    </div>
  );
};
