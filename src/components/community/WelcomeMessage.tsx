import { Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeMessageProps {
  userName: string;
}

export const WelcomeMessage = ({ userName }: WelcomeMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('community_welcome_seen');
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('community_welcome_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border-gold/30 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gold/20">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-foreground mb-1">
                Bem-vindo à Comunidade, {userName}! 🎉
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Este é seu espaço para trocar experiências, tirar dúvidas e compartilhar resultados 
                com outros alunos do Método IA Real. Participe das discussões, ajude outros membros 
                e faça parte desta jornada de aprendizado coletivo!
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-primary-foreground"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
