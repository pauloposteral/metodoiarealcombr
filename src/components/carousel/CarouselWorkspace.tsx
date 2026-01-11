import { useState } from 'react';
import { CarouselSidebar } from './CarouselSidebar';
import { CarouselPreview } from './CarouselPreview';
import { CarouselSlide, CarouselTheme, CAROUSEL_THEMES } from './types';
import { generateCarouselContent } from './carouselGenerator';
import { toast } from 'sonner';

export const CarouselWorkspace = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [theme, setTheme] = useState<CarouselTheme>(CAROUSEL_THEMES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  const handleGenerateCarousel = async (inputTopic: string, slideCount: number) => {
    if (!inputTopic.trim()) {
      toast.error('Digite um tema para gerar o carrossel');
      return;
    }

    setIsGenerating(true);
    setTopic(inputTopic);
    
    try {
      const generatedSlides = await generateCarouselContent(inputTopic, slideCount);
      setSlides(generatedSlides);
      setSelectedSlideIndex(0);
      toast.success('Carrossel gerado com sucesso!');
    } catch (error) {
      console.error('Error generating carousel:', error);
      toast.error('Erro ao gerar carrossel. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[calc(100vh-80px)]">
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
      />
      <CarouselPreview
        slides={slides}
        selectedSlideIndex={selectedSlideIndex}
        theme={theme}
        onSelectSlide={setSelectedSlideIndex}
      />
    </div>
  );
};
