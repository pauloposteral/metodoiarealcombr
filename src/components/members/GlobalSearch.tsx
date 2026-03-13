import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search, BookOpen, GraduationCap, FileText, Users,
  ArrowRight, Clock, Loader2
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'lesson' | 'module' | 'course' | 'community';
  title: string;
  description: string | null;
  path: string;
  meta?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = async (q: string) => {
    setLoading(true);
    try {
      const searchTerm = `%${q}%`;
      const allResults: SearchResult[] = [];

      // Search courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description, slug')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(3);

      if (courses) {
        allResults.push(...courses.map(c => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          description: c.description,
          path: `/membros/cursos/${c.slug}`,
          meta: 'Curso',
        })));
      }

      // Search modules
      const { data: modules } = await supabase
        .from('modules')
        .select('id, title, description')
        .ilike('title', searchTerm)
        .limit(3);

      if (modules) {
        allResults.push(...modules.map(m => ({
          id: m.id,
          type: 'module' as const,
          title: m.title,
          description: m.description,
          path: `/membros/modulos/${m.id}`,
          meta: 'Módulo',
        })));
      }

      // Search lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, description, estimated_minutes, type')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (lessons) {
        allResults.push(...lessons.map(l => ({
          id: l.id,
          type: 'lesson' as const,
          title: l.title,
          description: l.description,
          path: `/membros/aula/${l.id}`,
          meta: `${l.estimated_minutes || 0}min · ${l.type || 'text'}`,
        })));
      }

      // Search community posts
      const { data: posts } = await supabase
        .from('community_posts')
        .select('id, title, content, category')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(3);

      if (posts) {
        allResults.push(...posts.map(p => ({
          id: p.id,
          type: 'community' as const,
          title: p.title,
          description: p.content?.substring(0, 80) || null,
          path: `/membros/comunidade/post/${p.id}`,
          meta: p.category,
        })));
      }

      setResults(allResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const iconMap = {
    course: GraduationCap,
    module: BookOpen,
    lesson: FileText,
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar aulas, módulos, cursos..."
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 text-base"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Digite pelo menos 2 caracteres para buscar
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, i) => {
                const Icon = iconMap[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      i === selectedIndex ? "bg-accent/10" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{result.meta}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>esc fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
