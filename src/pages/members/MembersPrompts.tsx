import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, Copy, Lock, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { isTrackKey, TRACKS, type TrackKey } from '@/lib/curriculum';
import {
  buildPromptLibrary, filterPromptEntries, groupPromptsByModule, isPromptModuleInTrack,
  type PromptEntry, type PromptLibrary, type PromptModule,
} from '@/lib/promptLibrary';

const ALL_MODULES = 'todos';

interface LoadedLibrary {
  library: PromptLibrary;
  track: TrackKey | null;
}

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: LoadedLibrary };

/** Row-level security returns only the lessons this learner can open, so their prompts are the library. */
async function loadPromptLibrary(): Promise<LoadedLibrary> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error('No session');
  const [lessons, modules, profile] = await Promise.all([
    supabase.from('lessons').select('id, title, prompts, module_id, order_index'),
    // Admins can read hidden modules (e.g. the archive of the previous version); learners never see them.
    supabase.from('modules').select('id, code, title, order_index, trails').eq('is_published', true),
    supabase.from('profiles').select('learning_track').eq('id', user.id).maybeSingle(),
  ]);
  if (lessons.error) throw lessons.error;
  if (modules.error) throw modules.error;
  // The track only powers an optional filter: a failure here should not hide the library.
  if (profile.error) console.error('[MembersPrompts] could not read learning_track', profile.error);
  const track = profile.data?.learning_track;
  return {
    library: buildPromptLibrary(modules.data ?? [], lessons.data ?? []),
    track: isTrackKey(track) ? track : null,
  };
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`;
}

function moduleLabel(module: PromptModule): string {
  return module.code ? `${module.code} · ${module.title}` : module.title;
}

function CopyPromptButton({ entry }: { entry: PromptEntry }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(entry.text);
      setCopied(true);
      toast({ title: 'Prompt copiado', description: 'Cole na sua IA e troque o que estiver entre colchetes.' });
    } catch (error) {
      console.error('[MembersPrompts] copy failed', { lessonId: entry.lessonId, error });
      toast({ title: 'Não foi possível copiar', description: 'Selecione o texto do prompt e copie manualmente.', variant: 'destructive' });
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? 'Copiado' : 'Copiar'}
      <span className="sr-only"> prompt {entry.position} da aula {entry.lessonTitle}</span>
    </Button>
  );
}

function PromptCard({ entry }: { entry: PromptEntry }) {
  return (
    <li className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 text-sm">
          <Link
            to={`/membros/aula/${entry.lessonId}`}
            className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="[overflow-wrap:anywhere]">{entry.lessonTitle}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">(abrir a aula)</span>
          </Link>
          <p className="text-xs text-muted-foreground">Prompt {entry.position}</p>
        </div>
        <CopyPromptButton entry={entry} />
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 font-mono text-[13px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
        {entry.text}
      </p>
    </li>
  );
}

function LockedNotice({ lockedModules, hasPrompts }: { lockedModules: number; hasPrompts: boolean }) {
  return (
    <Alert role="note">
      <Lock className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{hasPrompts ? 'Mais prompts chegam com as próximas aulas liberadas' : 'Os prompts aparecem aqui quando as aulas são liberadas'}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {lockedModules === 1 ? '1 módulo ainda está bloqueado' : `${lockedModules.toLocaleString('pt-BR')} módulos ainda estão bloqueados`} na sua conta.
          Esta biblioteca reúne os prompts das aulas liberadas para você; na conta gratuita, são as aulas de amostra
          do MOD-00 e do MOD-01. Quando outras aulas forem liberadas, os prompts delas entram aqui automaticamente.
        </p>
        <Link to="/membros/cursos" className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-2">
          Ver o curso e as opções de acesso
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </AlertDescription>
    </Alert>
  );
}

function PromptBrowser({ library, track }: LoadedLibrary) {
  const personalTrack = track && track !== 'completa' ? track : null;
  const [query, setQuery] = useState('');
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [trackOnly, setTrackOnly] = useState(personalTrack !== null);
  const activeTrack = trackOnly ? personalTrack : null;

  const moduleOptions = useMemo(
    () => library.modules.filter((module) => isPromptModuleInTrack(module, activeTrack)),
    [library.modules, activeTrack],
  );
  // A module outside the active track cannot stay selected; derive instead of syncing state.
  const effectiveModuleId = moduleId && moduleOptions.some((module) => module.id === moduleId) ? moduleId : null;
  const countsByModule = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of library.entries) counts.set(entry.module.id, (counts.get(entry.module.id) ?? 0) + 1);
    return counts;
  }, [library.entries]);
  const visible = useMemo(
    () => filterPromptEntries(library.entries, { query, moduleId: effectiveModuleId, track: activeTrack }),
    [library.entries, query, effectiveModuleId, activeTrack],
  );
  const groups = useMemo(() => groupPromptsByModule(visible), [visible]);
  const filtersActive = query.trim() !== '' || effectiveModuleId !== null;

  const clearFilters = () => {
    setQuery('');
    setModuleId(null);
  };

  return (
    <div className="space-y-6">
      {library.lockedModuleCount > 0 && <LockedNotice lockedModules={library.lockedModuleCount} hasPrompts />}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <div className="relative min-w-0">
          <label htmlFor="prompts-search" className="sr-only">Buscar prompts</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="prompts-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tema, aula ou módulo…"
            className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
            autoComplete="off"
          />
          {query && (
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setQuery('')} aria-label="Limpar busca">
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="min-w-0">
          <Label htmlFor="prompts-module" className="sr-only">Filtrar por módulo</Label>
          <Select value={effectiveModuleId ?? ALL_MODULES} onValueChange={(value) => setModuleId(value === ALL_MODULES ? null : value)}>
            <SelectTrigger id="prompts-module"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MODULES}>Todos os módulos</SelectItem>
              {moduleOptions.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {moduleLabel(module)} ({countsByModule.get(module.id) ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {personalTrack ? (
          <div className="flex items-center gap-2">
            <Switch id="prompts-track" checked={trackOnly} onCheckedChange={setTrackOnly} />
            <Label htmlFor="prompts-track" className="cursor-pointer">Só a minha trilha ({TRACKS[personalTrack].label})</Label>
          </div>
        ) : track === null ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/membros/trilha" className="font-medium text-foreground underline underline-offset-2">Descubra a sua trilha</Link>{' '}
            para filtrar os prompts dos módulos dela.
          </p>
        ) : <span />}
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          Mostrando {visible.length.toLocaleString('pt-BR')} de {plural(library.entries.length, 'prompt', 'prompts')}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <p className="font-medium text-foreground">Nenhum prompt encontrado com esses filtros.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTrack ? 'Tente outra palavra ou desligue o filtro da trilha.' : 'Tente outra palavra ou escolha outro módulo.'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {filtersActive && <Button type="button" variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
            {activeTrack && <Button type="button" variant="outline" onClick={() => setTrackOnly(false)}>Ver todas as trilhas</Button>}
          </div>
        </div>
      ) : (
        groups.map((group) => {
          const headingId = `prompts-modulo-${group.module.id}`;
          return (
            <section key={group.module.id} aria-labelledby={headingId} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border/50 pb-2">
                <h2 id={headingId} className="font-display text-lg font-bold text-foreground [overflow-wrap:anywhere]">
                  {group.module.code && <><span className="font-mono text-sm text-muted-foreground">{group.module.code}</span>{' '}</>}
                  {group.module.title}
                </h2>
                <span className="text-xs text-muted-foreground">{plural(group.entries.length, 'prompt', 'prompts')}</span>
              </div>
              <ul className="space-y-3">
                {group.entries.map((entry) => <PromptCard key={entry.key} entry={entry} />)}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function EmptyLibrary({ lockedModules }: { lockedModules: number }) {
  if (lockedModules > 0) return <LockedNotice lockedModules={lockedModules} hasPrompts={false} />;
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
      <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
      <p className="font-medium text-foreground">Ainda não há prompts publicados.</p>
      <p className="mt-1 text-sm text-muted-foreground">Os prompts das aulas aparecem aqui assim que forem publicados.</p>
    </div>
  );
}

function PromptsContent() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadPromptLibrary().then(
      (data) => { if (active) setState({ status: 'ready', data }); },
      (error: unknown) => {
        console.error('[MembersPrompts] failed to load the prompt library', error);
        if (active) setState({ status: 'error' });
      },
    );
    return () => { active = false; };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  };

  const library = state.status === 'ready' ? state.data.library : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          Material de apoio
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Biblioteca de prompts</h1>
        <p className="mt-2 text-muted-foreground">Todos os prompts das aulas liberadas para você, prontos para copiar e adaptar.</p>
        {library && library.entries.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {plural(library.entries.length, 'prompt', 'prompts')} em {plural(library.lessonCount, 'aula', 'aulas')} de {plural(library.modules.length, 'módulo', 'módulos')}
          </p>
        )}
      </header>

      {state.status === 'loading' && (
        <div role="status" className="space-y-3">
          <span className="sr-only">Carregando prompts…</span>
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <p className="font-medium text-foreground">Não foi possível carregar os prompts.</p>
          <p className="mt-1 text-sm text-muted-foreground">Verifique a sua conexão e tente de novo.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={retry}>
            <RotateCcw aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        state.data.library.entries.length === 0
          ? <EmptyLibrary lockedModules={state.data.library.lockedModuleCount} />
          : <PromptBrowser key={attempt} library={state.data.library} track={state.data.track} />
      )}
    </div>
  );
}

export default function MembersPrompts() {
  return (
    <MembersLayout>
      <Helmet>
        <title>Biblioteca de prompts | Método IA Real</title>
      </Helmet>
      <PromptsContent />
    </MembersLayout>
  );
}
