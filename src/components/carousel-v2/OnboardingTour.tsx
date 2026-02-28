import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  emoji: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao Editor de Carrosséis!',
    description: 'Crie carrosséis profissionais para Instagram com IA. Vamos te mostrar como funciona.',
    emoji: '🎉',
  },
  {
    title: 'Passo 1: Configure',
    description: 'Escolha objetivo, público, tom de voz e estilo visual no assistente de criação.',
    emoji: '⚙️',
  },
  {
    title: 'Passo 2: Gere com IA',
    description: 'A IA cria roteiro, textos e imagens automaticamente. Você pode importar de URL também.',
    emoji: '🤖',
  },
  {
    title: 'Passo 3: Edite',
    description: 'Ajuste textos, troque temas, altere fontes e cores. Use Ctrl+Z para desfazer.',
    emoji: '✏️',
  },
  {
    title: 'Passo 4: Refine com IA',
    description: 'Use Reescrever, Traduzir e A/B Hooks no topo do editor para melhorar seu conteúdo.',
    emoji: '✨',
  },
  {
    title: 'Passo 5: Exporte',
    description: 'Baixe em PNG, PDF ou copie tudo para o Instagram com um clique. Pronto!',
    emoji: '🚀',
  },
];

const STORAGE_KEY = 'carousel-onboarding-seen';

interface OnboardingTourProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const OnboardingTour = ({ forceShow, onClose }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="text-5xl mb-4">{step.emoji}</div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-accent' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 bg-accent hover:bg-accent/90"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
