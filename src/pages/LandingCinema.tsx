import { COURSE_BENEFITS, COURSE_DISPLAY_PRICE, COURSE_PAYMENT_NOTE, COURSE_ACCESS_NOTE } from '@/lib/courseOffer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, LogIn, UserRound } from 'lucide-react';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';
import { LandingCinemaScene } from '@/components/landing/cinema/LandingCinemaScene';
import { CINEMA_SCENES, GIANTS } from '@/components/landing/cinema/cinemaScenes';
import { useAccess } from '@/hooks/useAccess';
import { HeroLogin } from '@/components/auth/HeroLogin';
import { AI_IMAGE_NOTICE, SCHOOL_MEDIA } from '@/lib/schoolMedia';
import logoIaReal from '@/assets/logo-ia-real.png';
import './landing-cinema.css';

const LandingCinema = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const access = useAccess();
  const navigate = useNavigate();
  const buy = () => (access.hasAccess ? navigate('/membros') : setCheckoutOpen(true));
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
    sceneRefs.current[idx]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const progress = useMemo(() => ((active + 1) / total) * 100, [active, total]);

  return (
    <div className="lcn-root" ref={containerRef}>
      <Helmet><title>Método IA Real — Curso de inteligência artificial na prática</title></Helmet>

      <div className="lcn-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="lcn-account" aria-busy={access.status === 'loading'}>
        {access.status === 'loading' ? null : access.hasAccess ? (
          <>
            {access.status === 'admin' && <Link to="/admin/dashboard" className="lcn-account-link">Painel admin</Link>}
            <Link to="/membros" className="lcn-account-btn">
              <UserRound size={15} aria-hidden="true" />
              {access.name?.split(' ')[0] || 'Minha área'} · Minha área
            </Link>
          </>
        ) : (
          <Link to="/auth?redirect=/membros" className="lcn-account-btn">
            <LogIn size={15} aria-hidden="true" /> Entrar
          </Link>
        )}
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
                {!access.user && <HeroLogin />}
                <div className="lcn-human-strip" aria-label="Exemplos ilustrativos de aplicação"><img src={SCHOOL_MEDIA[1].sources[0].src} width="480" height="362" alt={SCHOOL_MEDIA[1].alt} /><div><strong>Conteúdo que você cria.</strong><span>Projetos que você consegue explicar.</span></div></div>
                <p className="lcn-first-disclosure">Ilustrações geradas por IA · pessoas fictícias.</p>
                <div className="lcn-hero-logo" aria-hidden="true">
                  <span className="lcn-hero-logo-halo" />
                  <img src={logoIaReal} alt="" width={250} height={143} decoding="async" fetchPriority="high" />
                </div>
                <div className="lcn-actions">
                  {access.hasAccess ? (
                    <Link to="/membros" className="lcn-cta">
                      Continuar estudando
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    <button type="button" className="lcn-cta" onClick={buy}>
                      Conhecer a formação · {COURSE_DISPLAY_PRICE}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  )}
                  <button type="button" className="lcn-ghost" onClick={() => goTo(1)}>
                    Ver o programa
                  </button>
                </div>
                <div className="lcn-dock" aria-label="Ferramentas abordadas na formação">
                  {GIANTS.map((name) => (
                    <span key={name} className="lcn-dock-item">
                      {name}
                    </span>
                  ))}
                </div>
              </>
            )}

            {idx === 3 && (
              <div className="lcn-workshop-preview"><p>NA OFICINA DE REELS</p><ol><li><span>01</span>Uma ideia</li><li><span>02</span>Abertura</li><li><span>03</span>Roteiro</li><li><span>04</span>Cenas</li><li><span>05</span>Legenda</li><li><span>06</span>Revisão</li></ol><a href="/aprender/roteiro-video-ia">Experimente o guia gratuito →</a><small>Roteiro e prática. Não é publicação automática nem promessa de alcance.</small></div>
            )}

            {idx === 5 && (
              <div className="lcn-offer">
                <div className="lcn-price">

                  <strong>{COURSE_DISPLAY_PRICE}</strong>
                  <span className="lcn-price-inst">Confira as condições no checkout</span>
                </div>
                <div className="lcn-actions">
                  {access.hasAccess ? (
                    <Link to="/membros" className="lcn-cta">
                      Você já tem acesso — continuar
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    <button type="button" className="lcn-cta" onClick={buy}>
                      Quero acesso completo agora
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p className="lcn-guarantee">
                  <ShieldCheck size={16} aria-hidden="true" /> 7 dias de garantia — cancela e devolvemos tudo.
                </p>
                <p className="lcn-ai-notice">{AI_IMAGE_NOTICE}</p>
                <p className="lcn-footnote">
                  <Link to="/curso">Programa completo</Link><span aria-hidden="true">·</span><a href="/aprender">Guias gratuitos</a>
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
        <span>IA REAL / APRENDA FAZENDO</span>
        <i />
        <span>PRÁTICA</span>
      </div>

      {active > 0 && (access.hasAccess ? (
        <Link to="/membros" className="lcn-sticky">Continuar estudando</Link>
      ) : (
        <button type="button" className="lcn-sticky" onClick={buy} disabled={access.status === 'loading'}>
          Garantir meu acesso · {COURSE_DISPLAY_PRICE}
        </button>
      ))}

      {!access.hasAccess && <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />}
    </div>
  );
};

export default LandingCinema;
