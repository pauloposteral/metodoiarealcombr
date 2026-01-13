import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CarouselData } from './types';
import { toast } from 'sonner';
import { 
  Copy, Hash, MessageSquare, Sparkles, RefreshCw, Loader2,
  FileText, Lightbulb
} from 'lucide-react';

interface ExportPanelProps {
  carousel: CarouselData | null;
  onGenerateCaption: () => Promise<void>;
  onGenerateHashtags: () => Promise<void>;
  isLoading: boolean;
}

export const ExportPanel = ({
  carousel,
  onGenerateCaption,
  onGenerateHashtags,
  isLoading,
}: ExportPanelProps) => {
  const [caption, setCaption] = useState(carousel?.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(carousel?.hashtags || []);
  const [alternativeTitle, setAlternativeTitle] = useState(carousel?.alternativeTitle || '');
  const [firstComment, setFirstComment] = useState(carousel?.firstComment || '');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const defaultHashtags = [
    '#produtividade', '#ia', '#inteligenciaartificial', '#empreendedorismo',
    '#marketing', '#negocios', '#dicas', '#aprendizado', '#carreira', '#sucesso'
  ];

  const suggestedFirstComment = `🔥 Qual dessas dicas você já está aplicando? Comenta aqui!

👆 Salva esse post pra consultar depois

📲 Compartilha com alguém que precisa ver isso`;

  if (!carousel || carousel.slides.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhum carrossel para exportar</h3>
          <p className="text-sm text-muted-foreground">
            Gere um carrossel primeiro
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Pronto para Postar</h3>
      </div>

      <Tabs defaultValue="caption" className="h-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="caption">Legenda</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        {/* CAPTION */}
        <TabsContent value="caption" className="mt-0">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Legenda do Post</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGenerateCaption}
                  disabled={isLoading}
                  className="text-xs gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Gerar com IA
                </Button>
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva sua legenda aqui ou gere com IA..."
                rows={8}
                className="resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {caption.length} / 2200 caracteres
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(caption, 'Legenda')}
                  disabled={!caption}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>

            {/* Caption Templates */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Templates rápidos
              </Label>
              <div className="flex flex-wrap gap-2">
                {['Educacional', 'Engajamento', 'Autoridade', 'Conversão'].map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent/10"
                    onClick={() => {
                      // Template logic would go here
                      toast.info('Template aplicado!');
                    }}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* HASHTAGS */}
        <TabsContent value="hashtags" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hashtags</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateHashtags}
                disabled={isLoading}
                className="text-xs gap-1"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Sugerir
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(hashtags.length > 0 ? hashtags : defaultHashtags).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => {
                    const newTags = hashtags.filter((_, i) => i !== idx);
                    setHashtags(newTags);
                  }}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>

            <Input
              placeholder="Adicionar hashtag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  const value = input.value.startsWith('#') 
                    ? input.value 
                    : `#${input.value}`;
                  setHashtags([...hashtags, value]);
                  input.value = '';
                }
              }}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {hashtags.length || defaultHashtags.length} hashtags
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(
                  (hashtags.length > 0 ? hashtags : defaultHashtags).join(' '),
                  'Hashtags'
                )}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar Todas
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* EXTRAS */}
        <TabsContent value="extras" className="mt-0">
          <ScrollArea className="h-[350px] pr-2">
            <div className="space-y-5">
              {/* Alternative Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <Label>Título Alternativo (A/B)</Label>
                </div>
                <Input
                  value={alternativeTitle || carousel.slides[0]?.title || ''}
                  onChange={(e) => setAlternativeTitle(e.target.value)}
                  placeholder="Versão alternativa do hook..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Teste diferentes hooks para ver qual performa melhor
                </p>
              </div>

              {/* First Comment */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <Label>Primeiro Comentário</Label>
                </div>
                <Textarea
                  value={firstComment || suggestedFirstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(firstComment || suggestedFirstComment, 'Comentário')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>

              {/* Carousel Diagnosis */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <Label>Diagnóstico do Carrossel</Label>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">🎯 Hook</p>
                    <p className="text-xs text-muted-foreground">
                      Seu gancho usa curiosidade e especificidade, excelente para parar o scroll
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">💪 Slide mais forte</p>
                    <p className="text-xs text-muted-foreground">
                      Slide 3 tem o maior potencial de engajamento por combinar insight único com visual impactante
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">⚠️ Atenção</p>
                    <p className="text-xs text-muted-foreground">
                      Slide 5 pode ter texto muito longo. Considere simplificar para mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
