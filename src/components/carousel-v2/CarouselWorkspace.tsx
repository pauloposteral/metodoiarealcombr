import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselWizard } from './CarouselWizard';
import { CarouselCanvas } from './CarouselCanvas';
import { SlideEditor } from './SlideEditor';
import { ExportPanel } from './ExportPanel';
import { CarouselHistory } from './CarouselHistory';
import { FolderManager } from './FolderManager';
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog';
import { ShareLinkButton } from './ShareLinkButton';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { OnboardingTour } from './OnboardingTour';
import { BrandKitManager } from './BrandKitManager';
import { CommunityTemplates } from './CommunityTemplates';
import { WorkflowBoard } from './WorkflowBoard';
import { MultiSelectToolbar } from './MultiSelectToolbar';
import { useCarouselPersistence, SavedCarousel } from '@/hooks/useCarouselPersistence';
import { arrayMove } from '@dnd-kit/sortable';
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
  CarouselFormat,
  FORMAT_DIMENSIONS,
  TEMPLATE_PRESETS,
  GOOGLE_FONTS,
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, RefreshCw, ChevronLeft, Download, 
  Sparkles, AlertTriangle, CheckCircle2, Maximize2, Minimize2,
  Languages, RotateCcw, TestTube2, Moon, Sun, Undo2, Redo2, Type,
  HelpCircle, RectangleVertical, Square, Copy, Save, BookmarkPlus, Image as ImageIcon,
  Mic, Search, Smile, FileText, Brain, Clock, Accessibility, UserCircle, Shuffle, Lightbulb
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkEditor, setIsDarkEditor] = useState(true);
  const [abHooks, setAbHooks] = useState<any[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [slidesHistory, setSlidesHistory] = useState<CarouselSlide[][]>([]);
  const [slidesRedoStack, setSlidesRedoStack] = useState<CarouselSlide[][]>([]);
  const [carouselFormat, setCarouselFormat] = useState<CarouselFormat>('4:5');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [competitorHandle, setCompetitorHandle] = useState('');
  const [voicePersonInput, setVoicePersonInput] = useState('');
  const [clicheResults, setClicheResults] = useState<any>(null);
  const [readabilityResults, setReadabilityResults] = useState<any>(null);
  const [ctaSuggestions, setCtaSuggestions] = useState<any[]>([]);
  const [variationsResults, setVariationsResults] = useState<any[]>([]);
  const [postingTimeResults, setPostingTimeResults] = useState<any>(null);
  const [psychologyResults, setPsychologyResults] = useState<any>(null);
  const persistence = useCarouselPersistence();

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
    setSlidesHistory(h => [...h.slice(-29), slides]);
    setSlidesRedoStack([]);
    setSlides(prev => prev.map((slide, i) =>
      i === index ? { ...slide, ...updates } : slide
    ));
  };

  // #12 Inline WYSIWYG editing from canvas
  const handleInlineEdit = useCallback((field: 'title' | 'content' | 'subtitle', value: string) => {
    handleUpdateSlide(selectedSlideIndex, { [field]: value });
  }, [selectedSlideIndex, slides]);

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

  const handleReorderSlides = (startIndex: number, endIndex: number) => {
    setSlides(prev => {
      const reordered = arrayMove(prev, startIndex, endIndex);
      return reordered.map((slide, i) => ({ ...slide, order: i }));
    });
    setSelectedSlideIndex(endIndex);
  };

  // Auto-save when slides change
  useEffect(() => {
    if (carousel && slides.length > 0 && step === 'editor' && !isGenerating) {
      persistence.scheduleAutoSave(carousel, slides, theme, config, qualityScore);
    }
  }, [slides, carousel, theme, step, isGenerating]);

  // Save carousel manually
  const handleSave = useCallback(async () => {
    if (!carousel || slides.length === 0) return;
    await persistence.saveCarousel(carousel, slides, theme, config, qualityScore);
    toast.success('Carrossel salvo!');
  }, [carousel, slides, theme, config, qualityScore, persistence]);

  // Load a saved carousel
  const handleLoadCarousel = useCallback((saved: SavedCarousel) => {
    setSlides(saved.slides as CarouselSlide[]);
    setTopic(saved.topic);
    setConfig(saved.config as CarouselConfig | null);
    setTheme(saved.theme as CarouselTheme || CAROUSEL_THEMES[0]);
    setQualityScore(saved.quality_score as QualityScore | null);
    setCarousel({
      id: saved.id,
      topic: saved.topic,
      config: saved.config as CarouselConfig,
      slides: saved.slides as CarouselSlide[],
      theme: saved.theme as CarouselTheme || CAROUSEL_THEMES[0],
      createdAt: new Date(saved.created_at),
      caption: saved.caption || undefined,
      hashtags: saved.hashtags || undefined,
      alternativeTitle: saved.alternative_title || undefined,
      firstComment: saved.first_comment || undefined,
    });
    persistence.setCurrentSavedId(saved.id);
    setSelectedSlideIndex(0);
    setStep('editor');
  }, [persistence]);

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
  // #4 Rewrite Carousel
  // ==========================================
  const handleRewriteCarousel = async () => {
    if (!config || slides.length === 0) return;
    setIsRewriting(true);
    toast.info('Reescrevendo carrossel com IA...');

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'rewrite-carousel', slides, config, topic },
      });
      if (error) throw error;

      setSlides(prev => prev.map((s, i) => ({
        ...s,
        ...(data.slides[i] || {}),
      })));
      toast.success('Carrossel reescrito!');
    } catch (error) {
      console.error('Rewrite error:', error);
      toast.error('Erro ao reescrever');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #5 Translate Carousel
  // ==========================================
  const handleTranslate = async (targetLang: string) => {
    if (slides.length === 0) return;
    setIsRewriting(true);
    toast.info(`Traduzindo para ${targetLang === 'en' ? 'inglês' : targetLang === 'es' ? 'espanhol' : targetLang}...`);

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'translate-carousel', slides, targetLang },
      });
      if (error) throw error;

      setSlides(prev => prev.map((s, i) => ({
        ...s,
        ...(data.slides[i] || {}),
      })));
      toast.success('Carrossel traduzido!');
    } catch (error) {
      console.error('Translate error:', error);
      toast.error('Erro ao traduzir');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #9 A/B Test Hooks
  // ==========================================
  const handleGenerateABHooks = async () => {
    if (!config) return;
    setIsRewriting(true);
    toast.info('Gerando variações A/B de capa...');

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'ab-hooks', topic, config },
      });
      if (error) throw error;

      setAbHooks(data.hooks || []);
      toast.success(`${data.hooks?.length || 0} variações geradas!`);
    } catch (error) {
      console.error('AB hooks error:', error);
      toast.error('Erro ao gerar variações');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleApplyABHook = (hook: any) => {
    setSlides(prev => prev.map((s, i) => 
      i === 0 ? { ...s, title: hook.title, subtitle: hook.subtitle || s.subtitle } : s
    ));
    toast.success('Hook aplicado!');
  };

  // ==========================================
  // #7 Generate from Transcript (Audio/Video)
  // ==========================================
  const handleGenerateFromTranscript = async (transcript: string) => {
    if (!transcript.trim()) {
      toast.error('Cole a transcrição do áudio/vídeo');
      return;
    }
    const defaultConfig: CarouselConfig = config || {
      objective: 'educar',
      audience: { level: 'intermediario', niche: 'geral', tone: 'humano' },
      format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' },
    };
    await handleGenerate(defaultConfig, `Baseado nesta transcrição de áudio/vídeo, crie um carrossel educativo:\n\n${transcript.slice(0, 3000)}`);
  };

  // ==========================================
  // #10 Competitor Analysis by @
  // ==========================================
  const handleCompetitorAnalysis = async (handle: string) => {
    if (!handle.trim()) {
      toast.error('Digite o @ do perfil para analisar');
      return;
    }
    setIsRewriting(true);
    toast.info(`Analisando @${handle.replace('@', '')}...`);

    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: {
          action: 'suggest-ideas',
          config: config || {
            objective: 'educar',
            audience: { level: 'intermediario', niche: handle.replace('@', ''), tone: 'humano' },
            format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' },
          },
          topic: `Analisar o estilo de conteúdo do perfil @${handle.replace('@', '')} e sugerir carrosséis no mesmo estilo mas com abordagem única`,
        },
      });

      if (error) throw error;
      toast.success(`Ideias baseadas em @${handle.replace('@', '')} geradas!`);
      // The ideas are shown through the wizard suggest-ideas flow
    } catch (error) {
      console.error('Competitor analysis error:', error);
      toast.error('Erro na análise de concorrência');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #61 Detect Clichés
  // ==========================================
  const handleDetectCliches = async () => {
    if (slides.length === 0) return;
    setIsRewriting(true);
    toast.info('Analisando clichês e frases fracas...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'detect-cliches', slides },
      });
      if (error) throw error;
      setClicheResults(data);
      toast.success(`Análise concluída! Score: ${data.overallScore}/100`);
    } catch (error) {
      console.error('Cliche detection error:', error);
      toast.error('Erro ao analisar clichês');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #62 Suggest CTA
  // ==========================================
  const handleSuggestCTA = async () => {
    if (!config) return;
    setIsRewriting(true);
    toast.info('Gerando sugestões de CTA...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'suggest-cta', topic, config },
      });
      if (error) throw error;
      setCtaSuggestions(data.ctas || []);
      toast.success(`${data.ctas?.length || 0} CTAs sugeridos!`);
    } catch (error) {
      console.error('CTA suggestion error:', error);
      toast.error('Erro ao sugerir CTAs');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #63 Readability Score
  // ==========================================
  const handleReadabilityScore = async () => {
    if (slides.length === 0) return;
    setIsRewriting(true);
    toast.info('Analisando legibilidade...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'readability-score', slides },
      });
      if (error) throw error;
      setReadabilityResults(data);
      toast.success(`Legibilidade média: ${data.averageScore}/100`);
    } catch (error) {
      console.error('Readability error:', error);
      toast.error('Erro ao analisar legibilidade');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #66 Suggest Emojis
  // ==========================================
  const handleSuggestEmojis = async () => {
    if (slides.length === 0) return;
    setIsRewriting(true);
    toast.info('Sugerindo emojis estratégicos...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'suggest-emojis', slides },
      });
      if (error) throw error;
      // Apply emojis to slides
      if (data.slides) {
        setSlides(prev => prev.map((s, i) => {
          const emojiData = data.slides.find((e: any) => e.slideIndex === i);
          if (!emojiData) return s;
          const newTitle = emojiData.titleEmoji ? `${emojiData.titleEmoji} ${s.title}` : s.title;
          return { ...s, title: newTitle };
        }));
      }
      toast.success('Emojis aplicados aos slides!');
    } catch (error) {
      console.error('Emoji suggestion error:', error);
      toast.error('Erro ao sugerir emojis');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #68 Rewrite in Specific Voice
  // ==========================================
  const handleRewriteVoice = async (voicePerson: string) => {
    if (!voicePerson.trim() || slides.length === 0) return;
    setIsRewriting(true);
    toast.info(`Reescrevendo no tom de ${voicePerson}...`);
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'rewrite-voice', slides, voicePerson },
      });
      if (error) throw error;
      setSlides(prev => prev.map((s, i) => ({
        ...s,
        ...(data.slides?.[i] || {}),
      })));
      toast.success(`Reescrito no tom de ${voicePerson}!`);
    } catch (error) {
      console.error('Voice rewrite error:', error);
      toast.error('Erro ao reescrever');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #69 Refine Prompt
  // ==========================================
  const handleRefinePrompt = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setIsRewriting(true);
    toast.info('Refinando prompt...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'refine-prompt', userPrompt, config: config || { objective: 'educar', audience: { level: 'intermediario', niche: '', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } } },
      });
      if (error) throw error;
      if (data.refinements?.[0]) {
        setTopic(data.refinements[0].prompt);
      }
      toast.success('Prompt refinado! Escolha a melhor versão.');
    } catch (error) {
      console.error('Prompt refinement error:', error);
      toast.error('Erro ao refinar prompt');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #70 Generate Variations
  // ==========================================
  const handleGenerateVariations = async () => {
    if (!config) return;
    setIsRewriting(true);
    toast.info('Gerando 3 variações do carrossel...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'generate-variations', topic, config },
      });
      if (error) throw error;
      setVariationsResults(data.variations || []);
      toast.success(`${data.variations?.length || 0} variações geradas!`);
    } catch (error) {
      console.error('Variations error:', error);
      toast.error('Erro ao gerar variações');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #74 Sequence by Psychology
  // ==========================================
  const handleSequencePsychology = async () => {
    if (slides.length === 0 || !config) return;
    setIsRewriting(true);
    toast.info('Analisando sequência por psicologia...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'sequence-psychology', slides, config },
      });
      if (error) throw error;
      setPsychologyResults(data);
      // Apply the suggested order
      if (data.suggestedOrder && Array.isArray(data.suggestedOrder)) {
        const reordered = data.suggestedOrder.map((idx: number) => slides[idx]).filter(Boolean);
        if (reordered.length === slides.length) {
          setSlides(reordered.map((s: any, i: number) => ({ ...s, order: i })));
          toast.success('Slides reordenados por psicologia!');
        }
      }
    } catch (error) {
      console.error('Psychology sequence error:', error);
      toast.error('Erro na análise psicológica');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #58 Suggest Posting Time
  // ==========================================
  const handleSuggestPostingTime = async () => {
    if (!config) return;
    setIsRewriting(true);
    toast.info('Calculando melhor horário...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'suggest-posting-time', config },
      });
      if (error) throw error;
      setPostingTimeResults(data);
      const best = data.bestTimes?.[0];
      if (best) {
        toast.success(`Melhor horário: ${best.day} às ${best.time} (Score: ${best.score})`);
      }
    } catch (error) {
      console.error('Posting time error:', error);
      toast.error('Erro ao sugerir horário');
    } finally {
      setIsRewriting(false);
    }
  };

  // ==========================================
  // #59 Generate Alt Text
  // ==========================================
  const handleGenerateAltText = async () => {
    if (slides.length === 0) return;
    setIsRewriting(true);
    toast.info('Gerando alt-text acessível...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'generate-alt-text', slides },
      });
      if (error) throw error;
      if (data.altTexts) {
        setSlides(prev => prev.map((s, i) => {
          const alt = data.altTexts.find((a: any) => a.slideIndex === i);
          return alt ? { ...s, altText: alt.altText } : s;
        }));
      }
      toast.success('Alt-text gerado para todos os slides!');
    } catch (error) {
      console.error('Alt text error:', error);
      toast.error('Erro ao gerar alt-text');
    } finally {
      setIsRewriting(false);
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
  // Hotkeys
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only in editor mode
      if (step !== 'editor') return;

      // Don't intercept if typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Arrow keys to navigate slides
      if (e.key === 'ArrowLeft' && selectedSlideIndex > 0) {
        e.preventDefault();
        setSelectedSlideIndex(prev => prev - 1);
      }
      if (e.key === 'ArrowRight' && selectedSlideIndex < slides.length - 1) {
        e.preventDefault();
        setSelectedSlideIndex(prev => prev + 1);
      }

      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (slidesHistory.length > 0) {
          const prev = slidesHistory[slidesHistory.length - 1];
          setSlidesRedoStack(stack => [slides, ...stack]);
          setSlidesHistory(h => h.slice(0, -1));
          setSlides(prev);
          toast.info('Desfazer');
        }
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (slidesRedoStack.length > 0) {
          const next = slidesRedoStack[0];
          setSlidesHistory(h => [...h, slides]);
          setSlidesRedoStack(stack => stack.slice(1));
          setSlides(next);
          toast.info('Refazer');
        }
      }

      // Ctrl+N / Cmd+N - New carousel
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewCarousel();
      }

      // Escape - Exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }

      // F - Toggle fullscreen
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedSlideIndex, slides.length]);

  // ==========================================
  // Copy All for Instagram
  // ==========================================
  const handleCopyAllForInstagram = useCallback(() => {
    if (!carousel) return;

    const parts: string[] = [];

    // Caption
    if (carousel.caption) {
      parts.push(carousel.caption);
    }

    // Hashtags
    if (carousel.hashtags && carousel.hashtags.length > 0) {
      parts.push('\n' + carousel.hashtags.join(' '));
    }

    // First comment
    if (carousel.firstComment) {
      parts.push('\n---\n📝 Primeiro comentário:\n' + carousel.firstComment);
    }

    const fullText = parts.join('\n');
    navigator.clipboard.writeText(fullText);
    toast.success('Legenda + hashtags + 1º comentário copiados!');
  }, [carousel]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div data-theme={isDarkEditor ? 'dark' : 'light'} className={`transition-colors duration-300 bg-background text-foreground ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : 'min-h-screen'} ${!isDarkEditor ? '[&]:bg-slate-50 [&]:text-slate-900' : ''}`}>
      {/* Onboarding Tour (#48) */}
      <OnboardingTour forceShow={showOnboarding} onClose={() => setShowOnboarding(false)} />

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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <CarouselWizard
                onComplete={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
            <div>
              {/* #7 Audio/Video Transcript */}
              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-accent" />
                  Gerar de Áudio/Vídeo
                </h4>
                <Textarea
                  placeholder="Cole aqui a transcrição do seu áudio ou vídeo..."
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  rows={3}
                  className="text-sm mb-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => handleGenerateFromTranscript(transcriptText)}
                  disabled={isGenerating || !transcriptText.trim()}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar Carrossel da Transcrição
                </Button>
              </Card>

              {/* #10 Competitor Analysis */}
              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-accent" />
                  Análise de Concorrência
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="@perfil"
                    value={competitorHandle}
                    onChange={(e) => setCompetitorHandle(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompetitorAnalysis(competitorHandle)}
                    disabled={isRewriting || !competitorHandle.trim()}
                  >
                    Analisar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Gera ideias de carrossel inspiradas no estilo do perfil
                </p>
              </Card>

              {/* Brand Kit Manager */}
              <Card className="p-4 mb-4 glass-panel border-border">
                <BrandKitManager
                  compact
                  onApplyBrandKit={(kit) => {
                    setTheme(prev => ({
                      ...prev,
                      primaryColor: kit.primary_color,
                      secondaryColor: kit.secondary_color,
                      accentColor: kit.accent_color,
                      backgroundColor: kit.background_color,
                      textColor: kit.text_color,
                      fontFamily: GOOGLE_FONTS.find(f => f.name === kit.font_title)?.family || prev.fontFamily,
                    }));
                    toast.success(`Brand Kit "${kit.name}" aplicado ao tema!`);
                  }}
                />
              </Card>

              {/* Community Templates */}
              <CommunityTemplates
                onLoadTemplate={(newSlides, newTheme, newConfig) => {
                  setSlides(newSlides);
                  setTheme(newTheme);
                  if (newConfig) setConfig(newConfig);
                  setStep('editor');
                  toast.success('Template carregado!');
                }}
              />

              <div className="mt-4" />
              <FolderManager
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
              <h3 className="font-semibold mt-4 mb-4 text-lg">📂 Seus Carrosséis</h3>
              <CarouselHistory
                carousels={selectedFolderId
                  ? persistence.savedCarousels.filter((c: any) => c.folder_id === selectedFolderId)
                  : persistence.savedCarousels
                }
                isLoading={persistence.isLoading}
                onLoad={handleLoadCarousel}
                onDelete={persistence.deleteCarousel}
                onDuplicate={persistence.duplicateCarousel}
                onNewCarousel={handleNewCarousel}
              />
            </div>
            {/* #51-54 Analytics + Workflow */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">📋 Workflow</h3>
              <WorkflowBoard
                onOpenCarousel={(id) => {
                  const carousel = persistence.savedCarousels.find((c: any) => c.id === id);
                  if (carousel) handleLoadCarousel(carousel);
                }}
              />
              <h3 className="font-semibold mt-6 mb-4 text-lg">📊 Métricas</h3>
              <AnalyticsDashboard />
            </div>
          </div>
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

            {/* Undo/Redo + Format + Watermark + Dark/Light */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (slidesHistory.length > 0) {
                    const prev = slidesHistory[slidesHistory.length - 1];
                    setSlidesRedoStack(stack => [slides, ...stack]);
                    setSlidesHistory(h => h.slice(0, -1));
                    setSlides(prev);
                  }
                }}
                disabled={slidesHistory.length === 0}
                className="h-8 w-8"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (slidesRedoStack.length > 0) {
                    const next = slidesRedoStack[0];
                    setSlidesHistory(h => [...h, slides]);
                    setSlidesRedoStack(stack => stack.slice(1));
                    setSlides(next);
                  }
                }}
                disabled={slidesRedoStack.length === 0}
                className="h-8 w-8"
                title="Refazer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>

              {/* #30 Format Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                <Button
                  variant={carouselFormat === '4:5' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setCarouselFormat('4:5')}
                >
                  <Square className="w-3 h-3" />
                  4:5
                </Button>
                <Button
                  variant={carouselFormat === '9:16' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setCarouselFormat('9:16')}
                >
                  <RectangleVertical className="w-3 h-3" />
                  9:16
                </Button>
              </div>

              <Input
                placeholder="@watermark"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-32 h-8 text-xs"
              />

              {/* #47 Dark/Light Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDarkEditor(prev => !prev)}
                title={isDarkEditor ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkEditor ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* AI Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRewriteCarousel}
                disabled={isRewriting}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reescrever
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isRewriting} className="gap-1.5 text-xs">
                    <Languages className="w-3.5 h-3.5" />
                    Traduzir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleTranslate('en')}>🇺🇸 English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTranslate('es')}>🇪🇸 Español</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTranslate('fr')}>🇫🇷 Français</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateABHooks}
                disabled={isRewriting}
                className="gap-1.5 text-xs"
              >
                <TestTube2 className="w-3.5 h-3.5" />
                A/B Hooks
              </Button>

              {/* New AI Advanced Features */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isRewriting} className="gap-1.5 text-xs">
                    <Brain className="w-3.5 h-3.5" />
                    IA Avançada
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={handleDetectCliches} className="gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Detector de Clichês</p>
                      <p className="text-xs text-muted-foreground">Encontra frases fracas</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuggestCTA} className="gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Sugerir CTAs</p>
                      <p className="text-xs text-muted-foreground">5 CTAs personalizados</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReadabilityScore} className="gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Score de Legibilidade</p>
                      <p className="text-xs text-muted-foreground">Análise por slide</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuggestEmojis} className="gap-2">
                    <Smile className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Emojis Estratégicos</p>
                      <p className="text-xs text-muted-foreground">Aplica emojis inteligentes</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGenerateVariations} className="gap-2">
                    <Shuffle className="w-4 h-4" />
                    <div>
                      <p className="font-medium">3 Variações</p>
                      <p className="text-xs text-muted-foreground">Abordagens diferentes</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSequencePsychology} className="gap-2">
                    <Brain className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Sequência Psicológica</p>
                      <p className="text-xs text-muted-foreground">Ordem ideal por atenção</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuggestPostingTime} className="gap-2">
                    <Clock className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Melhor Horário</p>
                      <p className="text-xs text-muted-foreground">Horário ideal por nicho</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGenerateAltText} className="gap-2">
                    <Accessibility className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Alt-Text Acessível</p>
                      <p className="text-xs text-muted-foreground">Texto acessível por slide</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* #68 Voice Rewrite */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isRewriting} className="gap-1.5 text-xs">
                    <UserCircle className="w-3.5 h-3.5" />
                    Tom de Voz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-3 w-56">
                  <p className="text-xs font-medium mb-2">Reescrever no tom de:</p>
                  <div className="flex gap-1">
                    <Input
                      placeholder="Ex: Ícaro de Carvalho"
                      value={voicePersonInput}
                      onChange={(e) => setVoicePersonInput(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 text-xs" 
                      onClick={() => handleRewriteVoice(voicePersonInput)}
                      disabled={!voicePersonInput.trim()}
                    >
                      Ir
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Gary Vee', 'Seth Godin', 'Ícaro de Carvalho', 'Thiago Nigro'].map(name => (
                      <Button key={name} variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleRewriteVoice(name)}>
                        {name}
                      </Button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* #27 Save as Template */}
              <SaveAsTemplateDialog
                slides={slides}
                theme={theme}
                config={config}
                topic={topic}
              />

              {/* #38 Share Link */}
              <ShareLinkButton carouselId={persistence.currentSavedId} />
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
              {persistence.isSaving && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Salvando...
                </span>
              )}
              <Button
                variant="outline"
                onClick={handleSave}
                className="gap-2 hover-scale-micro"
                disabled={persistence.isSaving}
              >
                <Download className="w-4 h-4" />
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowOnboarding(true)}
                title="Tour de ajuda"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleNewCarousel}
                className="gap-2 hover-scale-micro"
              >
                <RefreshCw className="w-4 h-4" />
                Novo
              </Button>
            </div>
          </div>

          {/* A/B Hooks Panel */}
          {abHooks.length > 0 && (
            <div className="mb-4 p-4 rounded-xl glass-panel">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-accent" />
                  Variações A/B de Capa
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setAbHooks([])}>✕</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {abHooks.map((hook: any) => (
                  <Card
                    key={hook.id}
                    className="p-3 cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all"
                    onClick={() => handleApplyABHook(hook)}
                  >
                    <p className="font-bold text-sm">{hook.title}</p>
                    {hook.subtitle && <p className="text-xs text-muted-foreground mt-1">{hook.subtitle}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{hook.approach}</span>
                      <span className="text-xs text-muted-foreground">Score: {hook.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{hook.reasoning}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quality Issues Inline (#49) */}
          {qualityScore?.issues && qualityScore.issues.length > 0 && (
            <div className="mb-4 p-4 rounded-xl glass-panel">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Feedback de Qualidade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {qualityScore.issues.map((issue: any) => (
                  <div key={issue.id} className={`p-3 rounded-lg text-xs ${
                    issue.type === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    <p className="font-medium">{issue.type === 'error' ? '❌' : '⚠️'} Slide {(issue.slideIndex || 0) + 1}: {issue.message}</p>
                    <p className="text-muted-foreground mt-1">💡 {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-12'}`}>
            {/* Left Panel - Editor */}
            <div className={`${isFullscreen ? 'hidden' : 'lg:col-span-3'}`}>
              <SlideEditor
                slides={slides}
                selectedSlideIndex={selectedSlideIndex}
                theme={theme}
                isGenerating={isGenerating}
                onSelectSlide={setSelectedSlideIndex}
                onUpdateSlide={handleUpdateSlide}
                onAddSlide={handleAddSlide}
                onDeleteSlide={handleDeleteSlide}
                onReorderSlides={handleReorderSlides}
                onThemeChange={setTheme}
                onRegenerateImage={handleRegenerateImage}
                onImproveSlide={handleImproveSlide}
              />
            </div>

            {/* Center Panel - Canvas */}
            <div className={`${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-6'}`}>
              <CarouselCanvas
                slides={slides}
                selectedSlideIndex={selectedSlideIndex}
                theme={theme}
                qualityScore={qualityScore || undefined}
                onSelectSlide={setSelectedSlideIndex}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                watermark={watermarkText}
                format={carouselFormat}
                onInlineEdit={handleInlineEdit}
              />
            </div>

            {/* Right Panel - Export */}
            <div className={`${isFullscreen ? 'hidden' : 'lg:col-span-3'}`}>
              <ExportPanel
                carousel={carousel}
                onGenerateCaption={handleGenerateCaption}
                onGenerateHashtags={handleGenerateHashtags}
                onCopyAllForInstagram={handleCopyAllForInstagram}
                isLoading={isExportLoading}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
