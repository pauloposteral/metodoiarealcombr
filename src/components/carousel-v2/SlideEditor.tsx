import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CarouselSlide, CarouselTheme, CAROUSEL_THEMES, CONTENT_ICONS, SlideType, ImageFilter, GOOGLE_FONTS, SlideSticker, BackgroundPattern, TextShadowStyle, TextTransformOption, DecorativeShape, BlendMode, DividerStyle, DuotonePreset, ImageMaskShape, CardShadowStyle, BorderStyleOption, GradientTextPreset } from './types';
import { AlignLeft, AlignCenter, AlignRight, ArrowUpFromLine, ChevronsUpDown, ArrowDownFromLine } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { SavedHooksPanel } from './SavedHooksPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, Plus, Trash2, GripVertical, RefreshCw, Upload,
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle,
  Loader2, Image as ImageIcon, Type, Eye, Lock, Unlock,
  DollarSign, Percent, Calendar, Bell, Gift, Bookmark, ImagePlus
} from 'lucide-react';

const iconComponents: Record<string, React.ComponentType<any>> = {
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle,
  Eye, Lock, Unlock, DollarSign, Percent, Calendar, Bell, Gift
};

interface SlideEditorProps {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  theme: CarouselTheme;
  isGenerating: boolean;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, updates: Partial<CarouselSlide>) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides?: (startIndex: number, endIndex: number) => void;
  onThemeChange: (theme: CarouselTheme) => void;
  onRegenerateImage?: (slideIndex: number) => void;
  onImproveSlide?: (slideIndex: number, action: string) => void;
}

// Sortable slide item component
const SortableSlideItem = ({ 
  slide, index, isSelected, onSelect, onDelete, getSlideTypeName 
}: {
  slide: CarouselSlide;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  getSlideTypeName: (type: string) => string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
        isSelected
          ? 'border-accent bg-accent/10' 
          : 'border-border hover:border-accent/50'
      }`}
      onClick={onSelect}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
      
      <div className="w-10 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : slide.isGeneratingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase">
          {getSlideTypeName(slide.type)}
        </p>
        <p className="text-sm font-medium truncate">{slide.title}</p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const SlideEditor = ({
  slides,
  selectedSlideIndex,
  theme,
  isGenerating,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
  onThemeChange,
  onRegenerateImage,
  onImproveSlide,
}: SlideEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const slideIds = useMemo(() => slides.map(s => s.id), [slides]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderSlides) return;
    
    const oldIndex = slides.findIndex(s => s.id === active.id);
    const newIndex = slides.findIndex(s => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderSlides(oldIndex, newIndex);
    }
  };

  const selectedSlide = slides[selectedSlideIndex];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('carousel-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Upload error:', error);
        toast.error('Erro ao fazer upload da imagem');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('carousel-images')
        .getPublicUrl(data.path);

      onUpdateSlide(selectedSlideIndex, { imageUrl: publicUrl, isGeneratingImage: false });
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getSlideTypeName = (type: string) => {
    const types: Record<string, string> = {
      cover: 'Capa',
      intro: 'Contexto',
      content: 'Conteúdo',
      summary: 'Síntese',
      cta: 'CTA',
    };
    return types[type] || type;
  };

  const improvementActions = [
    { id: 'shorter', label: 'Mais curto', icon: '✂️' },
    { id: 'viral', label: 'Mais viral', icon: '🚀' },
    { id: 'didactic', label: 'Mais didático', icon: '📚' },
    { id: 'direct', label: 'Mais direto', icon: '🎯' },
    { id: 'premium', label: 'Mais premium', icon: '✨' },
  ];

  if (slides.length === 0) {
    return (
      <Card className="p-6 glass-panel border-border neon-border">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhum slide ainda</h3>
          <p className="text-sm text-muted-foreground">
            Gere um carrossel para começar a editar
          </p>
        </motion.div>
      </Card>
    );
  }

  // Group themes by category
  const themeCategories = CAROUSEL_THEMES.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, CarouselTheme[]>);

  const categoryLabels: Record<string, string> = {
    'minimal-premium': '✨ Minimal Premium',
    'luxury': '👑 Luxury',
    'corporate': '💼 Corporate',
    'nature': '🌿 Nature',
    'editorial': '📰 Editorial',
    'tech-clean': '🔮 Tech',
    'cozy': '🏡 Cozy',
    'alto-contraste': '⚡ Alto Contraste',
  };

  return (
    <Card className="p-4 glass-panel border-border">
      <Tabs defaultValue="slides" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4 glass-panel p-1">
          <TabsTrigger value="slides" className="data-[state=active]:glow-accent transition-all">Slides</TabsTrigger>
          <TabsTrigger value="edit" className="data-[state=active]:glow-accent transition-all">Editar</TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:glow-accent transition-all">Tema</TabsTrigger>
          <TabsTrigger value="hooks" className="gap-1 data-[state=active]:glow-accent transition-all">
            <Bookmark className="w-3 h-3" />
            Hooks
          </TabsTrigger>
        </TabsList>

        {/* SLIDES LIST with Drag & Drop */}
        <TabsContent value="slides" className="flex-1 mt-0">
          <ScrollArea className="h-[450px] pr-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <SortableSlideItem
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isSelected={index === selectedSlideIndex}
                      onSelect={() => onSelectSlide(index)}
                      onDelete={() => onDeleteSlide(index)}
                      getSlideTypeName={getSlideTypeName}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
          <Button variant="outline" className="w-full mt-4" onClick={onAddSlide}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Slide
          </Button>
        </TabsContent>

        {/* EDIT SLIDE */}
        <TabsContent value="edit" className="flex-1 mt-0">
          {selectedSlide && (
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-5">
                {/* Magic Buttons */}
                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">Melhorar com IA</Label>
                  <div className="flex flex-wrap gap-2">
                    {improvementActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onImproveSlide?.(selectedSlideIndex, action.id)}
                        disabled={isGenerating}
                      >
                        {action.icon} {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Slide Type */}
                <div>
                  <Label>Tipo de Slide</Label>
                  <Select 
                    value={selectedSlide.type} 
                    onValueChange={(v) => onUpdateSlide(selectedSlideIndex, { type: v as SlideType })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Capa (Hook)</SelectItem>
                      <SelectItem value="intro">Contexto</SelectItem>
                      <SelectItem value="content">Conteúdo</SelectItem>
                      <SelectItem value="summary">Síntese</SelectItem>
                      <SelectItem value="cta">CTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div>
                  <Label>Título</Label>
                  <Input
                    value={selectedSlide.title}
                    onChange={(e) => onUpdateSlide(selectedSlideIndex, { title: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedSlide.title.length} caracteres
                  </p>
                </div>

                {/* Subtitle (for cover/intro) */}
                {(selectedSlide.type === 'cover' || selectedSlide.type === 'intro') && (
                  <div>
                    <Label>Subtítulo</Label>
                    <Input
                      value={selectedSlide.subtitle || ''}
                      onChange={(e) => onUpdateSlide(selectedSlideIndex, { subtitle: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Content */}
                {selectedSlide.type !== 'cover' && (
                  <div>
                    <Label>Conteúdo</Label>
                    <Textarea
                      value={selectedSlide.content || ''}
                      onChange={(e) => onUpdateSlide(selectedSlideIndex, { content: e.target.value })}
                      className="mt-1 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedSlide.content || '').length} caracteres
                    </p>
                  </div>
                )}

                {/* Icon Selection */}
                {selectedSlide.type === 'content' && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Ícone
                    </Label>
                    <div className="grid grid-cols-8 gap-1.5 mt-2">
                      {CONTENT_ICONS.map(iconName => {
                        const IconComponent = iconComponents[iconName];
                        return (
                          <Button
                            key={iconName}
                            variant={selectedSlide.icon === iconName ? 'default' : 'outline'}
                            size="icon"
                            className={`h-8 w-8 ${
                              selectedSlide.icon === iconName ? 'bg-accent text-accent-foreground' : ''
                            }`}
                            onClick={() => onUpdateSlide(selectedSlideIndex, { icon: iconName })}
                          >
                            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visual Controls #15-18 */}
                <div className="pt-4 border-t border-border space-y-4">
                  <Label className="text-sm text-muted-foreground">🎨 Controles Visuais</Label>
                  
                  {/* #15 Font Size */}
                  <div>
                    <Label className="text-xs">Tamanho do Título: {selectedSlide.titleFontSize || 56}px</Label>
                    <Slider
                      value={[selectedSlide.titleFontSize || 56]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { titleFontSize: v })}
                      min={30}
                      max={100}
                      step={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tamanho do Conteúdo: {selectedSlide.contentFontSize || 32}px</Label>
                    <Slider
                      value={[selectedSlide.contentFontSize || 32]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { contentFontSize: v })}
                      min={18}
                      max={50}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* #18 Image Opacity */}
                  <div>
                    <Label className="text-xs">Opacidade da Imagem: {selectedSlide.imageOpacity ?? 45}%</Label>
                    <Slider
                      value={[selectedSlide.imageOpacity ?? 45]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { imageOpacity: v })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-1"
                    />
                  </div>

                  {/* #17 Image Filters */}
                  <div>
                    <Label className="text-xs">Filtro de Imagem</Label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {([
                        { id: 'none', label: 'Normal' },
                        { id: 'grayscale', label: 'P&B' },
                        { id: 'sepia', label: 'Sépia' },
                        { id: 'warm', label: 'Quente' },
                        { id: 'cool', label: 'Frio' },
                        { id: 'vintage', label: 'Vintage' },
                        { id: 'dramatic', label: 'Drama' },
                      ] as { id: ImageFilter; label: string }[]).map((f) => (
                        <Button
                          key={f.id}
                          variant={(selectedSlide.imageFilter || 'none') === f.id ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { imageFilter: f.id })}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* #16 Custom Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Cor do Texto</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedSlide.customTextColor || theme.textColor}
                          onChange={(e) => onUpdateSlide(selectedSlideIndex, { customTextColor: e.target.value })}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        {selectedSlide.customTextColor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => onUpdateSlide(selectedSlideIndex, { customTextColor: undefined })}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Cor de Destaque</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedSlide.customAccentColor || theme.accentColor}
                          onChange={(e) => onUpdateSlide(selectedSlideIndex, { customAccentColor: e.target.value })}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        {selectedSlide.customAccentColor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => onUpdateSlide(selectedSlideIndex, { customAccentColor: undefined })}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* #28 Text Alignment & Position */}
                  <div>
                    <Label className="text-xs mb-1 block">Alinhamento do Texto</Label>
                    <div className="flex gap-1">
                      {([
                        { id: 'left', icon: AlignLeft },
                        { id: 'center', icon: AlignCenter },
                        { id: 'right', icon: AlignRight },
                      ] as const).map(({ id, icon: Icon }) => (
                        <Button
                          key={id}
                          variant={(selectedSlide.textAlignment || 'left') === id ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { textAlignment: id })}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Posição Vertical</Label>
                    <div className="flex gap-1">
                      {([
                        { id: 'top', icon: ArrowUpFromLine, label: 'Topo' },
                        { id: 'center', icon: ChevronsUpDown, label: 'Centro' },
                        { id: 'bottom', icon: ArrowDownFromLine, label: 'Base' },
                      ] as const).map(({ id, icon: Icon, label }) => (
                        <Button
                          key={id}
                          variant={(selectedSlide.textPosition || 'center') === id ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 text-xs gap-1 flex-1"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { textPosition: id })}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* #100-109 Typography Advanced */}
                <div className="pt-4 border-t border-border space-y-4">
                  <Label className="text-sm text-muted-foreground">🔤 Tipografia Avançada</Label>
                  
                  {/* #100 Letter Spacing */}
                  <div>
                    <Label className="text-xs">Espaçamento entre letras: {(selectedSlide.letterSpacing ?? 0).toFixed(2)}em</Label>
                    <Slider
                      value={[(selectedSlide.letterSpacing ?? 0) * 100]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { letterSpacing: v / 100 })}
                      min={-10}
                      max={30}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* #101 Line Height */}
                  <div>
                    <Label className="text-xs">Altura da linha: {(selectedSlide.lineHeight ?? 1.12).toFixed(2)}</Label>
                    <Slider
                      value={[(selectedSlide.lineHeight ?? 1.12) * 100]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { lineHeight: v / 100 })}
                      min={90}
                      max={250}
                      step={5}
                      className="mt-1"
                    />
                  </div>

                  {/* #102 Text Transform */}
                  <div>
                    <Label className="text-xs mb-1 block">Transformação do Texto</Label>
                    <div className="flex gap-1">
                      {([
                        { id: 'none', label: 'Normal' },
                        { id: 'uppercase', label: 'ABC' },
                        { id: 'lowercase', label: 'abc' },
                        { id: 'capitalize', label: 'Abc' },
                      ] as { id: TextTransformOption; label: string }[]).map(({ id, label }) => (
                        <Button
                          key={id}
                          variant={(selectedSlide.textTransform || 'none') === id ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 text-xs flex-1"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { textTransform: id })}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* #105 Font Weight */}
                  <div>
                    <Label className="text-xs">Peso do Título: {selectedSlide.titleFontWeight ?? 700}</Label>
                    <Slider
                      value={[selectedSlide.titleFontWeight ?? 700]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { titleFontWeight: v })}
                      min={100}
                      max={900}
                      step={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Peso do Conteúdo: {selectedSlide.contentFontWeight ?? 400}</Label>
                    <Slider
                      value={[selectedSlide.contentFontWeight ?? 400]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { contentFontWeight: v })}
                      min={100}
                      max={900}
                      step={100}
                      className="mt-1"
                    />
                  </div>

                  {/* #108 Text Stroke */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSlide.textStroke || false}
                        onChange={(e) => onUpdateSlide(selectedSlideIndex, { textStroke: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Contorno no Texto</span>
                    </label>
                    {selectedSlide.textStroke && (
                      <input
                        type="color"
                        value={selectedSlide.textStrokeColor || theme.accentColor}
                        onChange={(e) => onUpdateSlide(selectedSlideIndex, { textStrokeColor: e.target.value })}
                        className="w-6 h-6 rounded border border-border cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                {/* #75-99 Visual Pro */}
                <div className="pt-4 border-t border-border space-y-4">
                  <Label className="text-sm text-muted-foreground">✨ Visual Pro</Label>

                  {/* #91 Highlight / Marker effect */}
                  <div>
                    <Label className="text-xs mb-1 block">Efeito Highlight (Marca-texto)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedSlide.highlightColor || theme.accentColor}
                        onChange={(e) => onUpdateSlide(selectedSlideIndex, { highlightColor: e.target.value })}
                        className="w-8 h-8 rounded border border-border cursor-pointer"
                      />
                      {selectedSlide.highlightColor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { highlightColor: undefined })}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* #77 Text Shadow Style */}
                  <div>
                    <Label className="text-xs mb-1 block">Estilo de Sombra</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'subtle', label: 'Sutil' },
                        { id: 'strong', label: 'Forte' },
                        { id: 'glow', label: 'Brilho' },
                        { id: 'neon', label: 'Neon' },
                        { id: 'retro', label: 'Retro' },
                      ] as { id: TextShadowStyle; label: string }[]).map(({ id, label }) => (
                        <Button
                          key={id}
                          variant={(selectedSlide.textShadowStyle || 'none') === id ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { textShadowStyle: id })}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* #78 Glassmorphism */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSlide.glassmorphism || false}
                      onChange={(e) => onUpdateSlide(selectedSlideIndex, { glassmorphism: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs">Glassmorphism (Cards de vidro)</span>
                  </label>

                  {/* #87 Background Patterns */}
                  <div>
                    <Label className="text-xs mb-1 block">Padrão de Fundo</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'dots', label: 'Pontos' },
                        { id: 'lines', label: 'Linhas' },
                        { id: 'grid', label: 'Grade' },
                        { id: 'waves', label: 'Ondas' },
                        { id: 'diagonal', label: 'Diagonal' },
                        { id: 'circles', label: 'Círculos' },
                      ] as { id: BackgroundPattern; label: string }[]).map(({ id, label }) => (
                        <Button
                          key={id}
                          variant={(selectedSlide.backgroundPattern || 'none') === id ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => onUpdateSlide(selectedSlideIndex, { backgroundPattern: id })}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* #75 Custom Gradient */}
                  <div>
                    <Label className="text-xs mb-1 block">Gradiente Customizado</Label>
                    <Select
                      value={selectedSlide.customGradient || 'none'}
                      onValueChange={(v) => onUpdateSlide(selectedSlideIndex, { customGradient: v === 'none' ? undefined : v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem gradiente extra</SelectItem>
                        <SelectItem value="linear-gradient(135deg, rgba(255,0,150,0.15), rgba(0,200,255,0.15))">Rosa → Azul</SelectItem>
                        <SelectItem value="linear-gradient(135deg, rgba(255,200,0,0.15), rgba(255,50,0,0.15))">Dourado → Vermelho</SelectItem>
                        <SelectItem value="linear-gradient(135deg, rgba(0,255,150,0.15), rgba(0,100,255,0.15))">Verde → Azul</SelectItem>
                        <SelectItem value="linear-gradient(135deg, rgba(130,0,255,0.15), rgba(255,0,100,0.15))">Roxo → Rosa</SelectItem>
                        <SelectItem value="radial-gradient(circle at 30% 30%, rgba(255,200,0,0.2), transparent 70%)">Radial Dourado</SelectItem>
                        <SelectItem value="conic-gradient(from 0deg, rgba(255,0,0,0.08), rgba(0,255,0,0.08), rgba(0,0,255,0.08), rgba(255,0,0,0.08))">Cônico Arco-Íris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* #76 Border Customization */}
                  <div>
                    <Label className="text-xs mb-1 block">Bordas</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px]">Raio: {selectedSlide.borderRadius ?? 0}px</Label>
                        <Slider value={[selectedSlide.borderRadius ?? 0]} onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { borderRadius: v })} min={0} max={50} step={2} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Largura: {selectedSlide.borderWidth ?? 0}px</Label>
                        <Slider value={[selectedSlide.borderWidth ?? 0]} onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { borderWidth: v })} min={0} max={10} step={1} className="mt-1" />
                      </div>
                    </div>
                    {(selectedSlide.borderWidth ?? 0) > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-[10px]">Cor:</Label>
                        <input type="color" value={selectedSlide.borderColor || theme.accentColor} onChange={(e) => onUpdateSlide(selectedSlideIndex, { borderColor: e.target.value })} className="w-6 h-6 rounded border border-border cursor-pointer" />
                        <Select value={selectedSlide.borderStyle || 'solid'} onValueChange={(v: BorderStyleOption) => onUpdateSlide(selectedSlideIndex, { borderStyle: v })}>
                          <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Sólido</SelectItem>
                            <SelectItem value="dashed">Tracejado</SelectItem>
                            <SelectItem value="dotted">Pontilhado</SelectItem>
                            <SelectItem value="double">Duplo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* #109 Neon Border */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.neonBorder || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { neonBorder: e.target.checked })} className="rounded" />
                    <span className="text-xs">✨ Borda Neon (Glow)</span>
                  </label>

                  {/* #79 Decorative Shapes */}
                  <div>
                    <Label className="text-xs mb-1 block">Formas Decorativas</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'circle-top-right', label: '⬤ Canto' },
                        { id: 'circle-bottom-left', label: '⬤ Base' },
                        { id: 'diagonal-cut', label: '╱ Corte' },
                        { id: 'corner-accent', label: '◣ Acento' },
                        { id: 'double-line', label: '═ Linhas' },
                      ] as { id: DecorativeShape; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.decorativeShape || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { decorativeShape: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #81 Blend Mode */}
                  <div>
                    <Label className="text-xs mb-1 block">Modo de Mesclagem</Label>
                    <Select value={selectedSlide.imageBlendMode || 'normal'} onValueChange={(v: BlendMode) => onUpdateSlide(selectedSlideIndex, { imageBlendMode: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="overlay">Overlay</SelectItem>
                        <SelectItem value="multiply">Multiply</SelectItem>
                        <SelectItem value="screen">Screen</SelectItem>
                        <SelectItem value="soft-light">Soft Light</SelectItem>
                        <SelectItem value="color-dodge">Color Dodge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* #84 Icon Color */}
                  {selectedSlide.icon && (
                    <div>
                      <Label className="text-xs mb-1 block">Cor do Ícone</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={selectedSlide.iconColor || theme.accentColor} onChange={(e) => onUpdateSlide(selectedSlideIndex, { iconColor: e.target.value })} className="w-8 h-8 rounded border border-border cursor-pointer" />
                        {selectedSlide.iconColor && (
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { iconColor: undefined })}>Reset</Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* #85 Divider Style */}
                  <div>
                    <Label className="text-xs mb-1 block">Estilo do Divisor</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'line', label: '── Linha' },
                        { id: 'dots', label: '••• Pontos' },
                        { id: 'gradient', label: '▬ Grad.' },
                        { id: 'zigzag', label: '⩗ Zigzag' },
                        { id: 'wave', label: '∿ Onda' },
                      ] as { id: DividerStyle; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.dividerStyle || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { dividerStyle: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #86 Background Blur */}
                  <div>
                    <Label className="text-xs">Desfoque do Fundo: {selectedSlide.backgroundBlur ?? 0}px</Label>
                    <Slider value={[selectedSlide.backgroundBlur ?? 0]} onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { backgroundBlur: v })} min={0} max={30} step={1} className="mt-1" />
                  </div>

                  {/* #88 Noise Texture */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.noiseTexture ?? true} onChange={(e) => onUpdateSlide(selectedSlideIndex, { noiseTexture: e.target.checked })} className="rounded" />
                    <span className="text-xs">🎞️ Textura Grain (Noise)</span>
                  </label>

                  {/* #89 Duotone Filter */}
                  <div>
                    <Label className="text-xs mb-1 block">Filtro Duotone</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'blue-orange', label: '🔵🟠' },
                        { id: 'pink-cyan', label: '🩷🩵' },
                        { id: 'green-purple', label: '🟢🟣' },
                        { id: 'red-blue', label: '🔴🔵' },
                        { id: 'gold-navy', label: '🟡🔵' },
                      ] as { id: DuotonePreset; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.duotoneFilter || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { duotoneFilter: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #90 Image Mask */}
                  <div>
                    <Label className="text-xs mb-1 block">Máscara de Imagem</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'circle', label: '⬤ Círculo' },
                        { id: 'rounded', label: '▢ Rounded' },
                        { id: 'diamond', label: '◆ Losango' },
                        { id: 'hexagon', label: '⬡ Hexag.' },
                        { id: 'blob', label: '☁ Blob' },
                      ] as { id: ImageMaskShape; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.imageMask || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { imageMask: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #94 Slide Number */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.showSlideNumber || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { showSlideNumber: e.target.checked })} className="rounded" />
                    <span className="text-xs">🔢 Número do Slide</span>
                  </label>

                  {/* #95 Progress Bar */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.showProgressBar || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { showProgressBar: e.target.checked })} className="rounded" />
                    <span className="text-xs">📊 Barra de Progresso</span>
                  </label>

                  {/* #97 Text Reflection */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.textReflection || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { textReflection: e.target.checked })} className="rounded" />
                    <span className="text-xs">🪞 Reflexo no Texto</span>
                  </label>

                  {/* #98 Card Shadow */}
                  <div>
                    <Label className="text-xs mb-1 block">Sombra do Card</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'soft', label: 'Suave' },
                        { id: 'medium', label: 'Média' },
                        { id: 'hard', label: 'Forte' },
                        { id: 'colored', label: 'Colorida' },
                        { id: 'inset', label: 'Inset' },
                      ] as { id: CardShadowStyle; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.cardShadow || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { cardShadow: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #103 Text Rotation */}
                  <div>
                    <Label className="text-xs">Rotação do Texto: {selectedSlide.textRotation ?? 0}°</Label>
                    <Slider value={[selectedSlide.textRotation ?? 0]} onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { textRotation: v })} min={-45} max={45} step={1} className="mt-1" />
                  </div>

                  {/* #104 Vertical Text */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.verticalText || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { verticalText: e.target.checked })} className="rounded" />
                    <span className="text-xs">📝 Texto Vertical</span>
                  </label>

                  {/* #106 Gradient Text */}
                  <div>
                    <Label className="text-xs mb-1 block">Texto com Gradiente</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: 'none', label: 'Sem' },
                        { id: 'gold', label: '🥇 Gold' },
                        { id: 'ocean', label: '🌊 Ocean' },
                        { id: 'fire', label: '🔥 Fire' },
                        { id: 'neon', label: '💜 Neon' },
                        { id: 'aurora', label: '🌈 Aurora' },
                      ] as { id: GradientTextPreset; label: string }[]).map(({ id, label }) => (
                        <Button key={id} variant={(selectedSlide.gradientText || 'none') === id ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => onUpdateSlide(selectedSlideIndex, { gradientText: id })}>{label}</Button>
                      ))}
                    </div>
                  </div>

                  {/* #107 Text Fade */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedSlide.textFade || false} onChange={(e) => onUpdateSlide(selectedSlideIndex, { textFade: e.target.checked })} className="rounded" />
                    <span className="text-xs">🌫️ Fade no Texto (degrade de opacidade)</span>
                  </label>
                </div>
                {/* #14 Draggable Text Positioning */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">📐 Posição do Texto</Label>
                  <div>
                    <Label className="text-xs">Posição Horizontal: {selectedSlide.textX ?? 50}%</Label>
                    <Slider
                      value={[selectedSlide.textX ?? 50]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { textX: v })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Posição Vertical: {selectedSlide.textY ?? 50}%</Label>
                    <Slider
                      value={[selectedSlide.textY ?? 50]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { textY: v })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* #21 Background Image Repositioning */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">🖼️ Posição do Fundo</Label>
                  <div>
                    <Label className="text-xs">Foco Horizontal: {selectedSlide.backgroundPositionX ?? 50}%</Label>
                    <Slider
                      value={[selectedSlide.backgroundPositionX ?? 50]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { backgroundPositionX: v })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Foco Vertical: {selectedSlide.backgroundPositionY ?? 50}%</Label>
                    <Slider
                      value={[selectedSlide.backgroundPositionY ?? 50]}
                      onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { backgroundPositionY: v })}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* #19 Secondary Image */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">🖼️ Imagem Secundária (Overlay)</Label>
                  {selectedSlide.secondaryImageUrl && (
                    <div className="flex items-center gap-2">
                      <img src={selectedSlide.secondaryImageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-destructive"
                        onClick={() => onUpdateSlide(selectedSlideIndex, { secondaryImageUrl: undefined })}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                  {selectedSlide.secondaryImageUrl && (
                    <div>
                      <Label className="text-xs">Opacidade: {selectedSlide.secondaryImageOpacity ?? 30}%</Label>
                      <Slider
                        value={[selectedSlide.secondaryImageOpacity ?? 30]}
                        onValueChange={([v]) => onUpdateSlide(selectedSlideIndex, { secondaryImageOpacity: v })}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) return;
                          const fileName = `${session.user.id}/${Date.now()}-secondary.${file.name.split('.').pop()}`;
                          const { data, error } = await supabase.storage
                            .from('carousel-images')
                            .upload(fileName, file, { cacheControl: '3600', upsert: false });
                          if (error) throw error;
                          const { data: { publicUrl } } = supabase.storage
                            .from('carousel-images')
                            .getPublicUrl(data.path);
                          onUpdateSlide(selectedSlideIndex, { secondaryImageUrl: publicUrl });
                          toast.success('Imagem secundária adicionada!');
                        } catch (err) {
                          toast.error('Erro ao fazer upload');
                        }
                      };
                      input.click();
                    }}
                  >
                    <ImagePlus className="w-3 h-3 mr-1" />
                    Upload Imagem Secundária
                  </Button>
                </div>

                {/* #13 Layers / Z-Index Control */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">📑 Camadas (Z-Index)</Label>
                  {(selectedSlide.stickers || []).map((sticker, idx) => (
                    <div key={sticker.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg p-2">
                      <span className="text-lg">{sticker.emoji}</span>
                      <div className="flex-1">
                        <div className="flex gap-1">
                          <Label className="text-[10px]">X: {Math.round(sticker.x)}%</Label>
                          <Label className="text-[10px]">Y: {Math.round(sticker.y)}%</Label>
                          <Label className="text-[10px]">🔄 {sticker.rotation}°</Label>
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Slider
                            value={[sticker.x]}
                            onValueChange={([v]) => {
                              const updated = [...(selectedSlide.stickers || [])];
                              updated[idx] = { ...updated[idx], x: v };
                              onUpdateSlide(selectedSlideIndex, { stickers: updated });
                            }}
                            min={0} max={100} step={1}
                            className="flex-1"
                          />
                          <Slider
                            value={[sticker.y]}
                            onValueChange={([v]) => {
                              const updated = [...(selectedSlide.stickers || [])];
                              updated[idx] = { ...updated[idx], y: v };
                              onUpdateSlide(selectedSlideIndex, { stickers: updated });
                            }}
                            min={0} max={100} step={1}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Slider
                            value={[sticker.size]}
                            onValueChange={([v]) => {
                              const updated = [...(selectedSlide.stickers || [])];
                              updated[idx] = { ...updated[idx], size: v };
                              onUpdateSlide(selectedSlideIndex, { stickers: updated });
                            }}
                            min={20} max={100} step={2}
                            className="flex-1"
                          />
                          <Slider
                            value={[sticker.rotation + 180]}
                            onValueChange={([v]) => {
                              const updated = [...(selectedSlide.stickers || [])];
                              updated[idx] = { ...updated[idx], rotation: v - 180 };
                              onUpdateSlide(selectedSlideIndex, { stickers: updated });
                            }}
                            min={0} max={360} step={5}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => {
                          const updated = (selectedSlide.stickers || []).filter((_, i) => i !== idx);
                          onUpdateSlide(selectedSlideIndex, { stickers: updated });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* #20 Stickers & Decorative Elements */}
                <div className="pt-4 border-t border-border">
                  <Label className="text-xs mb-2 block">✨ Stickers & Elementos</Label>
                  <div className="grid grid-cols-8 gap-1">
                    {['⭐', '🔥', '💡', '✅', '❌', '👉', '⬆️', '💰', 
                      '🚀', '💎', '🎯', '⚡', '❤️', '📌', '🏆', '➡️',
                      '⬇️', '📊', '🔑', '💪', '🎉', '⚠️', '🔴', '🟢'].map(emoji => (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-base"
                        onClick={() => {
                          const newSticker: SlideSticker = {
                            id: crypto.randomUUID(),
                            emoji,
                            x: 10 + Math.random() * 60,
                            y: 10 + Math.random() * 60,
                            size: 40,
                            rotation: Math.round(Math.random() * 30 - 15),
                          };
                          const current = selectedSlide.stickers || [];
                          onUpdateSlide(selectedSlideIndex, { stickers: [...current, newSticker] });
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  {(selectedSlide.stickers || []).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">{selectedSlide.stickers!.length} sticker(s)</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-destructive"
                        onClick={() => onUpdateSlide(selectedSlideIndex, { stickers: [] })}
                      >
                        Remover todos
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image Section */}
                <div className="pt-4 border-t border-border">
                  <Label className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4" />
                    Imagem do Slide
                  </Label>
                  
                  {selectedSlide.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <img 
                        src={selectedSlide.imageUrl} 
                        alt="Preview"
                        className="w-full aspect-[4/5] object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Prompt da imagem</Label>
                    <Textarea
                      value={selectedSlide.imagePrompt || ''}
                      onChange={(e) => onUpdateSlide(selectedSlideIndex, { imagePrompt: e.target.value })}
                      className="mt-1 resize-none text-sm"
                      rows={3}
                      placeholder="Descrição para gerar a imagem..."
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || selectedSlide.isGeneratingImage}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    
                    {onRegenerateImage && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onRegenerateImage(selectedSlideIndex)}
                        disabled={selectedSlide.isGeneratingImage || isUploading}
                      >
                        {selectedSlide.isGeneratingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Gerar IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* THEME SELECTION - Grouped by category */}
        <TabsContent value="theme" className="flex-1 mt-0">
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-6">
              {/* #22 Google Fonts Selector */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Fonte</h4>
                <div className="grid grid-cols-2 gap-2">
                  {GOOGLE_FONTS.map((font) => (
                    <div
                      key={font.name}
                      className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                        theme.fontFamily === font.family
                          ? 'border-accent ring-1 ring-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => onThemeChange({ ...theme, fontFamily: font.family })}
                    >
                      <p className="text-sm font-medium" style={{ fontFamily: font.family }}>{font.name}</p>
                      <p className="text-[10px] text-muted-foreground">{font.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* #26 Custom Color Editor */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">🎨 Personalizar Cores</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Fundo Principal</Label>
                    <input
                      type="color"
                      value={theme.primaryColor.startsWith('hsl') ? '#1a1a2e' : theme.primaryColor}
                      onChange={(e) => onThemeChange({ 
                        ...theme, 
                        id: 'custom',
                        name: 'custom',
                        displayName: 'Personalizado',
                        primaryColor: e.target.value,
                        backgroundGradient: `linear-gradient(165deg, ${e.target.value} 0%, ${theme.secondaryColor.startsWith('hsl') ? e.target.value : theme.secondaryColor} 100%)`,
                      })}
                      className="w-full h-8 rounded border border-border cursor-pointer mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cor de Destaque</Label>
                    <input
                      type="color"
                      value={theme.accentColor.startsWith('hsl') ? '#d4a843' : theme.accentColor}
                      onChange={(e) => onThemeChange({ 
                        ...theme,
                        id: 'custom',
                        name: 'custom', 
                        displayName: 'Personalizado',
                        accentColor: e.target.value,
                      })}
                      className="w-full h-8 rounded border border-border cursor-pointer mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cor do Texto</Label>
                    <input
                      type="color"
                      value={theme.textColor.startsWith('hsl') ? '#ffffff' : theme.textColor}
                      onChange={(e) => onThemeChange({
                        ...theme,
                        id: 'custom',
                        name: 'custom',
                        displayName: 'Personalizado',
                        textColor: e.target.value,
                      })}
                      className="w-full h-8 rounded border border-border cursor-pointer mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fundo Secundário</Label>
                    <input
                      type="color"
                      value={theme.secondaryColor.startsWith('hsl') ? '#2a2a4e' : theme.secondaryColor}
                      onChange={(e) => onThemeChange({
                        ...theme,
                        id: 'custom',
                        name: 'custom',
                        displayName: 'Personalizado',
                        secondaryColor: e.target.value,
                        backgroundGradient: `linear-gradient(165deg, ${theme.primaryColor.startsWith('hsl') ? e.target.value : theme.primaryColor} 0%, ${e.target.value} 100%)`,
                      })}
                      className="w-full h-8 rounded border border-border cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>

              {Object.entries(themeCategories).map(([category, themes]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="space-y-2">
                    {themes.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          t.id === theme.id 
                            ? 'border-accent ring-1 ring-accent' 
                            : 'border-border hover:border-accent/50'
                        }`}
                        onClick={() => onThemeChange(t)}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-14 h-14 rounded-lg shadow-inner overflow-hidden"
                            style={{ background: t.backgroundGradient }}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <div 
                                className="w-4 h-4 rounded-full shadow-lg"
                                style={{ background: t.accentColor }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{t.displayName}</p>
                            <p className="text-xs text-muted-foreground" style={{ fontFamily: t.fontFamily }}>
                              Aa Bb Cc
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SAVED HOOKS */}
        <TabsContent value="hooks" className="flex-1 mt-0">
          <SavedHooksPanel 
            onSelectHook={(text) => {
              if (selectedSlide && selectedSlide.type === 'cover') {
                onUpdateSlide(selectedSlideIndex, { title: text });
                toast.success('Hook aplicado como título da capa!');
              } else {
                toast.info('Selecione um slide de capa para aplicar o hook');
              }
            }}
            currentHook={selectedSlide?.type === 'cover' ? selectedSlide.title : undefined}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
