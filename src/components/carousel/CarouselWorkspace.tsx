import { useState, useCallback } from 'react';
import { CarouselSidebar } from './CarouselSidebar';
import { CarouselPreview } from './CarouselPreview';
import { GenerationProgressBar } from './GenerationProgressBar';
import { CarouselSlide, CarouselTheme, CAROUSEL_THEMES, GenerationProgress } from './types';
import { generateCarouselContent, generateAllSlideImages, generateSlideImage } from './carouselGenerator';
import { toast } from 'sonner';

export const CarouselWorkspace = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [theme, setTheme] = useState<CarouselTheme>(CAROUSEL_THEMES[0]);
  const [topic, setTopic] = useState('');
  
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    status: 'idle',
    currentSlide: 0,
    totalSlides: 0,
    message: '',
  });

  const handleGenerateCarousel = async (inputTopic: string, slideCount: number) => {
    if (!inputTopic.trim()) {
      toast.error('Digite um tema para gerar o carrossel');
      return;
    }

    setTopic(inputTopic);
    
    // Step 1: Generate text content
    setGenerationProgress({
      status: 'generating-text',
      currentSlide: 0,
      totalSlides: slideCount,
      message: 'Criando roteiro e textos...',
    });

    try {
      const generatedSlides = await generateCarouselContent(inputTopic, slideCount);
      
      // Mark all slides as generating images
      const slidesWithImageLoading = generatedSlides.map(slide => ({
        ...slide,
        isGeneratingImage: true,
      }));
      
      setSlides(slidesWithImageLoading);
      setSelectedSlideIndex(0);
      
      // Step 2: Generate images for each slide
      setGenerationProgress({
        status: 'generating-images',
        currentSlide: 0,
        totalSlides: generatedSlides.length,
        message: `Gerando imagem 1 de ${generatedSlides.length}...`,
      });

      await generateAllSlideImages(
        generatedSlides,
        theme,
        (slideIndex, imageUrl) => {
          // Update slide with generated image
          setSlides(prev => prev.map((slide, i) => 
            i === slideIndex 
              ? { ...slide, imageUrl, isGeneratingImage: false }
              : slide
          ));
          
          setGenerationProgress(prev => ({
            ...prev,
            currentSlide: slideIndex + 1,
            message: slideIndex + 1 < generatedSlides.length 
              ? `Gerando imagem ${slideIndex + 2} de ${generatedSlides.length}...`
              : 'Finalizando...',
          }));
        },
        (slideIndex, error) => {
          // Mark slide as done generating (with error)
          setSlides(prev => prev.map((slide, i) => 
            i === slideIndex 
              ? { ...slide, isGeneratingImage: false }
              : slide
          ));
          toast.error(`Erro no slide ${slideIndex + 1}: ${error}`);
        }
      );

      setGenerationProgress({
        status: 'complete',
        currentSlide: generatedSlides.length,
        totalSlides: generatedSlides.length,
        message: 'Carrossel completo!',
      });
      
      toast.success('Carrossel gerado com sucesso!');
      
      // Reset progress after a delay
      setTimeout(() => {
        setGenerationProgress({
          status: 'idle',
          currentSlide: 0,
          totalSlides: 0,
          message: '',
        });
      }, 2000);

    } catch (error) {
      console.error('Error generating carousel:', error);
      toast.error('Erro ao gerar carrossel. Tente novamente.');
      setGenerationProgress({
        status: 'idle',
        currentSlide: 0,
        totalSlides: 0,
        message: '',
      });
    }
  };

  const handleRegenerateImage = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide) return;

    // Mark as generating
    setSlides(prev => prev.map((s, i) => 
      i === slideIndex ? { ...s, isGeneratingImage: true } : s
    ));

    toast.info(`Regenerando imagem do slide ${slideIndex + 1}...`);

    try {
      const themeColors = `${theme.name} - Primary: ${theme.primaryColor}, Accent: ${theme.accentColor}`;
      const imageUrl = await generateSlideImage(slide, themeColors);
      
      setSlides(prev => prev.map((s, i) => 
        i === slideIndex ? { ...s, imageUrl, isGeneratingImage: false } : s
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
      imagePrompt: 'Abstract educational concept with modern design',
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

  const handleReorderSlides = (startIndex: number, endIndex: number) => {
    const result = Array.from(slides);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setSlides(result.map((slide, i) => ({ ...slide, order: i })));
  };

  const isGenerating = generationProgress.status !== 'idle' && generationProgress.status !== 'complete';

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-80px)]">
      {/* Progress Bar */}
      {generationProgress.status !== 'idle' && (
        <GenerationProgressBar progress={generationProgress} />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <CarouselSidebar
          slides={slides}
          selectedSlideIndex={selectedSlideIndex}
          theme={theme}
          topic={topic}
          isGenerating={isGenerating}
          onSelectSlide={setSelectedSlideIndex}
          onUpdateSlide={handleUpdateSlide}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onReorderSlides={handleReorderSlides}
          onThemeChange={setTheme}
          onGenerate={handleGenerateCarousel}
          onRegenerateImage={handleRegenerateImage}
        />
        <CarouselPreview
          slides={slides}
          selectedSlideIndex={selectedSlideIndex}
          theme={theme}
          onSelectSlide={setSelectedSlideIndex}
        />
      </div>
    </div>
  );
};
