import { useEffect, useRef } from 'react';

/* =========================================================
   COMPARISON TABLE — Método IA Real vs Curso genérico vs YouTube
   ========================================================= */
const ROWS: { label: string; a: string | boolean; b: string | boolean; c: string | boolean }[] = [
  { label: 'Ordem clara do que estudar', a: true, b: 'Parcial', c: false },
  { label: 'Trilha por perfil (quiz)', a: true, b: false, c: false },
  { label: 'Atualização mensal com data', a: '✓ Radar IA', b: false, c: false },
  { label: 'Selo "atualizado em" na aula', a: true, b: false, c: false },
  { label: 'Projeto publicável por módulo', a: '13 projetos', b: 'Talvez 1', c: false },
  { label: 'Suporte com resposta em 24h', a: true, b: 'Fórum morto', c: false },
  { label: 'Comunidade ativa + monitores', a: true, b: 'Facebook parado', c: 'Comentários' },
  { label: 'Garantia incondicional', a: '7 dias', b: 'Depende', c: '—' },
  { label: 'Currículo revisado a cada 90 dias', a: true, b: false, c: false },
];

const Cell = ({ v, highlight }: { v: string | boolean; highlight?: boolean }) => {
  if (v === true) return <span className={`lv2-cmp-yes ${highlight ? 'hl' : ''}`}>✓</span>;
  if (v === false) return <span className="lv2-cmp-no">✕</span>;
  return <span className={`lv2-cmp-txt ${highlight ? 'hl' : ''}`}>{v}</span>;
};

export function ComparisonTable() {
  return (
    <div className="lv2-cmp">
      <div className="lv2-cmp-head">
        <div />
        <div className="lv2-cmp-col lv2-cmp-me">
          <strong>Método IA Real</strong>
          <span>o que você recebe aqui</span>
        </div>
        <div className="lv2-cmp-col">
          <strong>Curso genérico</strong>
          <span>gravado uma vez, nunca revisto</span>
        </div>
        <div className="lv2-cmp-col">
          <strong>YouTube grátis</strong>
          <span>200 vídeos soltos</span>
        </div>
      </div>
      {ROWS.map((r) => (
        <div key={r.label} className="lv2-cmp-row">
          <div className="lv2-cmp-label">{r.label}</div>
          <div className="lv2-cmp-val lv2-cmp-me"><Cell v={r.a} highlight /></div>
          <div className="lv2-cmp-val"><Cell v={r.b} /></div>
          <div className="lv2-cmp-val"><Cell v={r.c} /></div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   TRUST WALL — mini quotes with stylized audio waveform
   ========================================================= */
const QUOTES = [
  { name: 'Marina R.', role: 'Analista de marketing', quote: 'Em duas semanas eu já estava entregando relatório em 40 minutos em vez de um dia. Voltei do módulo 3 do trabalho e implantei.', bars: [4, 8, 14, 20, 12, 22, 10, 16, 6, 18, 12, 8, 14, 6, 10] },
  { name: 'Diego C.', role: 'Freelancer', quote: 'Publiquei meu primeiro app no Lovable no MOD-08 e vendi para dois clientes no mesmo mês. O suporte respondeu tudo em menos de um dia.', bars: [10, 6, 16, 22, 8, 12, 18, 14, 20, 10, 6, 16, 12, 22, 8] },
  { name: 'Luiza P.', role: 'Criadora de conteúdo', quote: 'Meu calendário de 30 posts saiu na semana 2 da trilha de criador. Não parece IA — parece eu, só mais rápido.', bars: [6, 14, 10, 22, 16, 8, 20, 12, 6, 18, 14, 10, 22, 8, 16] },
];

export function TrustWall() {
  return (
    <div className="lv2-wall">
      {QUOTES.map((q) => (
        <figure key={q.name} className="lv2-wall-card">
          <div className="lv2-wall-wave" aria-hidden>
            {q.bars.map((h, i) => (
              <i key={i} style={{ height: `${h}px`, animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <blockquote>"{q.quote}"</blockquote>
          <figcaption>
            <span className="lv2-wall-avatar">{q.name[0]}</span>
            <div>
              <strong>{q.name}</strong>
              <em>{q.role}</em>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* =========================================================
   3D TILT — subtle mouse parallax on trail cards
   ========================================================= */
export function useCardTilt(selector: string) {
  const raf = useRef<number>();
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];

    cards.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (raf.current) cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateZ(0)`;
        });
      };
      const leave = () => {
        el.style.transform = '';
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
        el.style.transform = '';
      });
    };
  }, [selector]);
}
