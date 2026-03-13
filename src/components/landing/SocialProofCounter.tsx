import { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

export const SocialProofCounter = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentBuyers, setRecentBuyers] = useState(0);

  useEffect(() => {
    // Simulate realistic counters with slight variance
    const base = 127 + Math.floor(Math.random() * 80);
    const buyers = 847 + Math.floor(Math.random() * 50);
    
    // Animate count up
    let current = 0;
    const step = Math.ceil(base / 30);
    const interval = setInterval(() => {
      current += step;
      if (current >= base) {
        setOnlineCount(base);
        clearInterval(interval);
      } else {
        setOnlineCount(current);
      }
    }, 40);

    setRecentBuyers(buyers);

    // Slight fluctuation every 15s
    const fluctuate = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(fluctuate);
    };
  }, []);

  return (
    <ScrollReveal>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            <strong className="text-green-500">{onlineCount}</strong> pessoas online agora
          </span>
        </div>
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-accent/20 rounded-full px-4 py-2">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <span className="text-sm font-medium text-foreground">
            <strong className="text-accent">{recentBuyers}</strong> compraram nos últimos 7 dias
          </span>
        </div>
      </div>
    </ScrollReveal>
  );
};
