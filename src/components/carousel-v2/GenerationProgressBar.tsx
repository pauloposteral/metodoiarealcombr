import { motion } from 'framer-motion';
import { GenerationProgress } from './types';
import { 
  Sparkles, FileText, Image, CheckCircle, 
  Shield, Loader2, Wand2
} from 'lucide-react';

interface GenerationProgressBarProps {
  progress: GenerationProgress;
}

export const GenerationProgressBar = ({ progress }: GenerationProgressBarProps) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'generating-ideas':
        return <Sparkles className="w-5 h-5 animate-pulse" />;
      case 'generating-hooks':
        return <Wand2 className="w-5 h-5 animate-pulse" />;
      case 'generating-script':
        return <FileText className="w-5 h-5 animate-pulse" />;
      case 'generating-copy':
        return <FileText className="w-5 h-5 animate-pulse" />;
      case 'generating-images':
        return <Image className="w-5 h-5 animate-pulse" />;
      case 'quality-check':
        return <Shield className="w-5 h-5 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'complete':
        return 'from-green-500 to-emerald-500';
      case 'generating-images':
        return 'from-purple-500 to-pink-500';
      case 'quality-check':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-accent to-accent/70';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            {getStatusIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium truncate">
                {progress.message}
              </p>
              <span className="text-sm font-bold text-accent ml-2">
                {Math.round(progress.percentage)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()}`}
              />
            </div>

            {/* Slide Counter */}
            {progress.status === 'generating-images' && progress.totalSlides > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Slide {progress.currentSlide} de {progress.totalSlides}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
