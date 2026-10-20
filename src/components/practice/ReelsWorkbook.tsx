import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Clipboard, Download, Film, Lightbulb, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { emptyReelDraft, exportReelDraft, parseReelDraft, reelDraftKey, reelStepKey, parseReelStep, reelPrompt, reelReadiness, REELS_STEPS, REEL_CHECKS, REEL_EXAMPLES, REEL_FIELD_LIMIT, REEL_LABELS, REEL_REVIEW_LABELS, type ReelDraft, type ReelField } from '@/lib/reelsWorkbook';

export function ReelsWorkbook({ userId }: { userId: string }) {
  const key = reelDraftKey(userId);
  const stepKey = reelStepKey(userId);
  const [draft, setDraft] = useState<ReelDraft>(() => { try { return parseReelDraft(sessionStorage.getItem(key)) ?? emptyReelDraft(); } catch { return emptyReelDraft(); } });
  const [step, setStep] = useState(() => { try { return parseReelStep(sessionStorage.getItem(stepKey)); } catch { return 0; } });
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const focusStep = useRef(false);
  const signedOut = useRef(false);
  const current = REELS_STEPS[step]; const readiness = reelReadiness(draft);
  useEffect(() => {
    if (signedOut.current) return;
    try { sessionStorage.setItem(key, JSON.stringify(draft)); setStorageError(false); } catch { setStorageError(true); }
  }, [draft, key]);
  useEffect(() => {
    if (signedOut.current) return;
    try { sessionStorage.setItem(stepKey, String(step)); } catch { setStorageError(true); }
  }, [step, stepKey]);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (session?.user && session.user.id !== userId)) {
        signedOut.current = true;
        try { sessionStorage.removeItem(key); sessionStorage.removeItem(stepKey); } catch { /* storage may be disabled */ }
        setDraft(emptyReelDraft()); setStep(0);
      }
    });
    return () => subscription.unsubscribe();
  }, [key, stepKey, userId]);
  useLayoutEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    title.current?.focus({ preventScroll: true });
  }, [step]);
  function move(index: number) {
    if (index < 0 || index >= REELS_STEPS.length) return;
    try { sessionStorage.setItem(stepKey, String(index)); } catch { setStorageError(true); }
    focusStep.current = true;
    setStep(index);
    setMessage('');
  }
  function change(field: ReelField, value: string) { setDraft(previous => ({ ...previous, fields: { ...previous.fields, [field]: value.slice(0, REEL_FIELD_LIMIT) } })); }
  function download() {
    const url = URL.createObjectURL(new Blob([exportReelDraft(draft)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'meu-roteiro-reel.md'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('Roteiro exportado. Nenhum vídeo foi publicado e o progresso do curso não foi alterado.');
  }
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(reelPrompt(draft)); setMessage('Prompt copiado. Revise e use na ferramenta que você escolher. Nenhuma chamada de IA foi feita.'); }
    catch { setShowPrompt(true); setMessage('A cópia automática não ficou disponível. O prompt está aberto abaixo para você selecionar.'); }
  }
  return <section aria-label="Oficina de Reels" data-reels-workbook className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{readiness.completed} de {readiness.total} campos preenchidos · não é nota</span><Button type="button" variant="outline" className="min-h-11" onClick={download}><Download className="mr-2 h-4 w-4" />Baixar rascunho</Button></div>
    <nav aria-label="Passos da oficina"><ol data-reels-steps className="touch-scroll-steps grid grid-cols-3 gap-2 sm:grid-cols-6">{REELS_STEPS.map((item, index) => <li key={item.id}><button type="button" onClick={() => move(index)} aria-current={step === index ? 'step' : undefined} className={`flex min-h-14 w-full flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${step === index ? 'border-accent bg-accent/15 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-secondary'}`}><span className="text-xs">{String(index + 1).padStart(2, '0')}</span><span className="font-medium">{item.label}</span></button></li>)}</ol></nav>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,.55fr)]">
      <div className="min-w-0 rounded-2xl border bg-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passo {step + 1} de 6</p>
        <h2 ref={title} tabIndex={-1} className="mt-2 font-display text-2xl font-bold outline-none">{current.label}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{current.description}</p>
        <div className="mt-6 space-y-6">{current.fields.map(field => <div key={field}>
          <label htmlFor={`reel-${field}`} className="mb-2 block text-sm font-semibold">{REEL_LABELS[field]}</label>
          <Textarea id={`reel-${field}`} value={draft.fields[field]} onChange={event => change(field, event.target.value)} maxLength={REEL_FIELD_LIMIT} rows={field === 'audience' || field === 'hook' ? 3 : 5} placeholder="Escreva do seu jeito…" aria-describedby={`reel-${field}-help`} className="resize-y text-base leading-relaxed" />
          <p id={`reel-${field}-help`} className="mt-1 text-right text-xs text-muted-foreground">{draft.fields[field].length}/{REEL_FIELD_LIMIT}</p>
          <details className="mt-3 rounded-xl bg-secondary/50 p-3 text-sm"><summary className="flex min-h-11 cursor-pointer items-center font-medium">Ver um exemplo fictício</summary><p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{REEL_EXAMPLES[field]}</p>{!draft.fields[field] && <Button variant="link" className="mt-2 min-h-11 p-0" onClick={() => change(field, REEL_EXAMPLES[field])}>Usar este exemplo para praticar</Button>}</details>
        </div>)}</div>
        {step === 5 && <fieldset className="mt-6 space-y-3 rounded-xl border p-4"><legend className="px-1 text-sm font-semibold">Minha revisão</legend>{REEL_CHECKS.map(check => <label key={check} className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={draft.checks[check]} onChange={event => setDraft(previous => ({ ...previous, checks: { ...previous.checks, [check]: event.target.checked } }))} className="mt-1 h-5 w-5 shrink-0 accent-[#aa7a12]" />{REEL_REVIEW_LABELS[check]}</label>)}</fieldset>}
        <div className="reels-step-actions mt-7 flex items-center justify-between gap-3"><Button type="button" variant="ghost" className="min-h-12" disabled={step === 0} onClick={() => move(step - 1)}><ArrowLeft className="mr-1 h-4 w-4" />Voltar</Button>{step < 5 ? <Button type="button" className="min-h-12" onClick={() => move(step + 1)}>Próximo passo<ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button type="button" className="min-h-12" onClick={download}><Download className="mr-2 h-4 w-4" />Exportar roteiro</Button>}</div>
      </div>
      <aside className="min-w-0 space-y-4" aria-label="Prévia e orientação">
        <div className="overflow-hidden rounded-2xl bg-[#0b1628] text-white"><div className="relative h-36"><img src="/media/school/creator-480.webp" width="480" height="362" loading="lazy" alt="Cena ilustrativa de uma criadora fictícia preparando um vídeo; imagem gerada por IA." className="h-full w-full object-cover object-[center_45%]" /><span className="absolute bottom-2 left-3 rounded bg-black/70 px-2 py-1 text-[10px]">Ilustração gerada por IA</span></div><div className="p-5"><p className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-200"><Film size={14} />Prévia do roteiro, não do vídeo</p><p className="mt-3 break-words text-xl font-semibold">{draft.fields.hook || 'Sua primeira frase aparece aqui.'}</p><p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-slate-300">{draft.fields.idea || 'Uma ideia clara. Uma demonstração. Um próximo passo.'}</p></div></div>
        <div className="rounded-2xl border bg-card p-5"><h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-gold-dark" />Use IA como apoio</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Seu rascunho vira um pedido de revisão. Você escolhe a ferramenta e confere a resposta.</p><Button type="button" variant="outline" className="mt-4 min-h-11 w-full" onClick={() => void copyPrompt()}><Clipboard className="mr-2 h-4 w-4" />Copiar prompt de revisão</Button></div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Rascunho nesta aba e nesta conta. Não é salvo na nuvem. Exporte antes de fechar a aba ou sair. Não inclua dados pessoais ou segredos.</p>
      </aside>
    </div>
    {storageError && <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">O navegador não permitiu manter o rascunho nesta aba. O texto continua nesta tela: baixe uma cópia antes de sair.</p>}
    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{message || (readiness.ready ? 'Checklist preenchido por você. Revise o arquivo e grave seu vídeo; isso não é aprovação automática.' : 'Você pode voltar a qualquer passo. Navegar não conclui aulas nem publica conteúdo.')}</p>
    {showPrompt && <div><label htmlFor="reel-prompt" className="text-sm font-medium">Prompt para copiar manualmente</label><Textarea id="reel-prompt" readOnly value={reelPrompt(draft)} rows={10} className="mt-2" /></div>}
    <details className="rounded-2xl border bg-card p-5 text-sm"><summary className="flex min-h-11 cursor-pointer items-center font-medium">Como gravar, editar e avaliar</summary><div className="mt-4 space-y-3 leading-relaxed text-muted-foreground"><p>Prepare as tomadas antes de gerar clipes. Grave material próprio ou use personagens e vozes autorizados. Revise continuidade, legendas e direitos de uso; identifique conteúdo sintético quando exigido.</p><p>Edite no aplicativo de sua escolha. Exporte e veja no celular com e sem som. Depois, registre o objetivo e os indicadores disponíveis na sua conta. Uma mudança de resultado não prova que o gancho foi a única causa.</p><p>Não existe fórmula de viralização garantida. Use cada publicação para aprender, não para fabricar números.</p><p className="flex flex-wrap gap-3"><a className="underline" href="https://about.fb.com/news/2025/04/introducing-edits-streamlined-video-creation-app/" target="_blank" rel="noopener noreferrer">Meta: Edits</a><a className="underline" href="https://about.fb.com/news/2023/04/instagram-reels-trending-audio-and-gifts-updates/" target="_blank" rel="noopener noreferrer">Meta: tempo assistido</a><a className="underline" href="https://about.fb.com/br/news/2024/04/ajudando-o-criador-de-conteudo-a-encontrar-novos-publicos/" target="_blank" rel="noopener noreferrer">Meta: conteúdo original</a></p></div></details>
  </section>;
}
