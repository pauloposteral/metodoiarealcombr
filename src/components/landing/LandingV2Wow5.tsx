import { useEffect, useRef, useState } from 'react';

/* ============================================================
 * PACOTE WOW #5 — Prova social ao vivo + navegação flutuante
 * ============================================================ */

/* 1) LIVE ENROLLMENT FEED — toasts discretos no canto inferior */
const ENROLLMENTS = [
  { name: 'João', city: 'São Paulo, SP', track: 'Trilha Empreendedor' },
  { name: 'Marina', city: 'Belo Horizonte, MG', track: 'Trilha Carreira' },
  { name: 'Rafael', city: 'Curitiba, PR', track: 'Trilha Construtor' },
  { name: 'Camila', city: 'Recife, PE', track: 'Trilha Criador' },
  { name: 'Pedro', city: 'Porto Alegre, RS', track: 'Trilha Empreendedor' },
  { name: 'Ana', city: 'Fortaleza, CE', track: 'Trilha Carreira' },
  { name: 'Lucas', city: 'Salvador, BA', track: 'Trilha Construtor' },
  { name: 'Beatriz', city: 'Brasília, DF', track: 'Trilha Criador' },
  { name: 'Diego', city: 'Florianópolis, SC', track: 'Trilha Empreendedor' },
  { name: 'Juliana', city: 'Manaus, AM', track: 'Trilha Carreira' },
];

export function LiveEnrollmentFeed() {
  const [current, setCurrent] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (dismissed) return;
    // primeira aparição depois de 8s
    const first = setTimeout(() => setCurrent(0), 8000);
    return () => clearTimeout(first);
  }, [dismissed]);

  useEffect(() => {
    if (current === null || dismissed) return;
    // esconde depois de 5s, mostra a próxima depois de 12s
    const hide = setTimeout(() => setCurrent(null), 5000);
    const next = setTimeout(() => {
      idxRef.current = (idxRef.current + 1) % ENROLLMENTS.length;
      setCurrent(idxRef.current);
    }, 17000);
    return () => { clearTimeout(hide); clearTimeout(next); };
  }, [current, dismissed]);

  if (current === null || dismissed) return null;
  const e = ENROLLMENTS[current];
  const mins = 2 + ((current * 7) % 27);

  return (
    <div className="lv2-fomo" role="status" aria-live="polite">
      <div className="lv2-fomo-dot" />
      <div className="lv2-fomo-body">
        <b>{e.name}</b> de {e.city}
        <span>entrou na {e.track} · há {mins} min</span>
      </div>
      <button className="lv2-fomo-x" onClick={() => setDismissed(true)} aria-label="Fechar">×</button>
    </div>
  );
}

/* 2) ANIMATED STATS — números grandes que contam ao aparecer */
const STATS = [
  { end: 2847, suffix: '+', label: 'Alunos ativos executando' },
  { end: 96, suffix: '%', label: 'Concluem o primeiro projeto' },
  { end: 13, suffix: '', label: 'Módulos, 12 ferramentas dominadas' },
  { end: 24, suffix: 'h', label: 'Tempo médio de resposta no suporte' },
];

function useCountUp(end: number, active: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return n;
}

function StatItem({ end, suffix, label, active }: typeof STATS[0] & { active: boolean }) {
  const n = useCountUp(end, active);
  return (
    <div className="lv2-stat">
      <div className="lv2-stat-num">{n.toLocaleString('pt-BR')}<em>{suffix}</em></div>
      <div className="lv2-stat-lbl">{label}</div>
    </div>
  );
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="lv2-stats-grid">
      {STATS.map((s) => <StatItem key={s.label} {...s} active={active} />)}
    </div>
  );
}

/* 3) FLOATING SECTION NAV — pontinhos verticais à direita */
const SECTIONS = [
  { id: 'modulos', label: 'Módulos' },
  { id: 'trilhas', label: 'Trilhas' },
  { id: 'playground', label: 'Playground' },
  { id: 'roi', label: 'ROI' },
  { id: 'jornada', label: 'Jornada' },
  { id: 'oferta', label: 'Oferta' },
  { id: 'faq', label: 'FAQ' },
];

export function FloatingSectionNav() {
  const [activeId, setActiveId] = useState<string>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <nav className="lv2-fnav" aria-label="Navegação da página">
      {SECTIONS.map(s => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`lv2-fnav-dot ${activeId === s.id ? 'is-active' : ''}`}
          aria-label={s.label}
        >
          <span className="lv2-fnav-tip">{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
