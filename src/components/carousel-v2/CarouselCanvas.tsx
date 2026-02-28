import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CarouselSlide, CarouselTheme, QualityScore, CarouselFormat, FORMAT_DIMENSIONS } from './types';
import { SlideCanvas } from './SlideCanvas';
import { Slide3DContainer } from './Slide3DContainer';
import { 
  ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut,
  Smartphone, LayoutGrid, Play, Maximize2, FileImage, FileDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export type ExportQuality = '1x' | '2x' | '3x';

type ViewMode = 'single' | 'grid' | 'flip' | 'phone';

interface CarouselCanvasProps {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  theme: CarouselTheme;
  qualityScore?: QualityScore;
  onSelectSlide: (index: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  watermark?: string;
  format?: CarouselFormat;
  onInlineEdit?: (field: 'title' | 'content' | 'subtitle', value: string) => void;
}

export const CarouselCanvas = ({
  slides,
  selectedSlideIndex,
  theme,
  qualityScore,
  onSelectSlide,
  isFullscreen,
  onToggleFullscreen,
  watermark,
  format = '4:5',
  onInlineEdit,
}: CarouselCanvasProps) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [zoom, setZoom] = useState(0.45);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>('2x');
  const dims = FORMAT_DIMENSIONS[format];

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

  const getScale = () => {
    const scales: Record<ExportQuality, number> = { '1x': 1, '2x': 2, '3x': 3 };
    return scales[exportQuality];
  };

  const handleExportSingle = async () => {
    const slideElement = slideRefs.current[selectedSlideIndex];
    if (!slideElement) return;

    try {
      const canvas = await html2canvas(slideElement, {
        width: dims.width,
        height: dims.height,
        scale: getScale(),
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `slide-${String(selectedSlideIndex + 1).padStart(2, '0')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success(`Slide exportado em ${exportQuality}!`);
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
      const scale = getScale();
      
      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i];
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          width: dims.width,
          height: dims.height,
          scale,
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
      
      toast.success(`Carrossel exportado em ${exportQuality}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar carrossel');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // PDF Export (#31)
  const handleExportPDF = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [dims.width, dims.height],
      });

      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i];
        if (!slideElement) continue;

        if (i > 0) pdf.addPage([dims.width, dims.height]);

        const canvas = await html2canvas(slideElement, {
          width: dims.width,
          height: dims.height,
          scale: getScale(),
          useCORS: true,
          backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, dims.width, dims.height);
        setExportProgress(((i + 1) / slides.length) * 100);
      }

      pdf.save('carrossel-instagram.pdf');
      toast.success('PDF exportado!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Erro ao exportar PDF');
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

  // Swipe animation for #29
  const startSwipeAnimation = useCallback(() => {
    if (isSwipeAnimating) return;
    setIsSwipeAnimating(true);
    let current = 0;
    onSelectSlide(0);
    
    const interval = setInterval(() => {
      current++;
      if (current >= slides.length) {
        clearInterval(interval);
        setIsSwipeAnimating(false);
        onSelectSlide(0);
      } else {
        onSelectSlide(current);
      }
    }, 1500);
  }, [isSwipeAnimating, slides.length, onSelectSlide]);

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Card className="p-12 text-center glass-panel border-border max-w-md neon-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum carrossel criado</h3>
            <p className="text-muted-foreground">
              Configure e gere seu carrossel para visualizá-lo aqui
            </p>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Toolbar - Glass effect */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-3 rounded-xl glass-panel">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'single' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('single')}
            className={`gap-2 transition-all ${viewMode === 'single' ? 'glow-accent' : ''}`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`gap-2 transition-all ${viewMode === 'grid' ? 'glow-accent' : ''}`}
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
            className={`gap-2 transition-all ${viewMode === 'flip' ? 'glow-accent' : ''}`}
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Flip</span>
          </Button>
          <Button
            variant={viewMode === 'phone' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('phone');
              startSwipeAnimation();
            }}
            disabled={isSwipeAnimating}
            className={`gap-2 transition-all ${viewMode === 'phone' ? 'glow-accent' : ''}`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">iPhone</span>
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

        {/* Quality + Export */}
        <div className="flex items-center gap-2">
          <Select value={exportQuality} onValueChange={(v) => setExportQuality(v as ExportQuality)}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1x">1x</SelectItem>
              <SelectItem value="2x">2x</SelectItem>
              <SelectItem value="3x">3x</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportSingle} className="gap-2 hover-scale-micro">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Slide</span>
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2 hover-scale-micro">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button 
            onClick={handleExportAll}
            disabled={isExporting}
            className="gap-2 bg-accent hover:bg-accent/90 btn-shimmer glow-accent"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round(exportProgress)}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">ZIP</span>
              </>
            )}
          </Button>
          {onToggleFullscreen && (
            <Button variant="outline" size="icon" onClick={onToggleFullscreen} className="hover-scale-micro">
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quality Score Bar - Enhanced */}
      {qualityScore && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl glass-panel"
        >
          <span className="text-sm font-medium">Qualidade:</span>
          <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${qualityScore.total}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full transition-all rounded-full ${
                qualityScore.total >= 85 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                  : qualityScore.total >= 70 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                    : 'bg-gradient-to-r from-red-500 to-rose-400'
              }`}
            />
          </div>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`text-lg font-bold ${
              qualityScore.total >= 85 
                ? 'text-green-500' 
                : qualityScore.total >= 70 
                  ? 'text-yellow-500' 
                  : 'text-red-500'
            }`}
          >
            {qualityScore.total}%
          </motion.span>
        </motion.div>
      )}

      {/* Preview Area - Single Mode with 3D */}
      {viewMode === 'single' && (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-8 flex items-center justify-center perspective-container">
          <Slide3DContainer
            enableRotation={true}
            intensity={0.8}
            className="transition-transform duration-300"
          >
            <motion.div
              key={selectedSlideIndex}
              initial={{ opacity: 0, rotateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <div 
                ref={(el) => { slideRefs.current[selectedSlideIndex] = el; }}
                className="shadow-2xl rounded-lg overflow-hidden ring-1 ring-border/20"
                style={{ width: dims.width, height: dims.height }}
              >
                <SlideCanvas slide={slides[selectedSlideIndex]} theme={theme} watermark={watermark} onInlineEdit={onInlineEdit} />
              </div>
            </motion.div>
          </Slide3DContainer>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`cursor-pointer transition-all hover:scale-[1.03] group ${
                  index === selectedSlideIndex ? 'ring-2 ring-accent glow-accent' : ''
                }`}
                onClick={() => onSelectSlide(index)}
              >
                <div 
                  ref={(el) => { slideRefs.current[index] = el; }}
                  className="shadow-lg rounded-lg overflow-hidden ring-1 ring-border/20 group-hover:ring-accent/50 transition-all"
                  style={{ width: '100%', aspectRatio: `${dims.width}/${dims.height}` }}
                >
                  <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: dims.width, height: dims.height }}>
                    <SlideCanvas slide={slide} theme={theme} watermark={watermark} />
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  Slide {index + 1}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {viewMode === 'flip' && (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-8 flex items-center justify-center perspective-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSlideIndex}
              initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 0.4 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformOrigin: 'center center' }}
              className="preserve-3d"
            >
              <div 
                ref={(el) => { slideRefs.current[selectedSlideIndex] = el; }}
                className="shadow-2xl rounded-lg overflow-hidden ring-1 ring-border/20"
                style={{ width: dims.width, height: dims.height }}
              >
                <SlideCanvas slide={slides[selectedSlideIndex]} theme={theme} watermark={watermark} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* iPhone Frame Preview (#35 + #29 swipe) */}
      {viewMode === 'phone' && (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-8 flex items-center justify-center">
          {/* iPhone Frame */}
          <div className="relative" style={{ width: 320 }}>
            {/* iPhone outer shell */}
            <div className="relative rounded-[3rem] border-[6px] border-foreground/80 bg-foreground/90 shadow-2xl overflow-hidden">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-24 h-6 bg-foreground rounded-full" />
              
              {/* Screen */}
              <div className="relative overflow-hidden rounded-[2.5rem]" style={{ aspectRatio: `${dims.width}/${dims.height}` }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedSlideIndex}
                    initial={{ x: '100%', opacity: 0.5 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0.5 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full h-full"
                  >
                    <div style={{ width: '100%', height: '100%' }}>
                      <SlideCanvas slide={slides[selectedSlideIndex]} theme={theme} watermark={watermark} />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Instagram-style dots */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-20">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`rounded-full transition-all ${
                        index === selectedSlideIndex 
                          ? 'bg-white w-2 h-2' 
                          : 'bg-white/50 w-1.5 h-1.5'
                      }`}
                      onClick={() => onSelectSlide(index)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Home indicator */}
              <div className="flex justify-center py-2">
                <div className="w-28 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
            
            {/* Swipe hint */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              {isSwipeAnimating ? '⏳ Simulando swipe...' : 'Clique nos dots ou use ← → para navegar'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation - Enhanced */}
      <div className="flex items-center justify-center gap-4 p-3 rounded-xl glass-panel">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePrev}
          disabled={selectedSlideIndex === 0}
          className="hover-scale-micro"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-2.5 rounded-full transition-all ${
                index === selectedSlideIndex 
                  ? 'bg-accent w-8 glow-accent' 
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
          className="hover-scale-micro"
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
            style={{ width: dims.width, height: dims.height }}
          >
            <SlideCanvas slide={slide} theme={theme} watermark={watermark} />
          </div>
        ))}
      </div>
    </div>
  );
};
