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
import { CarouselSlide, CarouselTheme, CAROUSEL_THEMES, CONTENT_ICONS, SlideType, ImageFilter, GOOGLE_FONTS } from './types';
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
