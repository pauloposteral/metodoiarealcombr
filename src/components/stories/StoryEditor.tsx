import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  StorySlide, 
  StoryStyle, 
  StoryType, 
  STORY_STYLES, 
  STORY_TYPES,
  STORY_TEMPLATES,
  StoryTextOverlay 
} from './types';
import { 
  Sparkles, Plus, Trash2, Wand2, Type, Image as ImageIcon,
  Loader2, RefreshCw, Palette, LayoutTemplate
} from 'lucide-react';

interface StoryEditorProps {
  slides: StorySlide[];
  selectedIndex: number;
  isGenerating: boolean;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, updates: Partial<StorySlide>) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onGenerateImage: (slideIndex: number) => void;
  onApplyTemplate: (templateId: string) => void;
}

export const StoryEditor = ({
  slides,
  selectedIndex,
  isGenerating,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onDeleteSlide,
  onGenerateImage,
  onApplyTemplate,
}: StoryEditorProps) => {
  const selectedSlide = slides[selectedIndex];

  const updateTextOverlay = (updates: Partial<StoryTextOverlay>) => {
    if (!selectedSlide) return;
    
    const currentOverlay = selectedSlide.textOverlay || {
      text: '',
      position: 'center' as const,
      style: 'modern' as const,
      fontSize: 'lg' as const,
      color: '#ffffff',
    };
    
    onUpdateSlide(selectedIndex, {
      textOverlay: { ...currentOverlay, ...updates }
    });
  };

  if (slides.length === 0) {
    return (
      <Card className="p-6 glass-panel neon-border">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="font-bold text-lg mb-2">Comece a criar</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Adicione um story ou use um template
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={onAddSlide} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Criar Story
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onApplyTemplate('flash-sale')}
              className="w-full gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              Usar Template
            </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="p-4 glass-panel">
      <Tabs defaultValue="content" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4 glass-panel p-1">
          <TabsTrigger value="content" className="data-[state=active]:glow-accent text-xs">
            <Wand2 className="w-3 h-3 mr-1" />
            IA
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:glow-accent text-xs">
            <Type className="w-3 h-3 mr-1" />
            Texto
          </TabsTrigger>
          <TabsTrigger value="style" className="data-[state=active]:glow-accent text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Estilo
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:glow-accent text-xs">
            <LayoutTemplate className="w-3 h-3 mr-1" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Content / AI Generation Tab */}
        <TabsContent value="content" className="flex-1 mt-0">
          {selectedSlide && (
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-5">
                {/* Prompt */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-accent" />
                    Descreva a imagem
                  </Label>
                  <Textarea
                    value={selectedSlide.prompt}
                    onChange={(e) => onUpdateSlide(selectedIndex, { prompt: e.target.value })}
                    placeholder="Uma pessoa caminhando na praia ao pôr do sol com céu rosa e laranja..."
                    className="resize-none input-glow"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Seja específico para melhores resultados
                  </p>
                </div>

                {/* Style Selection */}
                <div>
                  <Label className="mb-3 block">Estilo Visual</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(STORY_STYLES) as [StoryStyle, typeof STORY_STYLES[StoryStyle]][]).map(([key, style]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onUpdateSlide(selectedIndex, { style: key })}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedSlide.style === key 
                            ? 'ring-2 ring-accent glow-accent' 
                            : 'border border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{style.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{style.label}</p>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                        <div 
                          className="h-1.5 rounded-full mt-2"
                          style={{ background: style.gradient }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <Label className="mb-3 block">Tipo de Conteúdo</Label>
                  <Select 
                    value={selectedSlide.type}
                    onValueChange={(v) => onUpdateSlide(selectedIndex, { type: v as StoryType })}
                  >
                    <SelectTrigger className="input-glow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STORY_TYPES) as [StoryType, typeof STORY_TYPES[StoryType]][]).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={() => onGenerateImage(selectedIndex)}
                  disabled={isGenerating || !selectedSlide.prompt.trim()}
                  className="w-full gap-2 h-12 text-lg bg-gradient-to-r from-accent to-gold-light hover:opacity-90 btn-shimmer"
                >
                  {selectedSlide.isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Gerar Imagem com IA
                    </>
                  )}
                </Button>

                {/* Regenerate if has image */}
                {selectedSlide.imageUrl && !selectedSlide.isGenerating && (
                  <Button
                    variant="outline"
                    onClick={() => onGenerateImage(selectedIndex)}
                    className="w-full gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerar Imagem
                  </Button>
                )}

                {/* Current image preview */}
                {selectedSlide.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={selectedSlide.imageUrl} 
                      alt="Preview"
                      className="w-full aspect-[9/16] object-cover"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Text Overlay Tab */}
        <TabsContent value="text" className="flex-1 mt-0">
          {selectedSlide && (
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block">Texto do Story</Label>
                  <Textarea
                    value={selectedSlide.textOverlay?.text || ''}
                    onChange={(e) => updateTextOverlay({ text: e.target.value })}
                    placeholder="Seu texto aqui..."
                    className="resize-none input-glow"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Posição</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <Button
                        key={pos}
                        variant={selectedSlide.textOverlay?.position === pos ? 'default' : 'outline'}
                        onClick={() => updateTextOverlay({ position: pos })}
                        className="capitalize"
                      >
                        {pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Base'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Estilo do Texto</Label>
                  <Select 
                    value={selectedSlide.textOverlay?.style || 'modern'}
                    onValueChange={(v) => updateTextOverlay({ style: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Moderno</SelectItem>
                      <SelectItem value="elegant">Elegante</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Tamanho</Label>
                  <Select 
                    value={selectedSlide.textOverlay?.fontSize || 'lg'}
                    onValueChange={(v) => updateTextOverlay({ fontSize: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequeno</SelectItem>
                      <SelectItem value="md">Médio</SelectItem>
                      <SelectItem value="lg">Grande</SelectItem>
                      <SelectItem value="xl">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Cor do Texto</Label>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateTextOverlay({ color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedSlide.textOverlay?.color === color 
                            ? 'border-accent scale-110' 
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={selectedSlide.textOverlay?.color || '#ffffff'}
                      onChange={(e) => updateTextOverlay({ color: e.target.value })}
                      className="w-8 h-8 p-0 border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Style Tab - Slides List */}
        <TabsContent value="style" className="flex-1 mt-0">
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    index === selectedIndex 
                      ? 'border-accent bg-accent/10 glow-accent' 
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => onSelectSlide(index)}
                >
                  <div 
                    className="w-10 h-16 rounded-md overflow-hidden flex-shrink-0"
                    style={{ background: STORY_STYLES[slide.style].gradient }}
                  >
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    {slide.isGenerating && (
                      <div className="w-full h-full flex items-center justify-center bg-black/50">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {STORY_STYLES[slide.style].icon} {STORY_STYLES[slide.style].label}
                    </p>
                    <p className="text-sm font-medium truncate">{slide.prompt || 'Sem prompt'}</p>
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
                </motion.div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 gap-2 hover-scale-micro"
              onClick={onAddSlide}
            >
              <Plus className="w-4 h-4" />
              Adicionar Story
            </Button>
          </ScrollArea>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 mt-0">
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-4">
              {STORY_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border border-border hover:border-accent/50 cursor-pointer transition-all"
                  onClick={() => onApplyTemplate(template.id)}
                >
                  <div className="flex gap-3">
                    {/* Template preview */}
                    <div className="flex gap-1">
                      {template.slides.slice(0, 3).map((slide, i) => (
                        <div 
                          key={i}
                          className="w-8 h-14 rounded"
                          style={{ background: STORY_STYLES[slide.style || 'editorial'].gradient }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-accent mt-1">{template.slides.length} stories</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};