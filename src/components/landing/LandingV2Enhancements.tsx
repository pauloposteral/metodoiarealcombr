import { useEffect, useRef, useState } from 'react';

/* ============ Live counters ("Enquanto você lê isso") ============ */
export function LiveCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [vals, setVals] = useState({ prompts: 12847, horas: 8420, alunos: 2547 });
  const started = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const tick = () => {
            setVals((v) => ({
              prompts: v.prompts + (Math.random() < 0.6 ? 1 : 0),
              horas: v.horas + (Math.random() < 0.35 ? 1 : 0),
              alunos: v.alunos + (Math.random() < 0.08 ? 1 : 0),
            }));
          };
          const id = window.setInterval(tick, 1400);
          return () => window.clearInterval(id);
        }
      });
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const fmt = (n: number) => n.toLocaleString('pt-BR');

  return (
    <section className="lv2-live" ref={ref}>
      <div className="lv2-wrap">
        <div className="lv2-live-head rv">
          <span className="lv2-live-dot" />
          <span className="lv2-eyebrow" style={{ margin: 0 }}>Enquanto você lê isso</span>
        </div>
        <div className="lv2-live-grid">
          <div className="lv2-live-cell rv">
            <div className="lv2-live-num">{fmt(vals.prompts)}</div>
            <div className="lv2-live-lbl">prompts salvos por alunos</div>
          </div>
          <div className="lv2-live-cell rv" style={{ transitionDelay: '80ms' }}>
            <div className="lv2-live-num">{fmt(vals.horas)}</div>
            <div className="lv2-live-lbl">horas economizadas este mês</div>
          </div>
          <div className="lv2-live-cell rv" style={{ transitionDelay: '160ms' }}>
            <div className="lv2-live-num">{fmt(vals.alunos)}</div>
            <div className="lv2-live-lbl">alunos ativos agora</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Sticky mini CTA editorial ============ */
export function StickyMiniCTA({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('lv2_mini_closed') === '1') setClosed(true);
    const onScroll = () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setShow(p > 0.4 && p < 0.92);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (closed) return null;

  return (
    <div className={`lv2-mini-cta ${show ? 'in' : ''}`} role="complementary" aria-label="Oferta rápida">
      <div className="lv2-mini-cta-in">
        <div className="lv2-mini-cta-txt">
          <span className="lv2-mini-cta-tag">Método IA Real</span>
          <span className="lv2-mini-cta-price">R$ 497</span>
          <span className="lv2-mini-cta-alt">à vista · ou 12× de R$ 51</span>
        </div>
        <div className="lv2-mini-cta-actions">
          <button className="lv2-mini-cta-btn" onClick={onClick}>Garantir vaga →</button>
          <button
            className="lv2-mini-cta-x"
            aria-label="Fechar"
            onClick={() => {
              sessionStorage.setItem('lv2_mini_closed', '1');
              setClosed(true);
            }}
          >×</button>
        </div>
      </div>
    </div>
  );
}

/* ============ Hook: spotlight que segue o mouse no hero ============ */
export function useHeroSpotlight(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [ref]);
}

/* ============ Split-text reveal (words) ============ */
export function SplitText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={`lv2-split ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="lv2-split-w" style={{ animationDelay: `${i * 60}ms` }}>
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

/* ============ Radar timestamp helper ============ */
export function useRelativeRadar(count: number) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 6000);
    return () => window.clearInterval(id);
  }, [count]);
  return active;
}
