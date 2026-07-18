import { useEffect, useRef, useState } from 'react';

/** Cursor spotlight — subtle radial glow following the pointer. Desktop only. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    el.style.opacity = '1';
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, []);
  return <div ref={ref} className="lv2-cursor-glow" aria-hidden />;
}

/** Countdown to next Radar drop — first day of next month */
export function RadarCountdown() {
  const [t, setT] = useState(() => diff());
  useEffect(() => {
    const iv = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="lv2-radar-countdown" role="status" aria-live="polite">
      <span className="lv2-live-badge"><em /> PRÓXIMO RADAR</span>
      <div className="lv2-rc-cells">
        <Cell v={t.d} l="dias" />
        <Cell v={t.h} l="hrs" />
        <Cell v={t.m} l="min" />
        <Cell v={t.s} l="seg" />
      </div>
      <p>Novo boletim mensal do que mudou nas ferramentas — publicado no dia 1º.</p>
    </div>
  );
}
function Cell({ v, l }: { v: number; l: string }) {
  return (
    <div className="lv2-rc-cell">
      <b>{v.toString().padStart(2, '0')}</b>
      <span>{l}</span>
    </div>
  );
}
function diff() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  let s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return { d, h, m, s };
}
