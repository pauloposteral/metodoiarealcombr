import { motion, AnimatePresence } from 'framer-motion';
import { TypingEffect, ThinkingDots } from './TypingEffect';
import { GenerationProgress } from './types';
import { Sparkles, Brain, Wand2, CheckCircle2, Image, FileText } from 'lucide-react';

interface GenerationOverlayProps {
  progress: GenerationProgress;
  isVisible: boolean;
}

const statusMessages: Record<string, string[]> = {
  'generating-script': [
    'Analisando o tema do carrossel...',
    'Criando estrutura de slides...',
    'Escrevendo textos persuasivos...',
    'Otimizando copy para engajamento...',
  ],
  'generating-images': [
    'Gerando visuais únicos...',
    'Aplicando estilo visual...',
    'Criando composição profissional...',
    'Finalizando detalhes artísticos...',
  ],
  'quality-check': [
    'Verificando qualidade do conteúdo...',
    'Analisando legibilidade...',
    'Validando estrutura visual...',
  ],
  'complete': [
    'Carrossel gerado com sucesso! ✨',
  ],
};

const statusIcons: Record<string, React.ComponentType<any>> = {
  'generating-script': FileText,
  'generating-images': Image,
  'quality-check': CheckCircle2,
  'complete': Sparkles,
};

export const GenerationOverlay = ({ progress, isVisible }: GenerationOverlayProps) => {
  const currentMessages = statusMessages[progress.status] || ['Processando...'];
  const messageIndex = Math.min(
    Math.floor((progress.percentage / 100) * currentMessages.length),
    currentMessages.length - 1
  );
  const currentMessage = currentMessages[messageIndex];
  const StatusIcon = statusIcons[progress.status] || Brain;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          
          {/* Glass container */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-panel relative z-10 w-full max-w-lg mx-4 p-8 rounded-3xl"
          >
            {/* Animated orbs background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <motion.div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl"
                animate={{
                  x: [0, 20, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent/15 blur-3xl"
                animate={{
                  x: [0, -15, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center neon-border"
                animate={{
                  boxShadow: [
                    '0 0 20px hsl(var(--accent) / 0.3)',
                    '0 0 40px hsl(var(--accent) / 0.5)',
                    '0 0 20px hsl(var(--accent) / 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  animate={{ rotate: progress.status === 'complete' ? 0 : 360 }}
                  transition={{
                    duration: 3,
                    repeat: progress.status === 'complete' ? 0 : Infinity,
                    ease: 'linear',
                  }}
                >
                  <StatusIcon className="w-10 h-10 text-accent" />
                </motion.div>
              </motion.div>

              {/* Status */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {progress.status === 'complete' ? 'Pronto!' : 'Criando seu carrossel'}
                </h3>
                
                {/* Typing effect message */}
                <div className="h-8 flex items-center justify-center">
                  {progress.status !== 'idle' && progress.status !== 'complete' ? (
                    <TypingEffect
                      key={currentMessage}
                      text={currentMessage}
                      speed={30}
                      className="text-muted-foreground"
                    />
                  ) : progress.status === 'complete' ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-accent font-medium"
                    >
                      {currentMessage}
                    </motion.span>
                  ) : (
                    <ThinkingDots />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-gold-light rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    {progress.currentSlide > 0 && `Slide ${progress.currentSlide}/${progress.totalSlides}`}
                  </span>
                  <span className="font-medium text-accent">{Math.round(progress.percentage)}%</span>
                </div>
              </div>

              {/* Slide indicators */}
              {progress.totalSlides > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: progress.totalSlides }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i < progress.currentSlide
                          ? 'w-6 bg-accent'
                          : i === progress.currentSlide
                            ? 'w-4 bg-accent/50'
                            : 'w-2 bg-muted-foreground/30'
                      }`}
                      animate={i === progress.currentSlide ? {
                        opacity: [0.5, 1, 0.5],
                      } : {}}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};