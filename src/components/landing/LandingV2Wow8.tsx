import { useEffect, useRef, useState } from 'react';

/** Top scroll progress bar with gradient */
export function TopProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="lv2-topbar" aria-hidden>
      <div className="lv2-topbar-fill" style={{ width: `${p}%` }} />
    </div>
  );
}

/** Live viewers badge — fluctuating count, ambient FOMO */
export function LiveViewersBadge() {
  const [n, setN] = useState(() => 38 + Math.floor(Math.random() * 22));
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2400);
    const iv = setInterval(() => {
      setN((v) => Math.max(24, Math.min(72, v + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3)))));
    }, 5200);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);
  if (!visible) return null;
  return (
    <div className="lv2-viewers" role="status" aria-live="polite">
      <span className="lv2-viewers-dot" />
      <b>{n}</b> pessoas vendo esta página agora
    </div>
  );
}

/** Founders manifesto — trust-heavy section, no promises */
export function FoundersManifesto() {
  return (
    <div className="lv2-manifesto">
      <div className="lv2-manifesto-mark">§</div>
      <div className="lv2-manifesto-body">
        <span className="lv2-eyebrow">Manifesto</span>
        <h2>Não é sobre virar rico com IA. É sobre não ficar para trás.</h2>
        <p>
          A gente não vende sonho. Vende método. Todo mês uma ferramenta muda, uma nova aparece, e três somem. Curso gravado em 2024 e nunca revisado não é curso — é museu. O <b>Método IA Real</b> existe para ser o oposto disso: um mapa que se atualiza com o mercado, com projetos publicáveis em cada módulo e suporte que responde. Se em 7 dias você achar que não é isso, devolvemos cada centavo. Sem pergunta, sem ligação de retenção, sem drama.
        </p>
        <div className="lv2-manifesto-sig">
          <span>— Time Método IA Real</span>
          <em>São Paulo · atualizado mensalmente</em>
        </div>
      </div>
    </div>
  );
}

/** Keyboard shortcut hint — one-time toast */
export function ShortcutHint() {
  const [show, setShow] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    const t1 = setTimeout(() => setShow(true), 6500);
    const t2 = setTimeout(() => setShow(false), 13500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  return (
    <div className={`lv2-shortcut-hint ${show ? 'on' : ''}`} aria-hidden={!show}>
      <span>Dica:</span>
      <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd>
      <span>para navegar rápido</span>
    </div>
  );
}
