import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CarouselSlide, CarouselTheme, CAROUSEL_THEMES, CONTENT_ICONS } from './types';
import { 
  Sparkles, Plus, Trash2, GripVertical, Palette, Type, RefreshCw,
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle,
  Loader2, Wand2, Image as ImageIcon
} from 'lucide-react';

const iconComponents: Record<string, React.ComponentType<any>> = {
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles: Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle
};

interface CarouselSidebarProps {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  theme: CarouselTheme;
  topic: string;
  isGenerating: boolean;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, updates: Partial<CarouselSlide>) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
  onThemeChange: (theme: CarouselTheme) => void;
  onGenerate: (topic: string, slideCount: number) => void;
  onRegenerateImage?: (slideIndex: number) => void;
}

export const CarouselSidebar = ({
  slides,
  selectedSlideIndex,
  theme,
  topic,
  isGenerating,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onDeleteSlide,
  onThemeChange,
  onGenerate,
  onRegenerateImage,
}: CarouselSidebarProps) => {
  const [inputTopic, setInputTopic] = useState(topic);
  const [slideCount, setSlideCount] = useState(7);

  const selectedSlide = slides[selectedSlideIndex];

  const handleGenerate = () => {
    onGenerate(inputTopic, slideCount);
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

  return (
    <div className="w-full lg:w-96 flex flex-col gap-4">
      {/* Generate Section */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-lg">Gerar Carrossel Completo</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Tema do Carrossel</Label>
            <Textarea
              id="topic"
              placeholder="Ex: 5 formas de usar IA para aumentar produtividade no trabalho"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="slideCount">Número de Slides</Label>
            <Select 
              value={slideCount.toString()} 
              onValueChange={(v) => setSlideCount(parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 7, 8, 9, 10].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} slides</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !inputTopic.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Gera textos + imagens automaticamente
          </p>
        </div>
      </Card>

      {/* Editor Tabs */}
      {slides.length > 0 && (
        <Card className="p-4 bg-card border-border flex-1">
          <Tabs defaultValue="slides" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="theme">Tema</TabsTrigger>
            </TabsList>

            <TabsContent value="slides" className="flex-1 mt-0">
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                        index === selectedSlideIndex 
                          ? 'border-accent bg-accent/10' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => onSelectSlide(index)}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      
                      {/* Thumbnail */}
                      <div className="w-10 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {slide.imageUrl ? (
                          <img 
                            src={slide.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
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
                          onDeleteSlide(index);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={onAddSlide}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Slide
              </Button>
            </TabsContent>

            <TabsContent value="edit" className="flex-1 mt-0">
              {selectedSlide && (
                <ScrollArea className="h-[450px] pr-2">
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Slide</Label>
                      <Select 
                        value={selectedSlide.type} 
                        onValueChange={(v) => onUpdateSlide(selectedSlideIndex, { type: v as any })}
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

                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedSlide.title}
                        onChange={(e) => onUpdateSlide(selectedSlideIndex, { title: e.target.value })}
                        className="mt-1"
                      />
                    </div>

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

                    {(selectedSlide.type === 'content' || selectedSlide.type === 'intro' || selectedSlide.type === 'cta' || selectedSlide.type === 'summary') && (
                      <div>
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={selectedSlide.content || ''}
                          onChange={(e) => onUpdateSlide(selectedSlideIndex, { content: e.target.value })}
                          className="mt-1 resize-none"
                          rows={4}
                        />
                      </div>
                    )}

                    {selectedSlide.type === 'content' && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Ícone
                        </Label>
                        <div className="grid grid-cols-6 gap-2 mt-2">
                          {CONTENT_ICONS.map(iconName => {
                            const IconComponent = iconComponents[iconName];
                            return (
                              <Button
                                key={iconName}
                                variant={selectedSlide.icon === iconName ? 'default' : 'outline'}
                                size="icon"
                                className={`h-9 w-9 ${
                                  selectedSlide.icon === iconName 
                                    ? 'bg-accent text-accent-foreground' 
                                    : ''
                                }`}
                                onClick={() => onUpdateSlide(selectedSlideIndex, { icon: iconName })}
                              >
                                {IconComponent && <IconComponent className="w-4 h-4" />}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                            alt="Slide preview"
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
                      
                      {onRegenerateImage && (
                        <Button
                          variant="outline"
                          className="w-full mt-3"
                          onClick={() => onRegenerateImage(selectedSlideIndex)}
                          disabled={selectedSlide.isGeneratingImage}
                        >
                          {selectedSlide.isGeneratingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerar Imagem
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="theme" className="flex-1 mt-0">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Paleta de Cores
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {CAROUSEL_THEMES.map(t => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        theme.id === t.id 
                          ? 'border-accent ring-2 ring-accent/30' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => onThemeChange(t)}
                    >
                      <div 
                        className="h-12 rounded-md mb-2"
                        style={{ background: t.backgroundGradient }}
                      />
                      <p className="text-sm font-medium text-center">{t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
