import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { CarouselSlide, CarouselTheme, QualityScore } from './types';
import { SlideCanvas } from './SlideCanvas';
import { 
  ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut,
  Smartphone, LayoutGrid, Play, Maximize2, FileImage
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { toast } from 'sonner';

type ViewMode = 'single' | 'grid' | 'flip';

interface CarouselCanvasProps {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  theme: CarouselTheme;
  qualityScore?: QualityScore;
  onSelectSlide: (index: number) => void;
}

export const CarouselCanvas = ({
  slides,
  selectedSlideIndex,
  theme,
  qualityScore,
  onSelectSlide,
}: CarouselCanvasProps) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [zoom, setZoom] = useState(0.45);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isFlipping, setIsFlipping] = useState(false);

  const handlePrev = useCallback(() => {
    if (selectedSlideIndex > 0) {
      onSelectSlide(selectedSlideIndex - 1);
    }
  }, [selectedSlideIndex, onSelectSlide]);

  const handleNext = useCallback(() => {
    if (selectedSlideIndex < slides.length - 1) {
      onSelectSlide(selectedSlideIndex + 1);
    }
  }, [selectedSlideIndex, slides.length, onSelectSlide]);

  const handleExportSingle = async () => {
    const slideElement = slideRefs.current[selectedSlideIndex];
    if (!slideElement) return;

    try {
      const canvas = await html2canvas(slideElement, {
        width: 1080,
        height: 1350,
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `slide-${String(selectedSlideIndex + 1).padStart(2, '0')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Slide exportado!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar slide');
    }
  };

  const handleExportAll = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportProgress(0);

    try {
      const zip = new JSZip();
      
      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i];
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          width: 1080,
          height: 1350,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64Data, { base64: true });
        
        setExportProgress(((i + 1) / slides.length) * 100);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'carrossel-instagram.zip';
      link.href = URL.createObjectURL(content);
      link.click();
      
      toast.success('Carrossel exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar carrossel');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const startFlipAnimation = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    let current = 0;
    
    const interval = setInterval(() => {
      current++;
      if (current >= slides.length) {
        clearInterval(interval);
        setIsFlipping(false);
        onSelectSlide(0);
      } else {
        onSelectSlide(current);
      }
    }, 800);
  }, [isFlipping, slides.length, onSelectSlide]);

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Card className="p-12 text-center bg-card border-border max-w-md">
          <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhum carrossel criado</h3>
          <p className="text-muted-foreground">
            Configure e gere seu carrossel para visualizá-lo aqui
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'single' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('single')}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'flip' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('flip');
              startFlipAnimation();
            }}
            disabled={isFlipping}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Flip</span>
          </Button>
        </div>

        {/* Zoom (only for single view) */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-24">
              <Slider
                value={[zoom * 100]}
                onValueChange={([v]) => setZoom(v / 100)}
                min={25}
                max={80}
                step={5}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoom(Math.min(0.8, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}

        {/* Export */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportSingle} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Slide</span>
          </Button>
          <Button 
            onClick={handleExportAll}
            disabled={isExporting}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round(exportProgress)}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar Todos</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quality Score Bar */}
      {qualityScore && (
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Qualidade:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                qualityScore.total >= 85 
                  ? 'bg-green-500' 
                  : qualityScore.total >= 70 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${qualityScore.total}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${
            qualityScore.total >= 85 
              ? 'text-green-500' 
              : qualityScore.total >= 70 
                ? 'text-yellow-500' 
                : 'text-red-500'
          }`}>
            {qualityScore.total}%
          </span>
        </div>
      )}

      {/* Preview Area */}
      {viewMode === 'single' && (
        <div className="flex-1 overflow-auto bg-muted/20 rounded-xl p-8 flex items-center justify-center">
          <div 
            className="transition-transform duration-300"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div 
              ref={(el) => { slideRefs.current[selectedSlideIndex] = el; }}
              className="shadow-2xl rounded-lg overflow-hidden"
              style={{ width: 1080, height: 1350 }}
            >
              <SlideCanvas slide={slides[selectedSlideIndex]} theme={theme} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="flex-1 overflow-auto bg-muted/20 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  index === selectedSlideIndex ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => onSelectSlide(index)}
              >
                <div 
                  ref={(el) => { slideRefs.current[index] = el; }}
                  className="shadow-lg rounded-lg overflow-hidden"
                  style={{ width: '100%', aspectRatio: '1080/1350' }}
                >
                  <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: 1080, height: 1350 }}>
                    <SlideCanvas slide={slide} theme={theme} />
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Slide {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'flip' && (
        <div className="flex-1 overflow-auto bg-muted/20 rounded-xl p-8 flex items-center justify-center">
          <div 
            className="transition-all duration-500"
            style={{ transform: `scale(0.4)`, transformOrigin: 'center center' }}
          >
            <div 
              ref={(el) => { slideRefs.current[selectedSlideIndex] = el; }}
              className="shadow-2xl rounded-lg overflow-hidden"
              style={{ width: 1080, height: 1350 }}
            >
              <SlideCanvas slide={slides[selectedSlideIndex]} theme={theme} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePrev}
          disabled={selectedSlideIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 rounded-full transition-all ${
                index === selectedSlideIndex 
                  ? 'bg-accent w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5'
              }`}
              onClick={() => onSelectSlide(index)}
            />
          ))}
        </div>

        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNext}
          disabled={selectedSlideIndex === slides.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Hidden slides for export */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            ref={(el) => { slideRefs.current[index] = el; }}
            style={{ width: 1080, height: 1350 }}
          >
            <SlideCanvas slide={slide} theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
};
