import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CarouselSlide, CarouselTheme, CONTENT_ICONS } from './types';
import { SlideRenderer } from './SlideRenderer';
import { 
  ChevronLeft, ChevronRight, Download, Image, Loader2, 
  ZoomIn, ZoomOut, Maximize2 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface CarouselPreviewProps {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  theme: CarouselTheme;
  onSelectSlide: (index: number) => void;
}

export const CarouselPreview = ({
  slides,
  selectedSlideIndex,
  theme,
  onSelectSlide,
}: CarouselPreviewProps) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [zoom, setZoom] = useState(0.5);

  const handlePrev = () => {
    if (selectedSlideIndex > 0) {
      onSelectSlide(selectedSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedSlideIndex < slides.length - 1) {
      onSelectSlide(selectedSlideIndex + 1);
    }
  };

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
      link.download = `slide-${selectedSlideIndex + 1}.png`;
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

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-12 text-center bg-card border-border max-w-md">
          <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhum carrossel criado</h3>
          <p className="text-muted-foreground">
            Digite um tema e clique em "Gerar com IA" para criar seu carrossel profissional
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setZoom(Math.min(1, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportSingle}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Slide
          </Button>
          <Button 
            onClick={handleExportAll}
            disabled={isExporting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {Math.round(exportProgress)}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 rounded-xl p-8 flex items-center justify-center">
        <div 
          className="transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <div 
            ref={(el) => { slideRefs.current[selectedSlideIndex] = el; }}
            className="shadow-2xl rounded-lg overflow-hidden"
            style={{ width: 1080, height: 1350 }}
          >
            <SlideRenderer slide={slides[selectedSlideIndex]} theme={theme} />
          </div>
        </div>
      </div>

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
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === selectedSlideIndex 
                  ? 'bg-accent w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
            <SlideRenderer slide={slide} theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
};
