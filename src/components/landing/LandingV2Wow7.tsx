import { useEffect, useMemo, useRef, useState } from 'react';

/* ============================================================
 * PACOTE WOW #7 — Quiz de trilha + Command Palette + Confetti
 * ============================================================ */

/* ────────────────────────────────────────────────────────────
 * 1) TRACK QUIZ — 3 perguntas → trilha ideal
 * ──────────────────────────────────────────────────────────── */

type TrackId = 'carreira' | 'empreendedor' | 'criador' | 'construtor';

const QUESTIONS: Array<{
  q: string;
  options: Array<{ label: string; weights: Record<TrackId, number> }>;
}> = [
  {
    q: 'Onde você está hoje?',
    options: [
      { label: 'CLT em empresa — quero performar mais no cargo',            weights: { carreira: 3, empreendedor: 0, criador: 0, construtor: 1 } },
      { label: 'Tenho um pequeno negócio ou trabalho por conta',            weights: { carreira: 0, empreendedor: 3, criador: 1, construtor: 0 } },
      { label: 'Produzo conteúdo — ou quero começar a produzir',            weights: { carreira: 0, empreendedor: 1, criador: 3, construtor: 0 } },
      { label: 'Quero construir produto/software mesmo sem programar',     weights: { carreira: 0, empreendedor: 1, criador: 0, construtor: 3 } },
    ],
  },
  {
    q: 'Qual dor bate mais forte hoje?',
    options: [
      { label: 'Sinto que vou ficar para trás no meu trabalho',             weights: { carreira: 3, empreendedor: 0, criador: 0, construtor: 0 } },
      { label: 'Faturo, mas o tempo não sobra pra nada',                    weights: { carreira: 1, empreendedor: 3, criador: 0, construtor: 0 } },
      { label: 'Não consigo produzir conteúdo com constância',              weights: { carreira: 0, empreendedor: 1, criador: 3, construtor: 0 } },
      { label: 'Tenho ideia de app/produto mas não sei por onde começar',   weights: { carreira: 0, empreendedor: 0, criador: 0, construtor: 3 } },
    ],
  },
  {
    q: 'O que você quer no fim dos 30 dias?',
    options: [
      { label: 'Kit pessoal de produtividade + CV/LinkedIn com IA',         weights: { carreira: 3, empreendedor: 0, criador: 0, construtor: 0 } },
      { label: 'Sistema de conteúdo/vendas rodando no meu negócio',         weights: { carreira: 0, empreendedor: 3, criador: 1, construtor: 0 } },
      { label: 'Calendário de 30 posts + identidade visual pronta',         weights: { carreira: 0, empreendedor: 1, criador: 3, construtor: 0 } },
      { label: 'Um micro-app publicado, com link para mandar pra alguém',   weights: { carreira: 0, empreendedor: 0, criador: 0, construtor: 3 } },
    ],
  },
];

const TRACK_META: Record<TrackId, { name: string; hours: string; blurb: string; anchor: string }> = {
  carreira:     { name: 'Trilha Carreira / CLT',        hours: '~15h', blurb: 'Você aumenta a régua no cargo, sem parecer preguiça — e ainda leva certificação em ferramenta.', anchor: '#trilhas' },
  empreendedor: { name: 'Trilha Empreendedor',          hours: '~20h', blurb: 'Você automatiza atendimento, cria conteúdo e testa produto sem contratar mais uma pessoa.',      anchor: '#trilhas' },
  criador:      { name: 'Trilha Criador',               hours: '~18h', blurb: 'Você ganha um estúdio inteiro no computador — imagem, vídeo, voz e roteiro em fluxo único.',    anchor: '#trilhas' },
  construtor:   { name: 'Trilha Construtor (no-code)',  hours: '~22h', blurb: 'Você publica seu primeiro app com login, banco e domínio — e aprende a consertar quando quebra.', anchor: '#trilhas' },
};

export function TrackQuiz({ onCta }: { onCta: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>([null, null, null]);

  const result = useMemo<TrackId | null>(() => {
    if (answers.some(a => a === null)) return null;
    const totals: Record<TrackId, number> = { carreira: 0, empreendedor: 0, criador: 0, construtor: 0 };
    answers.forEach((ans, qi) => {
      if (ans === null) return;
      const w = QUESTIONS[qi].options[ans].weights;
      (Object.keys(w) as TrackId[]).forEach(k => (totals[k] += w[k]));
    });
    return (Object.keys(totals) as TrackId[]).sort((a, b) => totals[b] - totals[a])[0];
  }, [answers]);

  const pick = (idx: number) => {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 220);
  };

  const reset = () => { setStep(0); setAnswers([null, null, null]); };

  const done = result !== null;
  const progress = ((answers.filter(a => a !== null).length) / QUESTIONS.length) * 100;

  return (
    <div className="lv2-quiz">
      <div className="lv2-quiz-head">
        <div>
          <span className="lv2-eyebrow">Descubra sua trilha · 45 segundos</span>
          <h3>3 perguntas. <em>Sua trilha ideal</em> no fim.</h3>
        </div>
        {done ? (
          <button className="lv2-quiz-reset" onClick={reset}>↺ Refazer</button>
        ) : (
          <span className="lv2-quiz-step">{step + 1} / {QUESTIONS.length}</span>
        )}
      </div>

      <div className="lv2-quiz-bar"><div style={{ width: `${done ? 100 : progress}%` }} /></div>

      {!done && (
        <div className="lv2-quiz-body" key={step}>
          <p className="lv2-quiz-q">{QUESTIONS[step].q}</p>
          <div className="lv2-quiz-opts">
            {QUESTIONS[step].options.map((o, i) => (
              <button
                key={i}
                className={`lv2-quiz-opt ${answers[step] === i ? 'is-active' : ''}`}
                onClick={() => pick(i)}
              >
                <span className="lv2-quiz-opt-mark">{answers[step] === i ? '●' : '○'}</span>
                {o.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button className="lv2-quiz-back" onClick={() => setStep(step - 1)}>← Voltar</button>
          )}
        </div>
      )}

      {done && result && (
        <div className="lv2-quiz-result">
          <span className="lv2-eyebrow">Sua trilha recomendada</span>
          <h4>{TRACK_META[result].name}</h4>
          <p>{TRACK_META[result].blurb}</p>
          <div className="lv2-quiz-result-meta">
            <span>◆ {TRACK_META[result].hours} de execução</span>
            <span>◆ Projeto publicado ao final</span>
            <span>◆ Radar mensal incluso</span>
          </div>
          <div className="lv2-quiz-result-cta">
            <button className="lv2-btn" onClick={onCta}>Começar por essa trilha <span className="arr">→</span></button>
            <a href={TRACK_META[result].anchor} className="lv2-quiz-alt">Ver as 4 trilhas lado a lado</a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 2) COMMAND PALETTE (⌘K) — atalhos e navegação
 * ──────────────────────────────────────────────────────────── */

type Cmd = { id: string; label: string; hint: string; kind: 'nav' | 'action'; run: () => void };

export function CommandPalette({ onCta }: { onCta: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const navTo = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  const commands: Cmd[] = useMemo(() => [
    { id: 'buy', label: 'Garantir minha vaga agora',   hint: 'Ir para o checkout',        kind: 'action', run: () => { setOpen(false); onCta(); } },
    { id: 'top', label: 'Ir para o topo',              hint: 'Hero · manifesto',          kind: 'nav',    run: () => navTo('#top') },
    { id: 'mod', label: 'Módulos · o mapa completo',   hint: '13 módulos, MOD-00→MOD-12', kind: 'nav',    run: () => navTo('#mapa') },
    { id: 'tri', label: 'Trilhas por perfil',          hint: 'Carreira / Empreendedor / Criador / Construtor', kind: 'nav', run: () => navTo('#trilhas') },
    { id: 'too', label: 'Ferramentas do curso',        hint: '16 IAs por categoria',      kind: 'nav',    run: () => navTo('#ferramentas') },
    { id: 'ply', label: 'Playground · testar a IA',    hint: 'Experimente antes de comprar', kind: 'nav', run: () => navTo('#playground') },
    { id: 'roi', label: 'Calculadora de ROI',          hint: 'Quanto seu tempo vale',     kind: 'nav',    run: () => navTo('#roi') },
    { id: 'jor', label: 'Sua jornada de 30 dias',      hint: 'Do login ao portfólio',     kind: 'nav',    run: () => navTo('#jornada') },
    { id: 'ofe', label: 'A oferta · R$ 497',           hint: 'Stack e preço',             kind: 'nav',    run: () => navTo('#oferta') },
    { id: 'faq', label: 'Dúvidas frequentes',          hint: 'FAQ',                       kind: 'nav',    run: () => navTo('#faq') },
  ], [onCta]);

  const filtered = q.trim()
    ? commands.filter(c => (c.label + ' ' + c.hint).toLowerCase().includes(q.toLowerCase()))
    : commands;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) { setQ(''); setI(0); setTimeout(() => inputRef.current?.focus(), 40); }
  }, [open]);

  useEffect(() => { setI(0); }, [q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI(v => Math.min(filtered.length - 1, v + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI(v => Math.max(0, v - 1)); }
    else if (e.key === 'Enter' && filtered[i]) { e.preventDefault(); filtered[i].run(); }
  };

  return (
    <>
      <button className="lv2-cmd-hint" onClick={() => setOpen(true)} aria-label="Abrir busca">
        <span>Buscar</span>
        <kbd>⌘</kbd><kbd>K</kbd>
      </button>

      {open && (
        <div className="lv2-cmd-overlay" onClick={() => setOpen(false)}>
          <div className="lv2-cmd" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="lv2-cmd-input">
              <span className="lv2-cmd-glass">⌕</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar módulo, trilha ou ação…"
                aria-label="Buscar"
              />
              <kbd>ESC</kbd>
            </div>
            <div className="lv2-cmd-list" role="listbox">
              {filtered.length === 0 && <div className="lv2-cmd-empty">Nada por aqui. Tente "trilhas" ou "oferta".</div>}
              {filtered.map((c, idx) => (
                <button
                  key={c.id}
                  role="option"
                  aria-selected={idx === i}
                  className={`lv2-cmd-item ${idx === i ? 'is-active' : ''}`}
                  onMouseEnter={() => setI(idx)}
                  onClick={c.run}
                >
                  <span className={`lv2-cmd-kind lv2-cmd-kind-${c.kind}`}>{c.kind === 'action' ? '→' : '#'}</span>
                  <span className="lv2-cmd-lbl">
                    <b>{c.label}</b>
                    <em>{c.hint}</em>
                  </span>
                  <span className="lv2-cmd-enter">↵</span>
                </button>
              ))}
            </div>
            <div className="lv2-cmd-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
              <span><kbd>↵</kbd> selecionar</span>
              <span><kbd>ESC</kbd> fechar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * 3) CONFETTI — celebra no clique do CTA principal
 * ──────────────────────────────────────────────────────────── */

const COLORS = ['#6EE7B7', '#3B82F6', '#F472B6', '#FBBF24', '#E8EDF4'];

export function useConfetti() {
  const fire = (origin?: { x: number; y: number }) => {
    const layer = document.createElement('div');
    layer.className = 'lv2-confetti';
    document.body.appendChild(layer);

    const ox = origin?.x ?? window.innerWidth / 2;
    const oy = origin?.y ?? window.innerHeight / 2;
    const N = 90;

    for (let i = 0; i < N; i++) {
      const p = document.createElement('i');
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 320;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 80;
      const rot = (Math.random() - 0.5) * 720;
      const color = COLORS[i % COLORS.length];
      const size = 6 + Math.random() * 8;

      p.style.setProperty('--x', `${dx}px`);
      p.style.setProperty('--y', `${dy}px`);
      p.style.setProperty('--r', `${rot}deg`);
      p.style.left = `${ox}px`;
      p.style.top = `${oy}px`;
      p.style.width = `${size}px`;
      p.style.height = `${size * 0.4}px`;
      p.style.background = color;
      p.style.animationDelay = `${Math.random() * 80}ms`;
      layer.appendChild(p);
    }

    setTimeout(() => layer.remove(), 1600);
  };
  return fire;
}
