import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Bookmark, Star, StarOff, Trash2, Copy, Search, Plus, 
  Sparkles, Target, MessageSquare, Lightbulb, Zap, Loader2
} from 'lucide-react';

interface SavedHook {
  id: string;
  text: string;
  hook_type: string;
  category: string | null;
  score: number;
  usage_count: number;
  is_favorite: boolean;
  created_at: string;
}

interface SavedHooksPanelProps {
  onSelectHook: (text: string) => void;
  currentHook?: string;
}

const hookTypeIcons: Record<string, React.ComponentType<any>> = {
  curiosidade: Sparkles,
  contraste: Target,
  'erro-comum': MessageSquare,
  promessa: Lightbulb,
  provocacao: Zap,
};

const hookTypeLabels: Record<string, string> = {
  curiosidade: 'Curiosidade',
  contraste: 'Contraste',
  'erro-comum': 'Erro Comum',
  promessa: 'Promessa',
  provocacao: 'Provocação',
};

export const SavedHooksPanel = ({ onSelectHook, currentHook }: SavedHooksPanelProps) => {
  const [hooks, setHooks] = useState<SavedHook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHooks();
  }, []);

  const fetchHooks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('saved_hooks')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHooks(data || []);
    } catch (error) {
      console.error('Error fetching hooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentHook = async () => {
    if (!currentHook?.trim()) {
      toast.error('Nenhum hook para salvar');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }

      const { error } = await supabase
        .from('saved_hooks')
        .insert({
          user_id: session.user.id,
          text: currentHook.trim(),
          hook_type: 'curiosidade',
        });

      if (error) throw error;
      
      toast.success('Hook salvo!');
      fetchHooks();
    } catch (error) {
      console.error('Error saving hook:', error);
      toast.error('Erro ao salvar hook');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavorite = async (hook: SavedHook) => {
    try {
      const { error } = await supabase
        .from('saved_hooks')
        .update({ is_favorite: !hook.is_favorite })
        .eq('id', hook.id);

      if (error) throw error;
      
      setHooks(prev => prev.map(h => 
        h.id === hook.id ? { ...h, is_favorite: !h.is_favorite } : h
      ));
    } catch (error) {
      console.error('Error updating hook:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const deleteHook = async (hookId: string) => {
    try {
      const { error } = await supabase
        .from('saved_hooks')
        .delete()
        .eq('id', hookId);

      if (error) throw error;
      
      setHooks(prev => prev.filter(h => h.id !== hookId));
      toast.success('Hook removido');
    } catch (error) {
      console.error('Error deleting hook:', error);
      toast.error('Erro ao remover');
    }
  };

  const useHook = async (hook: SavedHook) => {
    try {
      // Update usage count
      await supabase
        .from('saved_hooks')
        .update({ usage_count: hook.usage_count + 1 })
        .eq('id', hook.id);

      onSelectHook(hook.text);
      toast.success('Hook aplicado!');
    } catch (error) {
      console.error('Error using hook:', error);
    }
  };

  const filteredHooks = hooks.filter(hook =>
    hook.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Banco de Hooks</h3>
        </div>
        <Badge variant="secondary">{hooks.length}</Badge>
      </div>

      {/* Save current hook */}
      {currentHook && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-4 gap-2"
          onClick={saveCurrentHook}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Salvar Hook Atual
        </Button>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar hooks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Hooks list */}
      <ScrollArea className="h-[350px]">
        {filteredHooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum hook salvo</p>
            <p className="text-xs mt-1">Salve seus melhores hooks para reutilizar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHooks.map((hook) => {
              const TypeIcon = hookTypeIcons[hook.hook_type] || Sparkles;
              return (
                <div
                  key={hook.id}
                  className="p-3 rounded-lg border border-border hover:border-accent/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-accent flex-shrink-0" />
                      <Badge variant="outline" className="text-xs">
                        {hookTypeLabels[hook.hook_type] || hook.hook_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleFavorite(hook)}
                      >
                        {hook.is_favorite ? (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteHook(hook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-3">{hook.text}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Usado {hook.usage_count}x
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => useHook(hook)}
                    >
                      <Copy className="w-3 h-3" />
                      Usar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
