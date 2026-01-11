import { GenerationProgress } from './types';
import { Loader2, CheckCircle2, Sparkles, ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressBarProps {
  progress: GenerationProgress;
}

export const GenerationProgressBar = ({ progress }: GenerationProgressBarProps) => {
  const getProgressValue = () => {
    if (progress.status === 'generating-text') {
      return 10;
    }
    if (progress.status === 'generating-images') {
      const imageProgress = (progress.currentSlide / progress.totalSlides) * 85;
      return 10 + imageProgress;
    }
    if (progress.status === 'complete') {
      return 100;
    }
    return 0;
  };

  const getIcon = () => {
    switch (progress.status) {
      case 'generating-text':
        return <Sparkles className="w-5 h-5 text-accent animate-pulse" />;
      case 'generating-images':
        return <ImageIcon className="w-5 h-5 text-accent animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'generating-text':
        return 'Etapa 1/2: Gerando textos e roteiro';
      case 'generating-images':
        return `Etapa 2/2: Criando imagens (${progress.currentSlide}/${progress.totalSlides})`;
      case 'complete':
        return 'Carrossel completo!';
      default:
        return 'Preparando...';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{getStatusText()}</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getProgressValue())}%
            </span>
          </div>
          
          <Progress value={getProgressValue()} className="h-2" />
          
          <p className="text-xs text-muted-foreground mt-2">
            {progress.message}
          </p>
        </div>
      </div>
    </div>
  );
};
