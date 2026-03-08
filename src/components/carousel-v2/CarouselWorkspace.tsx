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
import { GenerationProgressBar } from './GenerationProgressBar';
import { GenerationOverlay } from './GenerationOverlay';
import { useCarouselSlides } from '@/hooks/useCarouselSlides';
import { useCarouselAI } from '@/hooks/useCarouselAI';
import { useCarouselHotkeys } from '@/hooks/useCarouselHotkeys';
import {
  CarouselSlide,
  CarouselTheme,
  CarouselConfig,
  CarouselData,
  QualityScore,
  CAROUSEL_THEMES,
  CarouselFormat,
  GOOGLE_FONTS,
} from './types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  // Core state
  const [step, setStep] = useState<'wizard' | 'editor'>('wizard');
  const [theme, setTheme] = useState<CarouselTheme>(CAROUSEL_THEMES[0]);
  const [config, setConfig] = useState<CarouselConfig | null>(null);
  const [topic, setTopic] = useState('');
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkEditor, setIsDarkEditor] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');
  const [carouselFormat, setCarouselFormat] = useState<CarouselFormat>('4:5');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDragPositionMode, setIsDragPositionMode] = useState(false);

  // Wizard input state
  const [transcriptText, setTranscriptText] = useState('');
  const [competitorHandle, setCompetitorHandle] = useState('');
  const [voicePersonInput, setVoicePersonInput] = useState('');
  const [pdfTextInput, setPdfTextInput] = useState('');
  const [threadTextInput, setThreadTextInput] = useState('');
  const [podcastTextInput, setPodcastTextInput] = useState('');
  const [dataStoryInput, setDataStoryInput] = useState('');

  // Extracted hooks
  const slideManager = useCarouselSlides();
  const persistence = useCarouselPersistence();

  const ai = useCarouselAI({
    slides: slideManager.slides,
    setSlides: slideManager.setSlides,
    config, topic, setTopic,
    theme, setTheme, setCarousel, setStep,
    setSelectedSlideIndex: slideManager.setSelectedSlideIndex,
    setQualityScore,
  });

  // Save carousel
  const handleSave = useCallback(async () => {
    if (!carousel || slideManager.slides.length === 0) return;
    await persistence.saveCarousel(carousel, slideManager.slides, theme, config, qualityScore);
    toast.success('Carrossel salvo!');
  }, [carousel, slideManager.slides, theme, config, qualityScore, persistence]);

  // Load a saved carousel
  const handleLoadCarousel = useCallback((saved: SavedCarousel) => {
    slideManager.setSlides(saved.slides as CarouselSlide[]);
    setTopic(saved.topic);
    setConfig(saved.config as CarouselConfig | null);
    setTheme(saved.theme as CarouselTheme || CAROUSEL_THEMES[0]);
    setQualityScore(saved.quality_score as QualityScore | null);
    setCarousel({
      id: saved.id, topic: saved.topic, config: saved.config as CarouselConfig,
      slides: saved.slides as CarouselSlide[], theme: saved.theme as CarouselTheme || CAROUSEL_THEMES[0],
      createdAt: new Date(saved.created_at), caption: saved.caption || undefined,
      hashtags: saved.hashtags || undefined, alternativeTitle: saved.alternative_title || undefined,
      firstComment: saved.first_comment || undefined,
    });
    persistence.setCurrentSavedId(saved.id);
    slideManager.setSelectedSlideIndex(0);
    setStep('editor');
  }, [persistence, slideManager]);

  const handleNewCarousel = () => {
    setStep('wizard');
    slideManager.setSlides([]);
    setCarousel(null);
    setQualityScore(null);
    slideManager.setSelectedSlideIndex(0);
  };

  const handleCopyAllForInstagram = useCallback(() => {
    if (!carousel) return;
    const parts: string[] = [];
    if (carousel.caption) parts.push(carousel.caption);
    if (carousel.hashtags?.length) parts.push('\n' + carousel.hashtags.join(' '));
    if (carousel.firstComment) parts.push('\n---\n📝 Primeiro comentário:\n' + carousel.firstComment);
    navigator.clipboard.writeText(parts.join('\n'));
    toast.success('Legenda + hashtags + 1º comentário copiados!');
  }, [carousel]);

  // Auto-save
  useEffect(() => {
    if (carousel && slideManager.slides.length > 0 && step === 'editor' && !ai.isGenerating) {
      persistence.scheduleAutoSave(carousel, slideManager.slides, theme, config, qualityScore);
    }
  }, [slideManager.slides, carousel, theme, step, ai.isGenerating]);

  // Handle generate with config update
  const handleGenerate = async (newConfig: CarouselConfig, newTopic: string) => {
    setConfig(newConfig);
    setTopic(newTopic);
    await ai.handleGenerate(newConfig, newTopic);
  };

  // Hotkeys
  useCarouselHotkeys({
    step,
    selectedSlideIndex: slideManager.selectedSlideIndex,
    slidesLength: slideManager.slides.length,
    setSelectedSlideIndex: slideManager.setSelectedSlideIndex as any,
    handleSave,
    undo: slideManager.undo,
    redo: slideManager.redo,
    handleNewCarousel,
    handleCopySlides: slideManager.handleCopySlides,
    handlePasteSlides: slideManager.handlePasteSlides,
    handleDuplicateCurrentSlide: slideManager.handleDuplicateCurrentSlide,
    handleDeleteMultiSelected: slideManager.handleDeleteMultiSelected,
    multiSelectedSize: slideManager.multiSelectedIndices.size,
    isFullscreen,
    setIsFullscreen: (fn) => setIsFullscreen(fn),
    canUndo: slideManager.slidesHistory.length > 0,
    canRedo: slideManager.slidesRedoStack.length > 0,
  });

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div data-theme={isDarkEditor ? 'dark' : 'light'} className={`transition-colors duration-300 bg-background text-foreground ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : 'min-h-screen'} ${!isDarkEditor ? '[&]:bg-slate-50 [&]:text-slate-900' : ''}`}>
      <OnboardingTour forceShow={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <AnimatePresence>
        <MultiSelectToolbar
          selectedIndices={slideManager.multiSelectedIndices}
          slides={slideManager.slides}
          onClearSelection={() => slideManager.setMultiSelectedIndices(new Set())}
          onDeleteSelected={slideManager.handleDeleteMultiSelected}
          onDuplicateSelected={slideManager.handleDuplicateMultiSelected}
          onMoveSelectedUp={() => slideManager.handleMoveMultiSelected('up')}
          onMoveSelectedDown={() => slideManager.handleMoveMultiSelected('down')}
          onApplyStyleToSelected={slideManager.handleApplyStyleToMultiSelected}
        />
      </AnimatePresence>

      <GenerationOverlay 
        progress={ai.progress} 
        isVisible={ai.progress.status !== 'idle' && ai.progress.status !== 'complete'}
      />

      <AnimatePresence>
        {ai.progress.status !== 'idle' && <GenerationProgressBar progress={ai.progress} />}
      </AnimatePresence>

      {/* WIZARD STEP */}
      {step === 'wizard' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <CarouselWizard onComplete={handleGenerate} isGenerating={ai.isGenerating} />
            </div>
            <div>
              {/* Input cards for alternate generation */}
              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-accent" /> Gerar de Áudio/Vídeo
                </h4>
                <Textarea placeholder="Cole aqui a transcrição do seu áudio ou vídeo..." value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} rows={3} className="text-sm mb-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => ai.handleGenerateFromTranscript(transcriptText)} disabled={ai.isGenerating || !transcriptText.trim()}>
                  <Sparkles className="w-3.5 h-3.5" /> Gerar Carrossel da Transcrição
                </Button>
              </Card>

              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" /> PDF / Artigo → Carrossel
                </h4>
                <Textarea placeholder="Cole o texto do PDF, eBook ou artigo longo aqui..." value={pdfTextInput} onChange={(e) => setPdfTextInput(e.target.value)} rows={3} className="text-sm mb-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => ai.handleSummarizeToCarousel(pdfTextInput)} disabled={ai.isRewriting || !pdfTextInput.trim()}>
                  <Sparkles className="w-3.5 h-3.5" /> Transformar em Carrossel
                </Button>
              </Card>

              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-accent" /> Thread Twitter/X → Carrossel
                </h4>
                <Textarea placeholder="Cole a thread do Twitter/X (todos os tweets)..." value={threadTextInput} onChange={(e) => setThreadTextInput(e.target.value)} rows={3} className="text-sm mb-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => ai.handleThreadToCarousel(threadTextInput)} disabled={ai.isRewriting || !threadTextInput.trim()}>
                  <Sparkles className="w-3.5 h-3.5" /> Transformar Thread
                </Button>
              </Card>

              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-accent" /> Podcast → Carrossel
                </h4>
                <Textarea placeholder="Cole a transcrição do episódio do podcast..." value={podcastTextInput} onChange={(e) => setPodcastTextInput(e.target.value)} rows={3} className="text-sm mb-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => ai.handlePodcastToCarousel(podcastTextInput)} disabled={ai.isRewriting || !podcastTextInput.trim()}>
                  <Sparkles className="w-3.5 h-3.5" /> Gerar do Podcast
                </Button>
              </Card>

              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" /> Storytelling de Dados
                </h4>
                <Textarea placeholder="Cole dados, números e estatísticas..." value={dataStoryInput} onChange={(e) => setDataStoryInput(e.target.value)} rows={3} className="text-sm mb-2" />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => ai.handleDataStorytelling(dataStoryInput)} disabled={ai.isRewriting || !dataStoryInput.trim()}>
                  <Sparkles className="w-3.5 h-3.5" /> Criar Narrativa Visual
                </Button>
              </Card>

              <Card className="p-4 mb-4 glass-panel border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-accent" /> Análise de Concorrência
                </h4>
                <div className="flex gap-2">
                  <Input placeholder="@perfil" value={competitorHandle} onChange={(e) => setCompetitorHandle(e.target.value)} className="text-sm" />
                  <Button variant="outline" size="sm" onClick={() => ai.handleCompetitorAnalysis(competitorHandle)} disabled={ai.isRewriting || !competitorHandle.trim()}>
                    Analisar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Gera ideias de carrossel inspiradas no estilo do perfil</p>
              </Card>

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

              <CommunityTemplates
                onLoadTemplate={(newSlides, newTheme, newConfig) => {
                  slideManager.setSlides(newSlides);
                  setTheme(newTheme);
                  if (newConfig) setConfig(newConfig);
                  setStep('editor');
                  toast.success('Template carregado!');
                }}
              />

              <div className="mt-4" />
              <FolderManager selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
              <h3 className="font-semibold mt-4 mb-4 text-lg">📂 Seus Carrosséis</h3>
              <CarouselHistory
                carousels={selectedFolderId
                  ? persistence.savedCarousels.filter((c: any) => c.folder_id === selectedFolderId)
                  : persistence.savedCarousels}
                isLoading={persistence.isLoading}
                onLoad={handleLoadCarousel}
                onDelete={persistence.deleteCarousel}
                onDuplicate={persistence.duplicateCarousel}
                onNewCarousel={handleNewCarousel}
              />
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">📋 Workflow</h3>
              <WorkflowBoard
                onOpenCarousel={(id) => {
                  const c = persistence.savedCarousels.find((c: any) => c.id === id);
                  if (c) handleLoadCarousel(c);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 p-4 rounded-xl glass-panel">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleNewCarousel} className="rounded-full hover-scale-micro">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{topic}</h1>
                <p className="text-sm text-muted-foreground">{slideManager.slides.length} slides • {config?.objective}</p>
              </div>
            </div>

            {/* Undo/Redo + Format + Watermark + Dark/Light */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="icon" onClick={slideManager.undo} disabled={slideManager.slidesHistory.length === 0} className="h-8 w-8" title="Desfazer (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={slideManager.redo} disabled={slideManager.slidesRedoStack.length === 0} className="h-8 w-8" title="Refazer (Ctrl+Y)">
                <Redo2 className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                <Button variant={carouselFormat === '4:5' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs gap-1" onClick={() => setCarouselFormat('4:5')}>
                  <Square className="w-3 h-3" /> 4:5
                </Button>
                <Button variant={carouselFormat === '9:16' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs gap-1" onClick={() => setCarouselFormat('9:16')}>
                  <RectangleVertical className="w-3 h-3" /> 9:16
                </Button>
              </div>

              <Input placeholder="@watermark" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-32 h-8 text-xs" />

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDarkEditor(prev => !prev)} title={isDarkEditor ? 'Modo claro' : 'Modo escuro'}>
                {isDarkEditor ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* AI Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={ai.handleRewriteCarousel} disabled={ai.isRewriting} className="gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" /> Reescrever
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={ai.isRewriting} className="gap-1.5 text-xs">
                    <Languages className="w-3.5 h-3.5" /> Traduzir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => ai.handleTranslate('en')}>🇺🇸 English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => ai.handleTranslate('es')}>🇪🇸 Español</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => ai.handleTranslate('fr')}>🇫🇷 Français</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={ai.handleGenerateABHooks} disabled={ai.isRewriting} className="gap-1.5 text-xs">
                <TestTube2 className="w-3.5 h-3.5" /> A/B Hooks
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={ai.isRewriting} className="gap-1.5 text-xs">
                    <Brain className="w-3.5 h-3.5" /> IA Avançada
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={ai.handleDetectCliches} className="gap-2">
                    <FileText className="w-4 h-4" />
                    <div><p className="font-medium">Detector de Clichês</p><p className="text-xs text-muted-foreground">Encontra frases fracas</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleSuggestCTA} className="gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <div><p className="font-medium">Sugerir CTAs</p><p className="text-xs text-muted-foreground">5 CTAs personalizados</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleReadabilityScore} className="gap-2">
                    <FileText className="w-4 h-4" />
                    <div><p className="font-medium">Score de Legibilidade</p><p className="text-xs text-muted-foreground">Análise por slide</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleSuggestEmojis} className="gap-2">
                    <Smile className="w-4 h-4" />
                    <div><p className="font-medium">Emojis Estratégicos</p><p className="text-xs text-muted-foreground">Aplica emojis inteligentes</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleGenerateVariations} className="gap-2">
                    <Shuffle className="w-4 h-4" />
                    <div><p className="font-medium">3 Variações</p><p className="text-xs text-muted-foreground">Abordagens diferentes</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleSequencePsychology} className="gap-2">
                    <Brain className="w-4 h-4" />
                    <div><p className="font-medium">Sequência Psicológica</p><p className="text-xs text-muted-foreground">Ordem ideal por atenção</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleSuggestPostingTime} className="gap-2">
                    <Clock className="w-4 h-4" />
                    <div><p className="font-medium">Melhor Horário</p><p className="text-xs text-muted-foreground">Horário ideal por nicho</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleGenerateAltText} className="gap-2">
                    <Accessibility className="w-4 h-4" />
                    <div><p className="font-medium">Alt-Text Acessível</p><p className="text-xs text-muted-foreground">Texto acessível por slide</p></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ai.handleDetectLanguage} className="gap-2">
                    <Languages className="w-4 h-4" />
                    <div><p className="font-medium">Detectar Idioma</p><p className="text-xs text-muted-foreground">Auto-detecção + adaptação cultural</p></div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voice Rewrite */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={ai.isRewriting} className="gap-1.5 text-xs">
                    <UserCircle className="w-3.5 h-3.5" /> Tom de Voz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-3 w-56">
                  <p className="text-xs font-medium mb-2">Reescrever no tom de:</p>
                  <div className="flex gap-1">
                    <Input placeholder="Ex: Ícaro de Carvalho" value={voicePersonInput} onChange={(e) => setVoicePersonInput(e.target.value)} className="text-xs h-8" />
                    <Button size="sm" className="h-8 text-xs" onClick={() => ai.handleRewriteVoice(voicePersonInput)} disabled={!voicePersonInput.trim()}>Ir</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Gary Vee', 'Seth Godin', 'Ícaro de Carvalho', 'Thiago Nigro'].map(name => (
                      <Button key={name} variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => ai.handleRewriteVoice(name)}>{name}</Button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <SaveAsTemplateDialog slides={slideManager.slides} theme={theme} config={config} topic={topic} />
              <ShareLinkButton carouselId={persistence.currentSavedId} />
            </div>

            <div className="flex items-center gap-3">
              {qualityScore && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium neon-border ${
                    qualityScore.total >= 85 ? 'bg-green-500/20 text-green-400'
                    : qualityScore.total >= 70 ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {qualityScore.total >= 85 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {qualityScore.total}%
                </motion.div>
              )}
              {persistence.isSaving && <span className="text-xs text-muted-foreground animate-pulse">Salvando...</span>}
              <Button variant="outline" onClick={handleSave} className="gap-2 hover-scale-micro" disabled={persistence.isSaving}>
                <Download className="w-4 h-4" /> Salvar
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowOnboarding(true)} title="Tour de ajuda">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleNewCarousel} className="gap-2 hover-scale-micro">
                <RefreshCw className="w-4 h-4" /> Novo
              </Button>
            </div>
          </div>

          {/* A/B Hooks Panel */}
          {ai.abHooks.length > 0 && (
            <div className="mb-4 p-4 rounded-xl glass-panel">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-accent" /> Variações A/B de Capa
                </h4>
                <Button variant="ghost" size="sm" onClick={() => ai.setAbHooks([])}>✕</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ai.abHooks.map((hook: any) => (
                  <Card key={hook.id} className="p-3 cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all" onClick={() => ai.handleApplyABHook(hook)}>
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

          {/* Quality Issues */}
          {qualityScore?.issues && qualityScore.issues.length > 0 && (
            <div className="mb-4 p-4 rounded-xl glass-panel">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Feedback de Qualidade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {qualityScore.issues.map((issue: any) => (
                  <div key={issue.id} className={`p-3 rounded-lg text-xs ${issue.type === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                    <p className="font-medium">{issue.type === 'error' ? '❌' : '⚠️'} Slide {(issue.slideIndex || 0) + 1}: {issue.message}</p>
                    <p className="text-muted-foreground mt-1">💡 {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-12'}`}>
            <div className={`${isFullscreen ? 'hidden' : 'lg:col-span-3'}`}>
              <SlideEditor
                slides={slideManager.slides}
                selectedSlideIndex={slideManager.selectedSlideIndex}
                theme={theme}
                isGenerating={ai.isGenerating}
                onSelectSlide={slideManager.setSelectedSlideIndex}
                onUpdateSlide={slideManager.handleUpdateSlide}
                onAddSlide={slideManager.handleAddSlide}
                onDeleteSlide={slideManager.handleDeleteSlide}
                onReorderSlides={slideManager.handleReorderSlides}
                onThemeChange={setTheme}
                onRegenerateImage={ai.handleRegenerateImage}
                onImproveSlide={ai.handleImproveSlide}
                onEditImagePrompt={ai.handleEditImagePrompt}
              />
            </div>

            <div className={`${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-6'}`}>
              <CarouselCanvas
                slides={slideManager.slides}
                selectedSlideIndex={slideManager.selectedSlideIndex}
                theme={theme}
                qualityScore={qualityScore || undefined}
                onSelectSlide={slideManager.setSelectedSlideIndex}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                watermark={watermarkText}
                format={carouselFormat}
                onInlineEdit={slideManager.handleInlineEdit}
              />
            </div>

            <div className={`${isFullscreen ? 'hidden' : 'lg:col-span-3'}`}>
              <ExportPanel
                carousel={carousel}
                onGenerateCaption={ai.handleGenerateCaption}
                onGenerateHashtags={ai.handleGenerateHashtags}
                onCopyAllForInstagram={handleCopyAllForInstagram}
                isLoading={ai.isExportLoading}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
