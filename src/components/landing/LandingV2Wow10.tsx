import { useEffect, useState } from 'react';

/** Back-to-top button with SVG progress ring. Appears after 60% scroll. */
export function BackToTop() {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const ratio = max > 0 ? h.scrollTop / max : 0;
      setP(ratio);
      setShow(ratio > 0.35);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const R = 22;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - p);
  return (
    <button
      type="button"
      className={`lv2-backtop ${show ? 'on' : ''}`}
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 52 52" aria-hidden>
        <circle cx="26" cy="26" r={R} className="lv2-backtop-track" />
        <circle
          cx="26"
          cy="26"
          r={R}
          className="lv2-backtop-fill"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform="rotate(-90 26 26)"
        />
      </svg>
      <span className="lv2-backtop-arrow">↑</span>
    </button>
  );
}

const QUOTES = [
  '"Em duas semanas eu já economizava 6h por semana só com o módulo de e-mail."',
  '"Publiquei meu primeiro app no ar antes de terminar o MOD-08. Simples assim."',
  '"O Radar IA mensal é o motivo de eu não ter cancelado. Nada fica velho."',
  '"Saí do medo pra recomendar IA no trabalho — em menos de 30 dias."',
  '"O projeto por módulo faz toda a diferença. Terminei com portfólio real."',
  '"É o único curso que revisa aulas quando a ferramenta muda. Sério."',
];

/** Editorial quote marquee — italic serif contrast strip for social proof */
export function QuoteMarquee() {
  return (
    <div className="lv2-quote-marquee" aria-hidden>
      <div className="lv2-quote-track">
        {[...QUOTES, ...QUOTES].map((q, i) => (
          <span key={i} className="lv2-quote-item">
            <em>{q}</em>
            <i className="lv2-quote-dot">◆</i>
          </span>
        ))}
      </div>
    </div>
  );
}
