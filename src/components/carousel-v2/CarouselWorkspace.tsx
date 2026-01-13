import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselWizard } from './CarouselWizard';
import { CarouselCanvas } from './CarouselCanvas';
import { SlideEditor } from './SlideEditor';
import { ExportPanel } from './ExportPanel';
import { GenerationProgressBar } from './GenerationProgressBar';
import { GenerationOverlay } from './GenerationOverlay';
import {
  CarouselSlide,
  CarouselTheme,
  CarouselConfig,
  CarouselData,
  QualityScore,
  GenerationProgress,
  CAROUSEL_THEMES,
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, RefreshCw, ChevronLeft, Download, 
  Sparkles, AlertTriangle, CheckCircle2
} from 'lucide-react';

// ==========================================
// CAROUSEL WORKSPACE - Main Editor Component
// ==========================================

export const CarouselWorkspace = () => {
  // State
  const [step, setStep] = useState<'wizard' | 'editor'>('wizard');
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [theme, setTheme] = useState<CarouselTheme>(CAROUSEL_THEMES[0]);
  const [config, setConfig] = useState<CarouselConfig | null>(null);
  const [topic, setTopic] = useState('');
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const [progress, setProgress] = useState<GenerationProgress>({
    status: 'idle',
    currentSlide: 0,
    totalSlides: 0,
    message: '',
    percentage: 0,
  });

  // ==========================================
  // Generate Carousel with Carousel Engine
  // ==========================================
  const handleGenerate = async (newConfig: CarouselConfig, newTopic: string) => {
    setConfig(newConfig);
    setTopic(newTopic);
    setIsGenerating(true);

    // Select theme based on style
    const styleThemes = CAROUSEL_THEMES.filter(t => t.category === newConfig.format.style);
    const selectedTheme = styleThemes[0] || CAROUSEL_THEMES[0];
    setTheme(selectedTheme);

    try {
      // Step 1: Generate carousel content
      setProgress({
        status: 'generating-script',
        currentSlide: 0,
        totalSlides: newConfig.format.slideCount,
        message: 'Criando roteiro e textos...',
        percentage: 15,
      });

      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'generate-carousel',
          topic: newTopic,
          config: newConfig,
        },
      });

      if (error) throw error;

      const generatedSlides = data.slides.map((slide: CarouselSlide) => ({
        ...slide,
        isGeneratingImage: true,
      }));

      setSlides(generatedSlides);
      setCarousel({
        id: crypto.randomUUID(),
        topic: newTopic,
        config: newConfig,
        slides: generatedSlides,
        theme: selectedTheme,
        createdAt: new Date(),
        caption: data.caption,
        hashtags: data.hashtags,
        alternativeTitle: data.alternativeTitle,
        firstComment: data.firstComment,
      });

      setStep('editor');
      setSelectedSlideIndex(0);

      // Step 2: Generate images for each slide
      setProgress({
        status: 'generating-images',
        currentSlide: 0,
        totalSlides: generatedSlides.length,
        message: 'Gerando imagens...',
        percentage: 30,
      });

      await generateAllSlideImages(generatedSlides, selectedTheme);

      // Step 3: Quality check
      setProgress({
        status: 'quality-check',
        currentSlide: generatedSlides.length,
        totalSlides: generatedSlides.length,
        message: 'Verificando qualidade...',
        percentage: 95,
      });

      const qcResponse = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'quality-check',
          slides: generatedSlides,
          config: newConfig,
        },
      });

      if (qcResponse.data?.qualityScore) {
        setQualityScore(qcResponse.data.qualityScore);
      }

      setProgress({
        status: 'complete',
        currentSlide: generatedSlides.length,
        totalSlides: generatedSlides.length,
        message: 'Carrossel completo!',
        percentage: 100,
      });

      toast.success('Carrossel gerado com sucesso!');

      setTimeout(() => {
        setProgress({ status: 'idle', currentSlide: 0, totalSlides: 0, message: '', percentage: 0 });
      }, 2000);

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Erro ao gerar carrossel. Tente novamente.');
      setProgress({ status: 'idle', currentSlide: 0, totalSlides: 0, message: '', percentage: 0 });
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // Generate Images for All Slides
  // ==========================================
  const generateAllSlideImages = async (slidesToGenerate: CarouselSlide[], currentTheme: CarouselTheme) => {
    const themeColors = `${currentTheme.name} - Primary: ${currentTheme.primaryColor}, Accent: ${currentTheme.accentColor}`;

    for (let i = 0; i < slidesToGenerate.length; i++) {
      const slide = slidesToGenerate[i];

      setProgress(prev => ({
        ...prev,
        currentSlide: i + 1,
        message: `Gerando imagem ${i + 1} de ${slidesToGenerate.length}...`,
        percentage: 30 + ((i + 1) / slidesToGenerate.length) * 60,
      }));

      try {
        const { data, error } = await supabase.functions.invoke('generate-slide-image', {
          body: {
            prompt: slide.imagePrompt || `Educational visual for: ${slide.title}`,
            slideType: slide.type,
            themeColors,
          },
        });

        if (error) throw error;

        setSlides(prev => prev.map((s, idx) =>
          idx === i ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s
        ));

        // Small delay between requests
        if (i < slidesToGenerate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error generating image for slide ${i}:`, error);
        setSlides(prev => prev.map((s, idx) =>
          idx === i ? { ...s, isGeneratingImage: false } : s
        ));
        toast.error(`Erro na imagem do slide ${i + 1}`);
      }
    }
  };

  // ==========================================
  // Regenerate Single Slide Image
  // ==========================================
  const handleRegenerateImage = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide) return;

    setSlides(prev => prev.map((s, i) =>
      i === slideIndex ? { ...s, isGeneratingImage: true } : s
    ));

    toast.info(`Regenerando imagem do slide ${slideIndex + 1}...`);

    try {
      const themeColors = `${theme.name} - Primary: ${theme.primaryColor}, Accent: ${theme.accentColor}`;
      
      const { data, error } = await supabase.functions.invoke('generate-slide-image', {
        body: {
          prompt: slide.imagePrompt || `Educational visual for: ${slide.title}`,
          slideType: slide.type,
          themeColors,
        },
      });

      if (error) throw error;

      setSlides(prev => prev.map((s, i) =>
        i === slideIndex ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s
      ));

      toast.success('Imagem regenerada!');
    } catch (error) {
      console.error('Error regenerating image:', error);
      setSlides(prev => prev.map((s, i) =>
        i === slideIndex ? { ...s, isGeneratingImage: false } : s
      ));
      toast.error('Erro ao regenerar imagem');
    }
  }, [slides, theme]);

  // ==========================================
  // Improve Slide with AI
  // ==========================================
  const handleImproveSlide = useCallback(async (slideIndex: number, action: string) => {
    if (!config) return;

    toast.info('Melhorando slide com IA...');

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'improve-slide',
          slides,
          slideIndex,
          improvementAction: action,
        },
      });

      if (error) throw error;

      setSlides(prev => prev.map((s, i) =>
        i === slideIndex ? { ...s, ...data.updates } : s
      ));

      toast.success('Slide melhorado!');
    } catch (error) {
      console.error('Error improving slide:', error);
      toast.error('Erro ao melhorar slide');
    }
  }, [slides, config]);

  // ==========================================
  // Slide Management
  // ==========================================
  const handleUpdateSlide = (index: number, updates: Partial<CarouselSlide>) => {
    setSlides(prev => prev.map((slide, i) =>
      i === index ? { ...slide, ...updates } : slide
    ));
  };

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(),
      type: 'content',
      title: 'Novo Slide',
      content: 'Adicione seu conteúdo aqui',
      icon: 'Lightbulb',
      order: slides.length,
      imagePrompt: 'Abstract educational concept with modern minimal design',
    };
    setSlides([...slides, newSlide]);
    setSelectedSlideIndex(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 2) {
      toast.error('Mínimo de 2 slides necessários');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (selectedSlideIndex >= newSlides.length) {
      setSelectedSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };

  // ==========================================
  // Caption & Hashtags Generation
  // ==========================================
  const handleGenerateCaption = async () => {
    if (!carousel) return;
    setIsExportLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'generate-caption',
          topic,
          slides,
        },
      });

      if (error) throw error;

      setCarousel(prev => prev ? { ...prev, caption: data.caption } : null);
      toast.success('Legenda gerada!');
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error('Erro ao gerar legenda');
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!config) return;
    setIsExportLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'generate-hashtags',
          topic,
          config,
        },
      });

      if (error) throw error;

      setCarousel(prev => prev ? { ...prev, hashtags: data.hashtags } : null);
      toast.success('Hashtags geradas!');
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast.error('Erro ao gerar hashtags');
    } finally {
      setIsExportLoading(false);
    }
  };

  // ==========================================
  // Reset to Wizard
  // ==========================================
  const handleNewCarousel = () => {
    setStep('wizard');
    setSlides([]);
    setCarousel(null);
    setQualityScore(null);
    setSelectedSlideIndex(0);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-background">
      {/* Generation Overlay - Futuristic */}
      <GenerationOverlay 
        progress={progress} 
        isVisible={progress.status !== 'idle' && progress.status !== 'complete'}
      />

      {/* Progress Bar (top) */}
      <AnimatePresence>
        {progress.status !== 'idle' && (
          <GenerationProgressBar progress={progress} />
        )}
      </AnimatePresence>

      {/* WIZARD STEP */}
      {step === 'wizard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8"
        >
          <CarouselWizard
            onComplete={handleGenerate}
            isGenerating={isGenerating}
          />
        </motion.div>
      )}

      {/* EDITOR STEP */}
      {step === 'editor' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 md:p-6"
        >
          {/* Header - Glass effect */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 p-4 rounded-xl glass-panel">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewCarousel}
                className="rounded-full hover-scale-micro"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{topic}</h1>
                <p className="text-sm text-muted-foreground">
                  {slides.length} slides • {config?.objective}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {qualityScore && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium neon-border ${
                    qualityScore.total >= 85
                      ? 'bg-green-500/20 text-green-400'
                      : qualityScore.total >= 70
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {qualityScore.total >= 85 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {qualityScore.total}%
                </motion.div>
              )}
              <Button
                variant="outline"
                onClick={handleNewCarousel}
                className="gap-2 hover-scale-micro"
              >
                <RefreshCw className="w-4 h-4" />
                Novo Carrossel
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Editor */}
            <div className="lg:col-span-3">
              <SlideEditor
                slides={slides}
                selectedSlideIndex={selectedSlideIndex}
                theme={theme}
                isGenerating={isGenerating}
                onSelectSlide={setSelectedSlideIndex}
                onUpdateSlide={handleUpdateSlide}
                onAddSlide={handleAddSlide}
                onDeleteSlide={handleDeleteSlide}
                onThemeChange={setTheme}
                onRegenerateImage={handleRegenerateImage}
                onImproveSlide={handleImproveSlide}
              />
            </div>

            {/* Center Panel - Canvas */}
            <div className="lg:col-span-6">
              <CarouselCanvas
                slides={slides}
                selectedSlideIndex={selectedSlideIndex}
                theme={theme}
                qualityScore={qualityScore || undefined}
                onSelectSlide={setSelectedSlideIndex}
              />
            </div>

            {/* Right Panel - Export */}
            <div className="lg:col-span-3">
              <ExportPanel
                carousel={carousel}
                onGenerateCaption={handleGenerateCaption}
                onGenerateHashtags={handleGenerateHashtags}
                isLoading={isExportLoading}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
