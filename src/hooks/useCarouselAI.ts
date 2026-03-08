import { useState, useCallback } from 'react';
import { CarouselSlide, CarouselTheme, CarouselConfig, CarouselData, QualityScore, GenerationProgress, CAROUSEL_THEMES } from '@/components/carousel-v2/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseCarouselAIProps {
  slides: CarouselSlide[];
  setSlides: React.Dispatch<React.SetStateAction<CarouselSlide[]>>;
  config: CarouselConfig | null;
  topic: string;
  setTopic: (t: string) => void;
  theme: CarouselTheme;
  setTheme: React.Dispatch<React.SetStateAction<CarouselTheme>>;
  setCarousel: React.Dispatch<React.SetStateAction<CarouselData | null>>;
  setStep: (step: 'wizard' | 'editor') => void;
  setSelectedSlideIndex: (i: number) => void;
  setQualityScore: (q: QualityScore | null) => void;
}

export const useCarouselAI = ({
  slides, setSlides, config, topic, setTopic,
  theme, setTheme, setCarousel, setStep,
  setSelectedSlideIndex, setQualityScore,
}: UseCarouselAIProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [abHooks, setAbHooks] = useState<any[]>([]);
  const [clicheResults, setClicheResults] = useState<any>(null);
  const [readabilityResults, setReadabilityResults] = useState<any>(null);
  const [ctaSuggestions, setCtaSuggestions] = useState<any[]>([]);
  const [variationsResults, setVariationsResults] = useState<any[]>([]);
  const [postingTimeResults, setPostingTimeResults] = useState<any>(null);
  const [psychologyResults, setPsychologyResults] = useState<any>(null);
  const [languageResults, setLanguageResults] = useState<any>(null);

  const [progress, setProgress] = useState<GenerationProgress>({
    status: 'idle', currentSlide: 0, totalSlides: 0, message: '', percentage: 0,
  });

  const generateAllSlideImages = async (slidesToGenerate: CarouselSlide[], currentTheme: CarouselTheme) => {
    const themeColors = `${currentTheme.name} - Primary: ${currentTheme.primaryColor}, Accent: ${currentTheme.accentColor}`;
    for (let i = 0; i < slidesToGenerate.length; i++) {
      const slide = slidesToGenerate[i];
      setProgress(prev => ({
        ...prev, currentSlide: i + 1,
        message: `Gerando imagem ${i + 1} de ${slidesToGenerate.length}...`,
        percentage: 30 + ((i + 1) / slidesToGenerate.length) * 60,
      }));
      try {
        const { data, error } = await supabase.functions.invoke('generate-slide-image', {
          body: { prompt: slide.imagePrompt || `Educational visual for: ${slide.title}`, slideType: slide.type, themeColors },
        });
        if (error) throw error;
        setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s));
        if (i < slidesToGenerate.length - 1) await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error generating image for slide ${i}:`, error);
        setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, isGeneratingImage: false } : s));
        toast.error(`Erro na imagem do slide ${i + 1}`);
      }
    }
  };

  const handleGenerate = async (newConfig: CarouselConfig, newTopic: string) => {
    setIsGenerating(true);
    const styleThemes = CAROUSEL_THEMES.filter(t => t.category === newConfig.format.style);
    const selectedTheme = styleThemes[0] || CAROUSEL_THEMES[0];
    setTheme(selectedTheme);
    try {
      setProgress({ status: 'generating-script', currentSlide: 0, totalSlides: newConfig.format.slideCount, message: 'Criando roteiro e textos...', percentage: 15 });
      const { data, error } = await supabase.functions.invoke('carousel-engine', {
        body: { action: 'generate-carousel', topic: newTopic, config: newConfig },
      });
      if (error) throw error;
      const generatedSlides = data.slides.map((slide: CarouselSlide) => ({ ...slide, isGeneratingImage: true }));
      setSlides(generatedSlides);
      setCarousel({
        id: crypto.randomUUID(), topic: newTopic, config: newConfig, slides: generatedSlides,
        theme: selectedTheme, createdAt: new Date(), caption: data.caption,
        hashtags: data.hashtags, alternativeTitle: data.alternativeTitle, firstComment: data.firstComment,
      });
      setStep('editor');
      setSelectedSlideIndex(0);
      setProgress({ status: 'generating-images', currentSlide: 0, totalSlides: generatedSlides.length, message: 'Gerando imagens...', percentage: 30 });
      await generateAllSlideImages(generatedSlides, selectedTheme);
      setProgress({ status: 'quality-check', currentSlide: generatedSlides.length, totalSlides: generatedSlides.length, message: 'Verificando qualidade...', percentage: 95 });
      const qcResponse = await supabase.functions.invoke('carousel-engine', { body: { action: 'quality-check', slides: generatedSlides, config: newConfig } });
      if (qcResponse.data?.qualityScore) setQualityScore(qcResponse.data.qualityScore);
      setProgress({ status: 'complete', currentSlide: generatedSlides.length, totalSlides: generatedSlides.length, message: 'Carrossel completo!', percentage: 100 });
      toast.success('Carrossel gerado com sucesso!');
      setTimeout(() => setProgress({ status: 'idle', currentSlide: 0, totalSlides: 0, message: '', percentage: 0 }), 2000);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Erro ao gerar carrossel. Tente novamente.');
      setProgress({ status: 'idle', currentSlide: 0, totalSlides: 0, message: '', percentage: 0 });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide) return;
    setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, isGeneratingImage: true } : s));
    toast.info(`Regenerando imagem do slide ${slideIndex + 1}...`);
    try {
      const themeColors = `${theme.name} - Primary: ${theme.primaryColor}, Accent: ${theme.accentColor}`;
      const { data, error } = await supabase.functions.invoke('generate-slide-image', {
        body: { prompt: slide.imagePrompt || `Educational visual for: ${slide.title}`, slideType: slide.type, themeColors },
      });
      if (error) throw error;
      setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s));
      toast.success('Imagem regenerada!');
    } catch (error) {
      console.error('Error regenerating image:', error);
      setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, isGeneratingImage: false } : s));
      toast.error('Erro ao regenerar imagem');
    }
  }, [slides, theme]);

  const handleImproveSlide = useCallback(async (slideIndex: number, action: string) => {
    if (!config) return;
    toast.info('Melhorando slide com IA...');
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', { body: { action: 'improve-slide', slides, slideIndex, improvementAction: action } });
      if (error) throw error;
      setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, ...data.updates } : s));
      toast.success('Slide melhorado!');
    } catch (error) {
      console.error('Error improving slide:', error);
      toast.error('Erro ao melhorar slide');
    }
  }, [slides, config]);

  // Helper for simple AI actions
  const invokeAI = async (action: string, body: Record<string, any>) => {
    setIsRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('carousel-engine', { body: { action, ...body } });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`${action} error:`, error);
      throw error;
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRewriteCarousel = async () => {
    if (!config || slides.length === 0) return;
    toast.info('Reescrevendo carrossel com IA...');
    try {
      const data = await invokeAI('rewrite-carousel', { slides, config, topic });
      setSlides(prev => prev.map((s, i) => ({ ...s, ...(data.slides[i] || {}) })));
      toast.success('Carrossel reescrito!');
    } catch { toast.error('Erro ao reescrever'); }
  };

  const handleTranslate = async (targetLang: string) => {
    if (slides.length === 0) return;
    const langName = targetLang === 'en' ? 'inglês' : targetLang === 'es' ? 'espanhol' : targetLang;
    toast.info(`Traduzindo para ${langName}...`);
    try {
      const data = await invokeAI('translate-carousel', { slides, targetLang });
      setSlides(prev => prev.map((s, i) => ({ ...s, ...(data.slides[i] || {}) })));
      toast.success('Carrossel traduzido!');
    } catch { toast.error('Erro ao traduzir'); }
  };

  const handleGenerateABHooks = async () => {
    if (!config) return;
    toast.info('Gerando variações A/B de capa...');
    try {
      const data = await invokeAI('ab-hooks', { topic, config });
      setAbHooks(data.hooks || []);
      toast.success(`${data.hooks?.length || 0} variações geradas!`);
    } catch { toast.error('Erro ao gerar variações'); }
  };

  const handleApplyABHook = (hook: any) => {
    setSlides(prev => prev.map((s, i) => i === 0 ? { ...s, title: hook.title, subtitle: hook.subtitle || s.subtitle } : s));
    toast.success('Hook aplicado!');
  };

  const handleGenerateCaption = async () => {
    setIsExportLoading(true);
    try {
      const data = await invokeAI('generate-caption', { topic, slides });
      setCarousel(prev => prev ? { ...prev, caption: data.caption } : null);
      toast.success('Legenda gerada!');
    } catch { toast.error('Erro ao gerar legenda'); }
    finally { setIsExportLoading(false); }
  };

  const handleGenerateHashtags = async () => {
    if (!config) return;
    setIsExportLoading(true);
    try {
      const data = await invokeAI('generate-hashtags', { topic, config });
      setCarousel(prev => prev ? { ...prev, hashtags: data.hashtags } : null);
      toast.success('Hashtags geradas!');
    } catch { toast.error('Erro ao gerar hashtags'); }
    finally { setIsExportLoading(false); }
  };

  const handleGenerateFromTranscript = async (transcript: string) => {
    if (!transcript.trim()) { toast.error('Cole a transcrição do áudio/vídeo'); return; }
    const defaultConfig: CarouselConfig = config || {
      objective: 'educar', audience: { level: 'intermediario', niche: 'geral', tone: 'humano' },
      format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' },
    };
    await handleGenerate(defaultConfig, `Baseado nesta transcrição de áudio/vídeo, crie um carrossel educativo:\n\n${transcript.slice(0, 3000)}`);
  };

  const handleSummarizeToCarousel = async (textContent: string) => {
    if (!textContent.trim()) { toast.error('Cole o texto do documento'); return; }
    toast.info('Transformando texto em carrossel...');
    const defaultConfig = config || { objective: 'educar', audience: { level: 'intermediario', niche: 'geral', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } };
    try {
      const data = await invokeAI('summarize-to-carousel', { textContent, config: defaultConfig });
      if (data.slides) {
        const newSlides = data.slides.map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), isGeneratingImage: true }));
        setSlides(newSlides);
        setCarousel({ id: crypto.randomUUID(), topic: data.summary || 'Carrossel de texto', config: defaultConfig, slides: newSlides, theme, createdAt: new Date(), caption: data.caption, hashtags: data.hashtags });
        setTopic(data.summary || 'Carrossel de texto');
        setStep('editor'); setSelectedSlideIndex(0);
        await generateAllSlideImages(newSlides, theme);
        toast.success('Carrossel gerado do texto!');
      }
    } catch { toast.error('Erro ao transformar texto'); }
  };

  const handleThreadToCarousel = async (threadText: string) => {
    if (!threadText.trim()) { toast.error('Cole a thread do Twitter/X'); return; }
    toast.info('Transformando thread em carrossel...');
    const defaultConfig = config || { objective: 'educar', audience: { level: 'intermediario', niche: 'geral', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } };
    try {
      const data = await invokeAI('thread-to-carousel', { threadText, config: defaultConfig });
      if (data.slides) {
        const newSlides = data.slides.map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), isGeneratingImage: true }));
        setSlides(newSlides);
        setCarousel({ id: crypto.randomUUID(), topic: data.originalThreadSummary || 'Thread → Carrossel', config: defaultConfig, slides: newSlides, theme, createdAt: new Date(), caption: data.caption, hashtags: data.hashtags });
        setTopic(data.originalThreadSummary || 'Thread → Carrossel');
        setStep('editor'); setSelectedSlideIndex(0);
        await generateAllSlideImages(newSlides, theme);
        toast.success('Thread transformada em carrossel!');
      }
    } catch { toast.error('Erro ao transformar thread'); }
  };

  const handlePodcastToCarousel = async (transcript: string) => {
    if (!transcript.trim()) { toast.error('Cole a transcrição do podcast'); return; }
    toast.info('Transformando podcast em carrossel...');
    const defaultConfig = config || { objective: 'educar', audience: { level: 'intermediario', niche: 'geral', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } };
    try {
      const data = await invokeAI('podcast-to-carousel', { textContent: transcript, config: defaultConfig });
      if (data.slides) {
        const newSlides = data.slides.map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), isGeneratingImage: true }));
        setSlides(newSlides);
        setCarousel({ id: crypto.randomUUID(), topic: 'Podcast → Carrossel', config: defaultConfig, slides: newSlides, theme, createdAt: new Date(), caption: data.caption, hashtags: data.hashtags });
        setTopic('Podcast → Carrossel');
        setStep('editor'); setSelectedSlideIndex(0);
        await generateAllSlideImages(newSlides, theme);
        toast.success('Podcast transformado em carrossel!');
      }
    } catch { toast.error('Erro ao transformar podcast'); }
  };

  const handleDataStorytelling = async (dataInput: string) => {
    if (!dataInput.trim()) { toast.error('Insira dados/números para criar a narrativa'); return; }
    toast.info('Criando storytelling a partir dos dados...');
    const defaultConfig = config || { objective: 'educar', audience: { level: 'intermediario', niche: 'geral', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } };
    try {
      const data = await invokeAI('data-storytelling', { dataPoints: dataInput, topic: topic || 'Dados', config: defaultConfig });
      if (data.slides) {
        const newSlides = data.slides.map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), isGeneratingImage: true }));
        setSlides(newSlides);
        setCarousel({ id: crypto.randomUUID(), topic: data.storyArc || 'Data Storytelling', config: defaultConfig, slides: newSlides, theme, createdAt: new Date(), caption: data.caption, hashtags: data.hashtags });
        setTopic(data.storyArc || 'Data Storytelling');
        setStep('editor'); setSelectedSlideIndex(0);
        await generateAllSlideImages(newSlides, theme);
        toast.success('Storytelling de dados criado!');
      }
    } catch { toast.error('Erro no storytelling de dados'); }
  };

  const handleDetectLanguage = async () => {
    if (slides.length === 0) return;
    toast.info('Detectando idioma e adaptações culturais...');
    try {
      const data = await invokeAI('detect-language', { slides });
      setLanguageResults(data);
      toast.success(`Idioma: ${data.languageName} (${data.confidence}% confiança)`);
    } catch { toast.error('Erro na detecção de idioma'); }
  };

  const handleCompetitorAnalysis = async (handle: string) => {
    if (!handle.trim()) { toast.error('Digite o @ do perfil para analisar'); return; }
    toast.info(`Analisando @${handle.replace('@', '')}...`);
    try {
      await invokeAI('suggest-ideas', {
        config: config || { objective: 'educar', audience: { level: 'intermediario', niche: handle.replace('@', ''), tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } },
        topic: `Analisar o estilo de conteúdo do perfil @${handle.replace('@', '')} e sugerir carrosséis no mesmo estilo mas com abordagem única`,
      });
      toast.success(`Ideias baseadas em @${handle.replace('@', '')} geradas!`);
    } catch { toast.error('Erro na análise de concorrência'); }
  };

  const handleDetectCliches = async () => {
    if (slides.length === 0) return;
    toast.info('Analisando clichês e frases fracas...');
    try {
      const data = await invokeAI('detect-cliches', { slides });
      setClicheResults(data);
      toast.success(`Análise concluída! Score: ${data.overallScore}/100`);
    } catch { toast.error('Erro ao analisar clichês'); }
  };

  const handleSuggestCTA = async () => {
    if (!config) return;
    toast.info('Gerando sugestões de CTA...');
    try {
      const data = await invokeAI('suggest-cta', { topic, config });
      setCtaSuggestions(data.ctas || []);
      toast.success(`${data.ctas?.length || 0} CTAs sugeridos!`);
    } catch { toast.error('Erro ao sugerir CTAs'); }
  };

  const handleReadabilityScore = async () => {
    if (slides.length === 0) return;
    toast.info('Analisando legibilidade...');
    try {
      const data = await invokeAI('readability-score', { slides });
      setReadabilityResults(data);
      toast.success(`Legibilidade média: ${data.averageScore}/100`);
    } catch { toast.error('Erro ao analisar legibilidade'); }
  };

  const handleSuggestEmojis = async () => {
    if (slides.length === 0) return;
    toast.info('Sugerindo emojis estratégicos...');
    try {
      const data = await invokeAI('suggest-emojis', { slides });
      if (data.slides) {
        setSlides(prev => prev.map((s, i) => {
          const emojiData = data.slides.find((e: any) => e.slideIndex === i);
          if (!emojiData) return s;
          return { ...s, title: emojiData.titleEmoji ? `${emojiData.titleEmoji} ${s.title}` : s.title };
        }));
      }
      toast.success('Emojis aplicados aos slides!');
    } catch { toast.error('Erro ao sugerir emojis'); }
  };

  const handleRewriteVoice = async (voicePerson: string) => {
    if (!voicePerson.trim() || slides.length === 0) return;
    toast.info(`Reescrevendo no tom de ${voicePerson}...`);
    try {
      const data = await invokeAI('rewrite-voice', { slides, voicePerson });
      setSlides(prev => prev.map((s, i) => ({ ...s, ...(data.slides?.[i] || {}) })));
      toast.success(`Reescrito no tom de ${voicePerson}!`);
    } catch { toast.error('Erro ao reescrever'); }
  };

  const handleRefinePrompt = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    toast.info('Refinando prompt...');
    try {
      const data = await invokeAI('refine-prompt', {
        userPrompt, config: config || { objective: 'educar', audience: { level: 'intermediario', niche: '', tone: 'humano' }, format: { width: 1080, height: 1350, slideCount: 7, style: 'minimal-premium' } },
      });
      if (data.refinements?.[0]) setTopic(data.refinements[0].prompt);
      toast.success('Prompt refinado!');
    } catch { toast.error('Erro ao refinar prompt'); }
  };

  const handleGenerateVariations = async () => {
    if (!config) return;
    toast.info('Gerando 3 variações do carrossel...');
    try {
      const data = await invokeAI('generate-variations', { topic, config });
      setVariationsResults(data.variations || []);
      toast.success(`${data.variations?.length || 0} variações geradas!`);
    } catch { toast.error('Erro ao gerar variações'); }
  };

  const handleSequencePsychology = async () => {
    if (slides.length === 0 || !config) return;
    toast.info('Analisando sequência por psicologia...');
    try {
      const data = await invokeAI('sequence-psychology', { slides, config });
      setPsychologyResults(data);
      if (data.suggestedOrder && Array.isArray(data.suggestedOrder)) {
        const reordered = data.suggestedOrder.map((idx: number) => slides[idx]).filter(Boolean);
        if (reordered.length === slides.length) {
          setSlides(reordered.map((s: any, i: number) => ({ ...s, order: i })));
          toast.success('Slides reordenados por psicologia!');
        }
      }
    } catch { toast.error('Erro na análise psicológica'); }
  };

  const handleSuggestPostingTime = async () => {
    if (!config) return;
    toast.info('Calculando melhor horário...');
    try {
      const data = await invokeAI('suggest-posting-time', { config });
      setPostingTimeResults(data);
      const best = data.bestTimes?.[0];
      if (best) toast.success(`Melhor horário: ${best.day} às ${best.time} (Score: ${best.score})`);
    } catch { toast.error('Erro ao sugerir horário'); }
  };

  const handleGenerateAltText = async () => {
    if (slides.length === 0) return;
    toast.info('Gerando alt-text acessível...');
    try {
      const data = await invokeAI('generate-alt-text', { slides });
      if (data.altTexts) {
        setSlides(prev => prev.map((s, i) => {
          const alt = data.altTexts.find((a: any) => a.slideIndex === i);
          return alt ? { ...s, altText: alt.altText } : s;
        }));
      }
      toast.success('Alt-text gerado para todos os slides!');
    } catch { toast.error('Erro ao gerar alt-text'); }
  };

  return {
    // State
    isGenerating, isRewriting, isExportLoading, progress,
    abHooks, setAbHooks, clicheResults, readabilityResults,
    ctaSuggestions, variationsResults, postingTimeResults,
    psychologyResults, languageResults,
    // Actions
    handleGenerate, handleRegenerateImage, handleImproveSlide,
    handleRewriteCarousel, handleTranslate,
    handleGenerateABHooks, handleApplyABHook,
    handleGenerateCaption, handleGenerateHashtags,
    handleGenerateFromTranscript, handleSummarizeToCarousel,
    handleThreadToCarousel, handlePodcastToCarousel,
    handleDataStorytelling, handleDetectLanguage,
    handleCompetitorAnalysis, handleDetectCliches,
    handleSuggestCTA, handleReadabilityScore,
    handleSuggestEmojis, handleRewriteVoice,
    handleRefinePrompt, handleGenerateVariations,
    handleSequencePsychology, handleSuggestPostingTime,
    handleGenerateAltText,
  };
};
