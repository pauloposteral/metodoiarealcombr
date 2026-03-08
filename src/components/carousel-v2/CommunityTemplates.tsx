import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Download, Heart, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { CarouselSlide, CarouselTheme, CarouselConfig } from './types';

interface CommunityTemplate {
  id: string;
  name: string;
  category: string;
  description: string | null;
  slides: any;
  theme: any;
  config: any;
  usage_count: number;
  is_public: boolean;
  preview_colors: any;
  user_id: string;
}

interface CommunityTemplatesProps {
  onLoadTemplate: (slides: CarouselSlide[], theme: CarouselTheme, config: CarouselConfig | null) => void;
}

const CATEGORIES = ['Todos', 'Educacional', 'Viral', 'Vendas', 'Autoridade', 'Storytelling', 'Editorial', 'Sazonal', 'Profissão'];

export const CommunityTemplates = ({ onLoadTemplate }: CommunityTemplatesProps) => {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<CommunityTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState('community');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    // Load public templates
    const { data: publicData } = await supabase
      .from('carousel_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(50);
    if (publicData) setTemplates(publicData as unknown as CommunityTemplate[]);

    // Load own templates
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: myData } = await supabase
        .from('carousel_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (myData) setMyTemplates(myData as unknown as CommunityTemplate[]);
    }
    setIsLoading(false);
  };

  const handleUseTemplate = async (template: CommunityTemplate) => {
    // Increment usage count
    await supabase.from('carousel_templates').update({ usage_count: (template.usage_count || 0) + 1 } as any).eq('id', template.id);
    onLoadTemplate(template.slides, template.theme, template.config);
    toast.success(`Template "${template.name}" aplicado!`);
  };

  const handleTogglePublic = async (template: CommunityTemplate) => {
    const newPublic = !template.is_public;
    const { error } = await supabase.from('carousel_templates').update({ is_public: newPublic } as any).eq('id', template.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    toast.success(newPublic ? 'Template publicado na comunidade!' : 'Template removido da comunidade');
    await loadTemplates();
  };

  const filteredTemplates = (activeTab === 'community' ? templates : myTemplates).filter(t => {
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Todos' || t.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCategory;
  });

  const TemplateCard = ({ template, showPublishToggle }: { template: CommunityTemplate; showPublishToggle?: boolean }) => (
    <Card className="p-3 hover:ring-2 hover:ring-accent/50 transition-all cursor-pointer group" onClick={() => handleUseTemplate(template)}>
      {/* Color preview */}
      <div className="h-16 rounded-lg mb-2 flex items-center justify-center gap-1 bg-muted/50">
        {(Array.isArray(template.preview_colors) ? template.preview_colors : []).slice(0, 4).map((c: string, i: number) => (
          <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: c }} />
        ))}
        {(!template.preview_colors || (Array.isArray(template.preview_colors) && template.preview_colors.length === 0)) && (
          <span className="text-xs text-muted-foreground">Sem preview</span>
        )}
      </div>
      <div className="flex items-start justify-between gap-1">
        <h4 className="text-sm font-semibold truncate">{template.name}</h4>
        {template.usage_count > 0 && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            <Download className="w-2.5 h-2.5 mr-0.5" />{template.usage_count}
          </Badge>
        )}
      </div>
      {template.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
      )}
      <div className="flex items-center gap-1.5 mt-2">
        <Badge variant="outline" className="text-[10px]">{template.category || 'custom'}</Badge>
        {showPublishToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] ml-auto"
            onClick={(e) => { e.stopPropagation(); handleTogglePublic(template); }}
          >
            <Globe className="w-3 h-3 mr-0.5" />
            {template.is_public ? 'Público' : 'Publicar'}
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <Card className="p-4 glass-panel border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Templates
          </h4>
          <TabsList className="h-7">
            <TabsTrigger value="community" className="text-xs h-5 px-2">Comunidade</TabsTrigger>
            <TabsTrigger value="my" className="text-xs h-5 px-2">Meus</TabsTrigger>
          </TabsList>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 text-xs pl-7"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-1 flex-wrap mb-3">
          {CATEGORIES.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="text-[10px] cursor-pointer hover:bg-accent/20"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <TabsContent value="community" className="mt-0">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum template encontrado</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {filteredTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-0">
          {myTemplates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Salve um carrossel como template para vê-lo aqui</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {filteredTemplates.map(t => <TemplateCard key={t.id} template={t} showPublishToggle />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
