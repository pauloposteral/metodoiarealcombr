import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { GLOSSARY } from '@/data/glossary';
import { AI_TOOLS } from '@/data/aiTools';
import { moduleCode, moduleDisplayTitle } from '@/lib/curriculum';
import { GLOSSARY_PATH, glossaryAnchorId, searchResources, TOOLS_PATH, toolAnchorId } from '@/lib/resources';
import { toIlikePattern } from '@/lib/textSearch';
import {
  Search, BookOpen, GraduationCap, FileText, Users, ArrowRight, Loader2, BookA, Wrench,
} from 'lucide-react';

type ResultType = 'lesson' | 'module' | 'course' | 'community' | 'glossary' | 'tool';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string | null;
  path: string;
  meta?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const MIN_QUERY_LENGTH = 2;
const LISTBOX_ID = 'global-search-results';
const optionId = (index: number) => `global-search-option-${index}`;

const ICONS = {
  course: GraduationCap,
  module: BookOpen,
  lesson: FileText,
  community: Users,
  glossary: BookA,
  tool: Wrench,
} satisfies Record<ResultType, unknown>;

const LESSON_TYPES: Record<string, string> = { text: 'Texto', project: 'Projeto', video: 'Vídeo', quiz: 'Quiz' };

/** Glossary and tools are static data: they answer instantly while the database is queried. */
function searchStaticResources(query: string): SearchResult[] {
  return searchResources(GLOSSARY, AI_TOOLS, query, 3).map((hit): SearchResult => (hit.kind === 'glossary'
    ? {
      id: glossaryAnchorId(hit.term.term),
      type: 'glossary',
      title: hit.term.term,
      description: hit.term.definition,
      path: `${GLOSSARY_PATH}#${glossaryAnchorId(hit.term.term)}`,
      meta: 'Glossário',
    }
    : {
      id: toolAnchorId(hit.tool.id),
      type: 'tool',
      title: hit.tool.name,
      description: hit.tool.whatFor,
      path: `${TOOLS_PATH}#${toolAnchorId(hit.tool.id)}`,
      meta: 'Ferramenta',
    }));
}

/** `pattern` comes from toIlikePattern, so it cannot break the PostgREST `or` filter syntax. */
async function searchDatabase(pattern: string): Promise<SearchResult[]> {
  try {
    const [courses, modules, lessons, posts] = await Promise.all([
      supabase.from('courses').select('id, title, description, slug').eq('is_published', true)
        .or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(3),
      supabase.from('modules').select('id, title, description, code').or(`title.ilike.${pattern},code.ilike.${pattern}`).limit(3),
      supabase.from('lessons').select('id, title, description, estimated_minutes, type')
        .or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(5),
      supabase.from('community_posts').select('id, title, content, category')
        .or(`title.ilike.${pattern},content.ilike.${pattern}`).limit(3),
    ]);
    for (const [source, result] of Object.entries({ courses, modules, lessons, posts })) {
      if (result.error) console.error(`[GlobalSearch] ${source} search failed`, result.error);
    }
    return [
      ...(courses.data ?? []).map((c): SearchResult => ({
        id: c.id, type: 'course', title: c.title, description: c.description, path: `/membros/cursos/${c.slug}`, meta: 'Curso',
      })),
      ...(modules.data ?? []).map((m): SearchResult => {
        const code = moduleCode(m);
        return { id: m.id, type: 'module', title: moduleDisplayTitle(m), description: m.description, path: `/membros/modulos/${m.id}`, meta: code ? `${code} · Módulo` : 'Módulo' };
      }),
      ...(lessons.data ?? []).map((l): SearchResult => ({
        id: l.id, type: 'lesson', title: l.title, description: l.description, path: `/membros/aula/${l.id}`,
        meta: `${l.estimated_minutes || 0} min · ${LESSON_TYPES[l.type ?? 'text'] ?? l.type}`,
      })),
      ...(posts.data ?? []).map((p): SearchResult => ({
        id: p.id, type: 'community', title: p.title, description: p.content?.substring(0, 80) || null, path: `/membros/comunidade/post/${p.id}`, meta: p.category,
      })),
    ];
  } catch (error) {
    console.error('[GlobalSearch] search failed', error);
    return [];
  }
}

export const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [database, setDatabase] = useState<{ pattern: string; results: SearchResult[] } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // After picking a result the destination page owns focus (e.g. the linked glossary term).
  const pickedResult = useRef(false);

  const trimmed = query.trim();
  const ready = trimmed.length >= MIN_QUERY_LENGTH;
  const pattern = ready ? toIlikePattern(trimmed) : null;
  const staticResults = useMemo(() => (ready ? searchStaticResources(trimmed) : []), [ready, trimmed]);
  const loading = pattern !== null && database?.pattern !== pattern;
  // Static hits come first so late database answers never move the highlighted row.
  const results = useMemo(
    () => [...staticResults, ...(database && database.pattern === pattern ? database.results : [])],
    [staticResults, database, pattern],
  );
  const activeIndex = results.length === 0 ? -1 : Math.min(selectedIndex, results.length - 1);

  useEffect(() => {
    if (pattern === null) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void searchDatabase(pattern).then((found) => {
        if (!cancelled) setDatabase({ pattern, results: found });
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pattern]);

  const close = () => {
    setQuery('');
    setDatabase(null);
    setSelectedIndex(0);
    onClose();
  };

  const handleSelect = (result: SearchResult) => {
    pickedResult.current = true;
    navigate(result.path);
    close();
  };

  const moveSelection = (index: number) => {
    setSelectedIndex(index);
    document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      moveSelection(Math.min(activeIndex + 1, results.length - 1));
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      moveSelection(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  const status = !ready
    ? ''
    : loading && results.length === 0
      ? 'Buscando…'
      : results.length === 0
        ? 'Nenhum resultado'
        : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}${loading ? ', buscando mais…' : ''}`;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        onCloseAutoFocus={(event) => {
          if (!pickedResult.current) return;
          pickedResult.current = false;
          event.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Busca na plataforma</DialogTitle>
        <DialogDescription className="sr-only">
          Busque aulas, módulos, cursos, termos do glossário, ferramentas e posts da comunidade. Use as setas para navegar e Enter para abrir.
        </DialogDescription>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 pr-12">
          <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar aulas, módulos, termos, ferramentas..."
            className="h-auto border-0 bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Buscar na plataforma"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            autoComplete="off"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
        </div>
        <p role="status" aria-live="polite" className="sr-only">{status}</p>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {!ready ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="mx-auto mb-2 h-8 w-8 opacity-30" aria-hidden="true" />
              Digite pelo menos {MIN_QUERY_LENGTH} caracteres para buscar
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground [overflow-wrap:anywhere]">
              Nenhum resultado encontrado para "{trimmed}"
            </div>
          ) : (
            <div id={LISTBOX_ID} role="listbox" aria-label="Resultados da busca" className="py-2">
              {results.map((result, index) => {
                const Icon = ICONS[result.type];
                const selected = index === activeIndex;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    id={optionId(index)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      selected ? 'bg-accent/10' : 'hover:bg-secondary/50',
                    )}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
                      {result.description && (
                        <p className="truncate text-xs text-muted-foreground">{result.description}</p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {result.meta && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{result.meta}</span>}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground" aria-hidden="true">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>esc fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
