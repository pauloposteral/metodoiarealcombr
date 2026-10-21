import { useCallback, useEffect, useRef, useState } from 'react';
import { StickyNote, Save, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { noteDraftKey, noteSaveResult, parseNoteDraft, reconcileNoteDraft, type NoteVersion } from '@/lib/noteRevision';

type Phase = 'loading' | 'clean' | 'dirty' | 'saving' | 'error' | 'conflict' | 'load-error';
export const LessonNotes = ({ lessonId }: { lessonId: string }) => {
  const { data: user } = useAuthUser();
  if (!user) return null;
  return <NotesEditor key={`${user.id}:${lessonId}`} userId={user.id} lessonId={lessonId} />;
};

function NotesEditor({ userId, lessonId }: { userId: string; lessonId: string }) {
  const key = noteDraftKey(userId, lessonId);
  const [content, setContent] = useState(''); const contentRef = useRef('');
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading'); const phaseRef = useRef<Phase>('loading');
  const [storageError, setStorageError] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [latest, setLatest] = useState<NoteVersion | null>(null);
  const base = useRef<NoteVersion | null>(null); const expected = useRef<string | null>(null);
  const alive = useRef(true); const loaded = useRef(false); const saving = useRef(false); const signedOut = useRef(false);
  const status = useCallback((value: Phase) => { phaseRef.current = value; if (alive.current) setPhase(value); }, []);
  const remember = useCallback((text: string, version: string | null) => {
    if (signedOut.current) return;
    try { sessionStorage.setItem(key, JSON.stringify({ version: 1, content: text, baseUpdatedAt: version })); if (alive.current) setStorageError(false); }
    catch { if (alive.current) setStorageError(true); }
  }, [key]);
  const readServer = useCallback(async () => {
    const { data, error } = await supabase.from('lesson_notes').select('id, content, updated_at').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    if (error) throw error; return data as NoteVersion | null;
  }, [lessonId, userId]);

  useEffect(() => {
    let cancelled = false; alive.current = true; loaded.current = false; status('loading');
    void (async () => {
      let cached = null;
      try { cached = parseNoteDraft(sessionStorage.getItem(key)); } catch { setStorageError(true); }
      try {
        const server = await readServer(); if (cancelled) return;
        const resolved = reconcileNoteDraft(server, cached);
        base.current = server; expected.current = resolved.kind === 'conflict' ? cached?.baseUpdatedAt ?? null : server?.updated_at ?? null;
        contentRef.current = resolved.content; setContent(resolved.content); setExpanded(Boolean(resolved.content)); setLastSaved(server?.updated_at ?? null); loaded.current = true;
        if (resolved.kind === 'conflict') { setLatest(server); status('conflict'); }
        else { status(resolved.kind === 'restore' ? 'dirty' : 'clean'); if (resolved.kind === 'server') { try { sessionStorage.removeItem(key); } catch { /* keep server state */ } } }
      } catch {
        if (cancelled) return;
        if (cached) { contentRef.current = cached.content; setContent(cached.content); setExpanded(true); }
        status('load-error');
      }
    })();
    return () => { cancelled = true; alive.current = false; };
  }, [key, readServer, status]);

  const save = useCallback(async () => {
    if (!loaded.current || saving.current || signedOut.current || phaseRef.current === 'conflict') return;
    const sent = contentRef.current; const version = expected.current; const previous = base.current;
    saving.current = true; status('saving'); remember(sent, version);
    try {
      const updatedAt = new Date(Math.max(Date.now(), Date.parse(version ?? '') + 1 || 0)).toISOString();
      const result = previous
        ? await supabase.from('lesson_notes').update({ content: sent, updated_at: updatedAt }).eq('id', previous.id).eq('user_id', userId).eq('lesson_id', lessonId).eq('updated_at', version ?? previous.updated_at).select('id, content, updated_at').maybeSingle()
        : await supabase.from('lesson_notes').insert({ user_id: userId, lesson_id: lessonId, content: sent, updated_at: updatedAt }).select('id, content, updated_at').single();
      if ((!result.error && !result.data) || result.error?.code === '23505') {
        const newer = await readServer(); if (!alive.current || signedOut.current) return;
        setLatest(newer); status('conflict'); return;
      }
      if (result.error) throw result.error;
      if (!result.data) throw new Error('No saved note returned');
      const saved = result.data as NoteVersion;
      if (signedOut.current) return;
      // A pending response may outlive this component. Only touch the matching cached revision.
      if (!alive.current) {
        try { const cached = parseNoteDraft(sessionStorage.getItem(key)); if (cached?.baseUpdatedAt === version) { if (cached.content === sent) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify({ ...cached, baseUpdatedAt: saved.updated_at })); } } catch { /* draft remains best effort */ }
        return;
      }
      base.current = saved; expected.current = saved.updated_at; setLastSaved(saved.updated_at);
      const next = noteSaveResult(contentRef.current, sent);
      if (next.dirty) { remember(next.content, saved.updated_at); status('dirty'); }
      else { try { sessionStorage.removeItem(key); } catch { /* cloud save was confirmed */ } status('clean'); }
    } catch { if (alive.current && !signedOut.current) status('error'); }
    finally { saving.current = false; }
  }, [key, lessonId, readServer, remember, status, userId]);

  useEffect(() => { if (phase !== 'dirty') return; const timer = setTimeout(() => void save(), 2000); return () => clearTimeout(timer); }, [content, phase, save]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (['dirty', 'saving', 'error', 'conflict'].includes(phaseRef.current)) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (session?.user && session.user.id !== userId)) {
        signedOut.current = true;
        try { for (const k of Object.keys(sessionStorage)) if (k.startsWith(`ia-real:note-draft-v1:${userId}:`)) sessionStorage.removeItem(k); } catch { /* session storage may be disabled */ }
      }
    });
    return () => { window.removeEventListener('beforeunload', beforeUnload); subscription.unsubscribe(); };
  }, [userId]);

  function change(text: string) {
    contentRef.current = text; setContent(text); remember(text, expected.current);
    if (phaseRef.current !== 'conflict' && phaseRef.current !== 'load-error' && !saving.current) status('dirty');
  }
  function useCloudVersion() {
    base.current = latest; expected.current = latest?.updated_at ?? null; contentRef.current = latest?.content ?? ''; setContent(contentRef.current); setLastSaved(latest?.updated_at ?? null); status('clean');
    try { sessionStorage.removeItem(key); } catch { /* no local draft needed */ }
  }
  function keepLocalVersion() { base.current = latest; expected.current = latest?.updated_at ?? null; remember(contentRef.current, expected.current); status('dirty'); }
  function download() {
    const url = URL.createObjectURL(new Blob([contentRef.current], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `anotacoes-${lessonId}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (!expanded) return <button onClick={() => setExpanded(true)} className="mb-8 flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/30 bg-secondary/30 px-5 py-4 text-left transition-colors hover:bg-secondary/50"><StickyNote className="h-5 w-5 shrink-0 text-accent" /><span><span className="block text-sm font-medium">Minhas anotações</span><span className="block text-xs text-muted-foreground">Abra para escrever ou recuperar seu rascunho.</span></span></button>;
  return <section className="mb-8 rounded-2xl border border-border/50 bg-card p-5" aria-labelledby="lesson-notes-title">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 id="lesson-notes-title" className="flex items-center gap-2 font-display text-sm font-bold"><StickyNote className="h-4 w-4 text-accent" />Minhas anotações</h3><span role="status" className="text-xs text-muted-foreground">{phase === 'saving' ? 'Salvando…' : phase === 'clean' && lastSaved ? 'Salvo na nuvem' : phase === 'dirty' ? 'Rascunho nesta aba' : phase === 'loading' ? 'Carregando…' : ''}</span></div>
    <label htmlFor={`notes-${lessonId}`} className="sr-only">Anotações desta aula</label><Textarea id={`notes-${lessonId}`} value={content} onChange={event => change(event.target.value)} disabled={phase === 'loading'} rows={5} placeholder="Escreva suas anotações sobre esta aula…" className="resize-y bg-secondary/20 text-base" />
    {(phase === 'error' || phase === 'load-error') && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{phase === 'load-error' ? 'Não foi possível carregar a versão da nuvem. Seu rascunho local foi mantido; recarregue antes de salvar.' : 'Não foi possível salvar na nuvem. Seu texto continua aqui. Tente novamente ou baixe uma cópia.'}</p>}
    {phase === 'conflict' && <div role="alert" className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><p className="text-sm font-semibold">Há uma versão mais recente na nuvem.</p><p className="mt-1 text-sm">Seu rascunho foi preservado. Nenhuma versão foi substituída.</p><details className="mt-3 text-sm"><summary className="cursor-pointer">Ver a versão da nuvem</summary><p className="mt-2 whitespace-pre-wrap break-words">{latest?.content || 'A anotação foi removida ou está vazia.'}</p></details><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={useCloudVersion}>Usar versão da nuvem</Button><Button onClick={keepLocalVersion}>Salvar meu rascunho</Button></div></div>}
    {storageError && <p role="alert" className="mt-3 text-sm text-amber-700 dark:text-amber-200">A recuperação nesta aba está indisponível. Baixe uma cópia antes de sair caso o salvamento na nuvem ainda não tenha terminado.</p>}
    <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={phase === 'loading' || phase === 'saving' || phase === 'conflict' || phase === 'load-error'} onClick={() => void save()}>{phase === 'saving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Salvar agora</Button><Button size="sm" variant="ghost" onClick={download}><Download className="mr-2 h-4 w-4" />Baixar cópia</Button>{phase === 'load-error' && <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Recarregar notas</Button>}</div>
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Salvamento automático após uma pausa. Até a confirmação, mantenha esta aba ou baixe uma cópia. Rascunhos locais são removidos ao sair da conta; não inclua senhas ou dados sensíveis.</p>
  </section>;
}
