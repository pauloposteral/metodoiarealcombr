import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StorySlide, StoryTextOverlay, STORY_STYLES } from './types';
import { 
  ChevronLeft, ChevronRight, Download, Loader2, 
  Smartphone, Play, Pause, RotateCcw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface StoryCanvasProps {
  slides: StorySlide[];
  selectedIndex: number;
  onSelectSlide: (index: number) => void;
}

export const StoryCanvas = ({
  slides,
  selectedIndex,
  onSelectSlide,
}: StoryCanvasProps) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSlide = slides[selectedIndex];

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (slides.length <= 1) return;
    setIsPlaying(true);
    setPlayProgress(0);

    let progress = 0;
    const duration = 3000; // 3 seconds per slide
    const interval = 50; // Update every 50ms

    playIntervalRef.current = setInterval(() => {
      progress += (interval / duration) * 100;
      
      if (progress >= 100) {
        progress = 0;
        onSelectSlide((selectedIndex + 1) % slides.length);
      }
      
      setPlayProgress(progress);
    }, interval);
  }, [slides.length, selectedIndex, onSelectSlide]);

  const stopAutoPlay = useCallback(() => {
    setIsPlaying(false);
    setPlayProgress(0);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isPlaying, startAutoPlay, stopAutoPlay]);

  // Export functions
  const handleExportSingle = async () => {
    const slideElement = slideRefs.current[selectedIndex];
    if (!slideElement) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(slideElement, {
        width: 1080,
        height: 1920,
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `story-${String(selectedIndex + 1).padStart(2, '0')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Story exportado!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);

    try {
      const zip = new JSZip();
      
      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i];
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          width: 1080,
          height: 1920,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(`story-${String(i + 1).padStart(2, '0')}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'stories-instagram.zip';
      link.href = URL.createObjectURL(content);
      link.click();
      
      toast.success('Stories exportados!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar stories');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      onSelectSlide(selectedIndex - 1);
      if (isPlaying) setPlayProgress(0);
    }
  }, [selectedIndex, onSelectSlide, isPlaying]);

  const handleNext = useCallback(() => {
    if (selectedIndex < slides.length - 1) {
      onSelectSlide(selectedIndex + 1);
      if (isPlaying) setPlayProgress(0);
    }
  }, [selectedIndex, slides.length, onSelectSlide, isPlaying]);

  // Render text overlay
  const renderTextOverlay = (overlay: StoryTextOverlay | undefined) => {
    if (!overlay?.text) return null;

    const positionStyles = {
      top: 'top-[15%]',
      center: 'top-1/2 -translate-y-1/2',
      bottom: 'bottom-[15%]',
    };

    const fontSizes = {
      sm: 'text-2xl',
      md: 'text-4xl',
      lg: 'text-5xl',
      xl: 'text-6xl',
    };

    const textStyles = {
      modern: 'font-sans font-bold tracking-tight',
      elegant: 'font-display italic',
      bold: 'font-sans font-black uppercase tracking-widest',
      minimal: 'font-sans font-light tracking-wide',
      neon: 'font-sans font-bold',
    };

    return (
      <div 
        className={`absolute left-0 right-0 px-8 text-center ${positionStyles[overlay.position]}`}
      >
        <p 
          className={`${fontSizes[overlay.fontSize]} ${textStyles[overlay.style]} leading-tight`}
          style={{ 
            color: overlay.color,
            textShadow: overlay.style === 'neon' 
              ? `0 0 20px ${overlay.color}, 0 0 40px ${overlay.color}` 
              : '0 2px 20px rgba(0,0,0,0.5)',
            backgroundColor: overlay.backgroundColor || 'transparent',
            padding: overlay.backgroundColor ? '1rem 2rem' : 0,
            borderRadius: overlay.backgroundColor ? '0.5rem' : 0,
          }}
        >
          {overlay.text}
        </p>
      </div>
    );
  };

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 text-center max-w-md neon-border"
        >
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h3 className="text-xl font-bold mb-2">Crie seu primeiro Story</h3>
          <p className="text-muted-foreground">
            Configure e gere stories incríveis com IA
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-xl glass-panel">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="hover-scale-micro"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          {isPlaying && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                stopAutoPlay();
                onSelectSlide(0);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportSingle} 
            disabled={isExporting}
            className="gap-2 hover-scale-micro"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button 
            onClick={handleExportAll}
            disabled={isExporting || slides.length === 0}
            className="gap-2 bg-accent hover:bg-accent/90 btn-shimmer glow-accent"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Todos ({slides.length})</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Story Preview - Phone Frame */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative">
          {/* Phone frame */}
          <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20" />
            
            {/* Screen */}
            <div className="relative w-[280px] h-[600px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-[2.5rem] overflow-hidden">
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
                {slides.map((_, index) => (
                  <div 
                    key={index}
                    className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: index < selectedIndex 
                          ? '100%' 
                          : index === selectedIndex 
                            ? `${isPlaying ? playProgress : 0}%` 
                            : '0%' 
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                ))}
              </div>

              {/* Story content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {selectedSlide?.isGenerating ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="w-12 h-12 text-accent mx-auto" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground mt-4">Gerando imagem...</p>
                      </div>
                    </div>
                  ) : selectedSlide?.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedSlide.imageUrl} 
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                      {renderTextOverlay(selectedSlide.textOverlay)}
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: STORY_STYLES[selectedSlide?.style || 'editorial'].gradient }}
                    >
                      <p className="text-white/60 text-center px-8">
                        {selectedSlide?.prompt || 'Aguardando geração...'}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Touch zones */}
              <div className="absolute inset-0 flex z-10">
                <div 
                  className="w-1/3 h-full cursor-pointer"
                  onClick={handlePrev}
                />
                <div className="w-1/3 h-full" />
                <div 
                  className="w-1/3 h-full cursor-pointer"
                  onClick={handleNext}
                />
              </div>
            </div>
          </div>

          {/* Navigation arrows (desktop) */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden md:flex hover-scale-micro"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={selectedIndex === slides.length - 1}
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 hidden md:flex hover-scale-micro"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center gap-3 p-3 rounded-xl glass-panel">
        {slides.map((slide, index) => (
          <motion.button
            key={slide.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectSlide(index)}
            className={`relative w-12 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedIndex 
                ? 'border-accent glow-accent' 
                : 'border-border/50 hover:border-accent/50'
            }`}
          >
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div 
                className="w-full h-full"
                style={{ background: STORY_STYLES[slide.style].gradient }}
              />
            )}
            {slide.isGenerating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Hidden export elements */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            ref={(el) => { slideRefs.current[index] = el; }}
            style={{ width: 1080, height: 1920 }}
            className="relative"
          >
            {slide.imageUrl ? (
              <>
                <img 
                  src={slide.imageUrl} 
                  alt=""
                  className="w-full h-full object-cover"
                />
                {slide.textOverlay && (
                  <div 
                    className={`absolute left-0 right-0 px-16 text-center ${
                      slide.textOverlay.position === 'top' ? 'top-[15%]' :
                      slide.textOverlay.position === 'center' ? 'top-1/2 -translate-y-1/2' :
                      'bottom-[15%]'
                    }`}
                  >
                    <p 
                      style={{ 
                        color: slide.textOverlay.color,
                        fontSize: slide.textOverlay.fontSize === 'sm' ? '48px' :
                                  slide.textOverlay.fontSize === 'md' ? '72px' :
                                  slide.textOverlay.fontSize === 'lg' ? '96px' : '120px',
                        fontWeight: 'bold',
                        textShadow: '0 4px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      {slide.textOverlay.text}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div 
                className="w-full h-full"
                style={{ background: STORY_STYLES[slide.style].gradient }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};