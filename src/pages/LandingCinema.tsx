import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';
import { LandingCinemaScene } from '@/components/landing/cinema/LandingCinemaScene';
import { CINEMA_SCENES, GIANTS } from '@/components/landing/cinema/cinemaScenes';
import logoIaReal from '@/assets/logo-ia-real.png';
import './landing-cinema.css';

const LandingCinema = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const total = CINEMA_SCENES.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sceneRefs.current.findIndex((node) => node === entry.target);
          if (idx >= 0) setActive(idx);
        });
      },
      { threshold: 0.55 },
    );
    sceneRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const goTo = (idx: number) => {
    sceneRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const progress = useMemo(() => ((active + 1) / total) * 100, [active, total]);

  return (
    <div className="lcn-root" ref={containerRef}>
      <Helmet>
        <title>Método IA Real — Do uso da IA ao comando de uma máquina que produz</title>
        <meta
          name="description"
          content="Aprenda IA na prática: ChatGPT, Claude, Gemini, Lovable, Cursor e n8n para criar apps, automações e produtos que geram receita. Acesso completo com 7 dias de garantia."
        />
        <meta property="og:title" content="Método IA Real — comande uma máquina que produz" />
        <meta
          property="og:description"
          content="Seis capítulos, ferramentas completas e projetos publicados. R$ 497 ou 12× R$ 41,41, com 7 dias de garantia."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="lcn-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <nav className="lcn-index" aria-label="Índice de cenas">
        {CINEMA_SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            type="button"
            className={`lcn-index-item ${idx === active ? 'is-active' : ''}`}
            onClick={() => goTo(idx)}
            aria-label={`${scene.slate} — ${scene.chapter}`}
          >
            <span className="lcn-index-dash" aria-hidden="true" />
            <span className="lcn-index-label">{scene.chapter}</span>
          </button>
        ))}
      </nav>

      <main className="lcn-reel">
        {CINEMA_SCENES.map((scene, idx) => (
          <LandingCinemaScene
            key={scene.id}
            scene={scene}
            index={idx}
            total={total}
            ref={(node) => {
              sceneRefs.current[idx] = node;
            }}
          >
            {idx === 0 && (
              <>
                <div className="lcn-hero-logo" aria-hidden="true">
                  <span className="lcn-hero-logo-halo" />
                  <img src={logoIaReal} alt="" width={250} height={143} decoding="async" fetchPriority="high" />
                </div>
                <div className="lcn-actions">
                  <button type="button" className="lcn-cta" onClick={() => setCheckoutOpen(true)}>
                    Entrar para o time que constrói
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <button type="button" className="lcn-ghost" onClick={() => goTo(1)}>
                    Ver o que você domina
                  </button>
                </div>
                <div className="lcn-dock" aria-label="Ferramentas dominadas no método">
                  {GIANTS.map((name) => (
                    <span key={name} className="lcn-dock-item">
                      {name}
                    </span>
                  ))}
                </div>
              </>
            )}

            {idx === 3 && (
              <ul className="lcn-ledger">
                <li>
                  <span>Contratar uma agência</span>
                  <strong>Meses de espera</strong>
                  <em>Você: monta em uma tarde</em>
                </li>
                <li>
                  <span>Tarefa manual repetida</span>
                  <strong>Sua semana inteira</strong>
                  <em>Automação: roda sozinha</em>
                </li>
                <li>
                  <span>Esperar para começar</span>
                  <strong>Mais um ano igual</strong>
                  <em>Ou os próximos 7 dias</em>
                </li>
              </ul>
            )}

            {idx === 5 && (
              <div className="lcn-offer">
                <div className="lcn-price">
                  <span className="lcn-price-old">R$ 997</span>
                  <strong>R$ 497</strong>
                  <span className="lcn-price-inst">ou 12× R$ 41,41</span>
                </div>
                <div className="lcn-actions">
                  <button type="button" className="lcn-cta" onClick={() => setCheckoutOpen(true)}>
                    Quero acesso completo agora
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
                <p className="lcn-guarantee">
                  <ShieldCheck size={16} aria-hidden="true" /> 7 dias de garantia — cancela e devolvemos tudo.
                </p>
                <p className="lcn-footnote">
                  <Link to="/curso">Programa completo</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/termos">Termos</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/privacidade">Privacidade</Link>
                </p>
              </div>
            )}
          </LandingCinemaScene>
        ))}
      </main>

      <div className="lcn-hud-status" aria-hidden="true">
        <span>IA REAL / SYSTEM</span>
        <i />
        <span>LIVE</span>
      </div>

      <button type="button" className="lcn-sticky" onClick={() => setCheckoutOpen(true)}>
        Garantir meu acesso · R$ 497
      </button>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
};

export default LandingCinema;
