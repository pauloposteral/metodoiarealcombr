import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryCanvas } from './StoryCanvas';
import { StoryEditor } from './StoryEditor';
import { 
  StorySlide, 
  StoryStyle, 
  StoryType, 
  STORY_TEMPLATES,
  STORY_STYLES 
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, RefreshCw, ChevronLeft, Plus,
  Loader2, CheckCircle2
} from 'lucide-react';

export const StoriesWorkspace = () => {
  const [slides, setSlides] = useState<StorySlide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  // Create new slide
  const handleAddSlide = useCallback(() => {
    const newSlide: StorySlide = {
      id: crypto.randomUUID(),
      prompt: '',
      style: 'editorial',
      type: 'lifestyle',
      order: slides.length,
    };
    setSlides(prev => [...prev, newSlide]);
    setSelectedIndex(slides.length);
  }, [slides.length]);

  // Delete slide
  const handleDeleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) {
      setSlides([]);
      setSelectedIndex(0);
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (selectedIndex >= newSlides.length) {
      setSelectedIndex(Math.max(0, newSlides.length - 1));
    }
  }, [slides, selectedIndex]);

  // Update slide
  const handleUpdateSlide = useCallback((index: number, updates: Partial<StorySlide>) => {
    setSlides(prev => prev.map((slide, i) => 
      i === index ? { ...slide, ...updates } : slide
    ));
  }, []);

  // Generate image for a slide
  const handleGenerateImage = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide || !slide.prompt.trim()) {
      toast.error('Adicione uma descrição para gerar a imagem');
      return;
    }

    setIsGenerating(true);
    handleUpdateSlide(slideIndex, { isGenerating: true });

    try {
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: {
          prompt: slide.prompt,
          storyType: slide.type,
          style: slide.style,
          aspectRatio: '9:16',
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      handleUpdateSlide(slideIndex, { 
        imageUrl: data.imageUrl, 
        isGenerating: false 
      });
      
      setGeneratedCount(prev => prev + 1);
      toast.success('Imagem gerada com sucesso! ✨');
    } catch (error) {
      console.error('Generation error:', error);
      handleUpdateSlide(slideIndex, { isGenerating: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar imagem';
      if (errorMessage.includes('Rate limit')) {
        toast.error('Muitas requisições. Aguarde alguns segundos.');
      } else if (errorMessage.includes('Payment') || errorMessage.includes('Credits')) {
        toast.error('Créditos necessários. Adicione créditos para continuar.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [slides, handleUpdateSlide]);

  // Apply template
  const handleApplyTemplate = useCallback((templateId: string) => {
    const template = STORY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newSlides: StorySlide[] = template.slides.map((slideTemplate, index) => ({
      id: crypto.randomUUID(),
      prompt: slideTemplate.prompt || '',
      style: slideTemplate.style || 'editorial',
      type: slideTemplate.type || 'lifestyle',
      order: index,
    }));

    setSlides(newSlides);
    setSelectedIndex(0);
    toast.success(`Template "${template.name}" aplicado!`);
  }, []);

  // Generate all pending images
  const handleGenerateAll = useCallback(async () => {
    const pendingSlides = slides.filter(s => !s.imageUrl && s.prompt.trim());
    
    if (pendingSlides.length === 0) {
      toast.info('Todos os stories já têm imagens');
      return;
    }

    setIsGenerating(true);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.imageUrl && slide.prompt.trim()) {
        await handleGenerateImage(i);
        // Small delay between requests
        if (i < slides.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setIsGenerating(false);
  }, [slides, handleGenerateImage]);

  // Reset workspace
  const handleNewProject = useCallback(() => {
    setSlides([]);
    setSelectedIndex(0);
    setGeneratedCount(0);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 p-4 rounded-xl glass-panel"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-gold-light">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Stories Creator</h1>
            <p className="text-sm text-muted-foreground">
              {slides.length > 0 
                ? `${slides.length} stories • ${generatedCount} gerados`
                : 'Crie stories incríveis com IA'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {slides.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleNewProject}
                className="gap-2 hover-scale-micro"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Projeto</span>
              </Button>
              
              {slides.some(s => !s.imageUrl && s.prompt.trim()) && (
                <Button
                  onClick={handleGenerateAll}
                  disabled={isGenerating}
                  className="gap-2 bg-gradient-to-r from-accent to-gold-light btn-shimmer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Todos
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Editor */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          <StoryEditor
            slides={slides}
            selectedIndex={selectedIndex}
            isGenerating={isGenerating}
            onSelectSlide={setSelectedIndex}
            onUpdateSlide={handleUpdateSlide}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onGenerateImage={handleGenerateImage}
            onApplyTemplate={handleApplyTemplate}
          />
        </motion.div>

        {/* Center/Right Panel - Canvas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8"
        >
          <StoryCanvas
            slides={slides}
            selectedIndex={selectedIndex}
            onSelectSlide={setSelectedIndex}
          />
        </motion.div>
      </div>

      {/* Quick action FAB when no slides */}
      <AnimatePresence>
        {slides.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-8 right-8"
          >
            <Button
              size="lg"
              onClick={handleAddSlide}
              className="h-14 px-6 gap-2 rounded-full bg-gradient-to-r from-accent to-gold-light shadow-lg glow-accent btn-shimmer"
            >
              <Plus className="w-5 h-5" />
              Criar Story
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};