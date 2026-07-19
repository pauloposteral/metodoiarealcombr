import { useEffect, useRef, useState } from 'react';

/* ============================================================
 * PACOTE WOW #5 — Prova social ao vivo + navegação flutuante
 * ============================================================ */

/* 1) LIVE ENROLLMENT FEED — desativado até o beta liberar dados reais.
      Manter o componente exportado (para não quebrar imports) mas renderizar null.
      Reativar quando houver base real de alunos + consentimento LGPD para exibir cidade/nome. */
export function LiveEnrollmentFeed() {
  return null;
}

/* 2) ANIMATED STATS — apenas números verificáveis no pré-lançamento. */
const STATS = [
  { end: 13, suffix: '', label: 'Módulos com projeto em cada um' },
  { end: 12, suffix: '', label: 'Ferramentas de IA dominadas na prática' },
  { end: 24, suffix: 'h', label: 'Compromisso de resposta útil no suporte' },
  { end: 7, suffix: ' dias', label: 'Garantia incondicional (CDC art. 49)' },
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
