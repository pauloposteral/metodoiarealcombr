import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';
import {
  LiveCounters,
  StickyMiniCTA,
  useHeroSpotlight,
  SplitText,
  useRelativeRadar,
} from '@/components/landing/LandingV2Enhancements';
import { LiveTerminal, BeforeAfterSlider, JourneyTimeline } from '@/components/landing/LandingV2Wow2';
import { LandingPlayground } from '@/components/landing/LandingPlayground';
import { ComparisonTable, TrustWall, useCardTilt } from '@/components/landing/LandingV2Wow3';
import { ROICalculator, GuaranteeShield } from '@/components/landing/LandingV2Wow4';
import { LiveEnrollmentFeed, AnimatedStats, FloatingSectionNav } from '@/components/landing/LandingV2Wow5';
import { ToolsExplorer, InstructorCard } from '@/components/landing/LandingV2Wow6';
import './landing-v2.css';

const MODULES = [
  { code: 'MOD-00', title: 'Comece por aqui', h: '~1h', body: 'Contas criadas em todas as IAs, custos em reais na mesa, segurança do que nunca colar numa IA — e sua trilha definida no dia 1.', proj: 'Setup completo + a mesma pergunta feita a 3 IAs, comparando as respostas.' },
  { code: 'MOD-01', title: 'Fundamentos: como a IA pensa', h: '~2h', body: 'LLM, tokens, alucinação e o mapa dos modelos — sem matemática. Você entende o que está usando e para de acreditar em tudo que a IA diz.', proj: 'Caça à alucinação: auditar 5 respostas de IA com fontes.' },
  { code: 'MOD-02', title: 'Engenharia de Prompt — a habilidade-mãe', h: '~3h', body: 'A anatomia do prompt perfeito, few-shot, cadeias de prompts e meta-prompt. A habilidade que multiplica todas as outras.', proj: 'Seus 10 prompts de trabalho, com antes/depois documentado.' },
  { code: 'MOD-03', title: 'ChatGPT do zero ao avançado', h: '~3h30', body: 'Memória, Projetos, análise de arquivos, Deep Research, voz, imagem e GPTs personalizados. O ChatGPT que 95% das pessoas nunca viu.', proj: 'Um GPT personalizado para a sua função, publicado e testado.' },
  { code: 'MOD-04', title: 'Claude do zero ao avançado', h: '~3h', body: 'Projects, Artifacts, documentos gigantes, estilos com a sua voz e conectores. Onde o Claude brilha — e quando escolher ele.', proj: 'Seu "segundo cérebro": um Project com seus documentos respondendo dúvidas reais.' },
  { code: 'MOD-05', title: 'Gemini e o ecossistema Google', h: '~2h30', body: 'Gemini no Gmail, Docs e Sheets, NotebookLM com resumo em áudio, Nano Banana e Veo. A IA dentro das ferramentas que você já usa.', proj: 'NotebookLM do seu nicho com resumo em áudio publicável.' },
  { code: 'MOD-06', title: 'Imagem: do prompt à arte profissional', h: '~3h30', body: 'Midjourney, edição por instrução, consistência de personagem e direitos de uso comercial. Imagem que parece de estúdio — e pode ser vendida.', proj: 'Pack de identidade visual de uma marca: logo + 6 posts.' },
  { code: 'MOD-07', title: 'Vídeo, voz e música', h: '~3h30', body: 'Veo, Sora e Kling sem hype, avatares, ElevenLabs e Suno. O fluxo completo: roteiro → cenas → montagem → legendas.', proj: 'Um vídeo de 30–60s completo (anúncio ou reels) feito 100% com IA.' },
  { code: 'MOD-08', title: 'Lovable: seu primeiro app sem código', h: '~4h', body: 'O módulo-estrela. Do prompt ao app no ar em 30 minutos, banco de dados e login sem medo, domínio próprio e o método de conserto quando quebra.', proj: 'Publicar um micro-app funcional — 3 opções guiadas, do zero ao link no ar.', star: true },
  { code: 'MOD-09', title: 'Automações e agentes', h: '~3h30', body: 'n8n do zero, WhatsApp com IA, rotinas automáticas e agentes de várias etapas — incluindo quando não automatizar e economizar.', proj: 'Uma automação real do seu dia rodando (3 receitas prontas para adaptar).' },
  { code: 'MOD-10', title: 'IA no trabalho: produtividade 10×', h: '~3h', body: 'E-mail na metade do tempo, planilhas com IA, apresentações em minutos, atas automáticas e carreira: currículo, LinkedIn e entrevista.', proj: 'Kit pessoal de produtividade implantado — e medido em horas por semana.' },
  { code: 'MOD-11', title: 'IA para negócios e conteúdo', h: '~3h30', body: '30 posts/mês com a sua voz, copy que vende, atendimento com IA, SEO sem virar spam e proposta comercial com precificação.', proj: 'Sistema de conteúdo de 30 dias do seu negócio, com calendário pronto.' },
  { code: 'MOD-12', title: 'Monetização: os 5 caminhos do dinheiro', h: '~3h', body: 'Valorizar o emprego, freela, agência enxuta, produto próprio ou o seu negócio. Sem promessa de riqueza — com plano de 30 dias e esforço real.', proj: 'Portfólio publicado com tudo que você construiu + plano de ação de 30 dias.', final: true },
];

const TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Lovable', 'n8n', 'ElevenLabs', 'Suno', 'NotebookLM', 'Veo', 'Runway', 'Make', 'Perplexity', 'HeyGen', 'Supabase', 'Zapier'];

const PAINS = [
  { tag: '✕ Desorganização', title: '200 aulas soltas, nenhuma ordem', body: 'Você não sabe por onde começar, o que já pode pular nem o que ainda falta. A sensação constante: estar perdido.' },
  { tag: '✕ Desatualização', title: 'A aula mostra uma tela que não existe mais', body: 'IA muda toda semana. Curso gravado em 2024 e nunca revisado não é curso — é museu.' },
  { tag: '✕ Abandono', title: 'Você trava numa dúvida e ninguém responde', body: 'Comprou, empolgou, travou. Sem suporte, o acesso vira peso na consciência — e o dinheiro, arrependimento.' },
];

const SOLUTIONS = [
  { n: '01', title: 'Organização radical', body: 'Mapa visual do curso, numeração clara e trilha definida por um quiz de 2 minutos. Você sempre sabe onde está e o que falta.' },
  { n: '02', title: 'Atualização como produto', body: 'Radar IA todo mês, selo "atualizado em" em cada aula e correção em até 7 dias quando uma ferramenta muda de verdade.' },
  { n: '03', title: 'Projeto em cada módulo', body: 'App publicado, vídeo pronto, automação rodando. Você termina o curso com portfólio real — não com um PDF de conclusão.' },
  { n: '04', title: 'Suporte que responde', body: 'Dúvida respondida em até 24h úteis + comunidade com monitores. Ninguém aprende sozinho — nem precisa.' },
];

const RADAR_FEED = [
  { when: 'há 2h', title: 'Radar do mês publicado', sub: 'O que mudou em cada ferramenta — e o que isso muda para você.' },
  { when: 'há 1d', title: 'Aula nova no ar', sub: 'Direto para a sua trilha, já com selo de data.' },
  { when: 'há 3d', title: 'Ferramenta testada a fundo', sub: 'Vale a pena? Quanto custa em reais? Substitui o quê?' },
  { when: 'há 5d', title: 'Prompts do mês + changelog', sub: 'Aulas revisadas listadas uma a uma. Transparência total.' },
];

const TRAILS = [
  {
    name: 'Carreira / CLT', hours: '~15h',
    body: 'Para quem quer se valorizar no emprego, ganhar horas na semana e parar de temer a IA — usando ela a seu favor amanhã de manhã.',
    chips: ['00', '01', '02', '03', '05', '10', '12'], hot: ['10'],
    weeks: [
      { w: 'Semana 1', t: 'Fundamentos + ChatGPT no dia a dia', d: 'Setup, 10 prompts de trabalho, memória e Projects.' },
      { w: 'Semana 2', t: 'Gemini no Gmail/Docs/Sheets', d: 'IA dentro das ferramentas que você já usa.' },
      { w: 'Semana 3', t: 'Produtividade 10× no trabalho', d: 'E-mails, atas, apresentações e planilhas com IA.' },
      { w: 'Semana 4', t: 'Currículo, LinkedIn e pedido de aumento', d: 'Plano concreto para valorizar sua posição.' },
    ],
  },
  {
    name: 'Empreendedor', hours: '~17h',
    body: 'Para quem quer vender mais e gastar menos: conteúdo, atendimento e automação com IA dentro do próprio negócio.',
    chips: ['00', '01', '02', '03', '09', '11', '12'], hot: ['09', '11'],
    weeks: [
      { w: 'Semana 1', t: 'Fundamentos + prompt para negócio', d: 'A habilidade-mãe aplicada a copy, vendas e ops.' },
      { w: 'Semana 2', t: '30 posts/mês com a sua voz', d: 'Sistema de conteúdo replicável, com calendário.' },
      { w: 'Semana 3', t: 'Automações e WhatsApp com IA', d: 'n8n do zero + 3 automações rodando no seu negócio.' },
      { w: 'Semana 4', t: 'Proposta, preço e monetização', d: 'Precificação com IA e plano de 30 dias.' },
    ],
  },
  {
    name: 'Criador de conteúdo', hours: '~18h',
    body: 'Para quem quer produzir em escala sem soar genérico: imagem, vídeo, voz e um sistema de conteúdo com a sua identidade.',
    chips: ['00', '01', '02', '06', '07', '11', '12'], hot: ['06', '07'],
    weeks: [
      { w: 'Semana 1', t: 'Fundamentos + estilo com a sua voz', d: 'Prompt, few-shot e Claude Projects como cérebro.' },
      { w: 'Semana 2', t: 'Imagem profissional (Midjourney + edição)', d: 'Consistência de personagem e direitos comerciais.' },
      { w: 'Semana 3', t: 'Vídeo, voz e música', d: 'Veo/Sora, ElevenLabs, Suno — do roteiro à legenda.' },
      { w: 'Semana 4', t: 'Sistema de conteúdo publicado', d: 'Calendário de 30 dias + pack de identidade visual.' },
    ],
  },
  {
    name: 'Construtor de apps', hours: '~18h',
    body: 'Para quem quer publicar apps e produtos sem escrever código — do primeiro micro-app ao início de um micro-SaaS.',
    chips: ['00', '01', '02', '04', '08', '09', '12'], hot: ['08'],
    weeks: [
      { w: 'Semana 1', t: 'Fundamentos + Claude para código', d: 'Artifacts, documentos longos, seu "segundo cérebro".' },
      { w: 'Semana 2', t: 'Lovable — primeiro app no ar', d: 'Do prompt ao link público em 30 minutos.' },
      { w: 'Semana 3', t: 'Banco, login e domínio próprio', d: 'Sem medo: método de conserto quando quebra.' },
      { w: 'Semana 4', t: 'Automação + micro-SaaS', d: 'n8n + agente, publicado e testado com usuários reais.' },
    ],
  },
];


const STACK = [
  { label: 'Curso completo — 13 módulos, ~36h, 4 trilhas', value: 'R$ 1.497' },
  { label: 'Radar IA — 12 meses de atualização mensal', value: 'R$ 564' },
  { label: 'Biblioteca com 500+ prompts + 20 templates Lovable', value: 'R$ 397' },
  { label: '12 encontros ao vivo no ano (com gravação)', value: 'R$ 497' },
  { label: 'Comunidade + suporte em até 24h úteis', value: 'R$ 297' },
];

const FAQS = [
  { q: 'Preciso saber programar ou "ser de tecnologia"?', a: 'Não. O curso começa do zero absoluto, todo jargão nasce com definição e há um glossário permanente na plataforma. Até o módulo de apps (Lovable) foi desenhado para quem nunca escreveu uma linha de código.' },
  { q: 'Vou precisar pagar pelas ferramentas de IA?', a: 'Nenhuma aula exige ferramenta paga sem alternativa gratuita indicada na própria aula — isso é regra da escola. Você também recebe uma planilha viva com o custo real de cada ferramenta em reais, no plano grátis e no pago.' },
  { q: 'Por quanto tempo tenho acesso?', a: '2 anos completos — incluindo todas as aulas novas, correções e os 12 meses de Radar IA do período. Em IA, dois anos de conteúdo atualizado valem mais que acesso vitalício a conteúdo morto.' },
  { q: 'E quando as ferramentas mudarem? O curso não vai desatualizar?', a: 'Esse é o coração do método: toda aula tem selo de data e revisão obrigatória a cada 90 dias. Mudança crítica numa ferramenta vira aula corrigida em até 7 dias, registrada num changelog público. O Radar IA entra todo mês, sem exceção.' },
  { q: 'Quanto tempo por semana eu preciso?', a: 'As trilhas têm de 15 a 18 horas no total, em aulas de 5 a 15 minutos — dá para avançar com 2 a 3 horas por semana e concluir em 6 a 8 semanas. O progresso fica salvo e você retoma de onde parou, inclusive no celular.' },
  { q: 'Como funciona a garantia?', a: '7 dias incondicionais: entre, assista, faça o primeiro projeto. Se não for para você, um e-mail resolve e devolvemos 100% do valor, sem perguntas e sem burocracia.' },
  { q: 'Vou realmente conseguir ganhar dinheiro com isso?', a: 'O módulo final mostra 5 caminhos reais de monetização — do emprego ao produto próprio — com esforço real e plano de 30 dias. O que prometemos é método, portfólio e suporte; resultado depende da sua execução. Desconfie de quem promete o contrário.' },
];

export default function LandingV2() {
  const [scrolled, setScrolled] = useState(false);
  const [openMod, setOpenMod] = useState<number | null>(null);
  const [openTrail, setOpenTrail] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [litCount, setLitCount] = useState(1);
  const { handleCheckout, isLoading, showCheckoutDialog, setShowCheckoutDialog } = useCheckout();
  const modsRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const activeRadar = useRelativeRadar(RADAR_FEED.length);
  useHeroSpotlight(heroRef);
  useCardTilt('.lv2 .lv2-trail');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.lv2 .rv').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Progressive lit modules based on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setLitCount((c) => Math.max(c, idx + 1));
          }
        });
      },
      { threshold: 0.5 }
    );
    modsRef.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goCheckout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    handleCheckout();
  };

  return (
    <div className="lv2">
      <Helmet>
        <title>Método IA Real — O curso de IA mais organizado e atualizado do Brasil</title>
        <meta name="description" content="13 módulos, 4 trilhas por perfil e atualização mensal garantida. Você nunca fica perdido, nunca fica para trás — e termina com portfólio publicado." />
        <meta property="og:title" content="Método IA Real — O curso de IA mais organizado e atualizado do Brasil" />
        <meta property="og:description" content="13 módulos, 4 trilhas por perfil e atualização mensal garantida." />
        <link rel="canonical" href="https://metodoiareal.com.br" />
      </Helmet>

      {/* NAV */}
      <nav className={`lv2-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lv2-nav-in">
          <a href="#top" className="lv2-logo">Método <em>IA Real</em></a>
          <div className="lv2-nav-links">
            <a href="#mapa">O mapa</a>
            <a href="#radar">Radar IA</a>
            <a href="#trilhas">Trilhas</a>
            <a href="#oferta">Oferta</a>
            <Link to="/auth" className="lv2-nav-entrar">Entrar</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lv2-hero" id="top" ref={heroRef}>
        <div className="lv2-hero-spot" aria-hidden />
        <div className="lv2-orb lv2-orb-a" />
        <div className="lv2-orb lv2-orb-b" />
        <div className="lv2-grid-bg" />
        <div className="lv2-wrap">
          <div className="lv2-hero-in">
            <span className="lv2-eyebrow rv">Radar IA · atualizado em jul/2026</span>
            <h1 className="rv lv2-h1">
              <SplitText text="O curso de IA mais" />{' '}
              <span className="lv2-grad-text"><SplitText text="organizado e atualizado" /></span>{' '}
              <SplitText text="do Brasil." />
            </h1>
            <p className="lv2-lead rv">13 módulos, 4 trilhas por perfil e atualização mensal garantida. Você nunca fica perdido, nunca fica para trás — e termina com portfólio publicado, não com certificado vazio.</p>
            <div className="lv2-hero-cta rv">
              <button className="lv2-btn" onClick={goCheckout} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Quero minha vaga <span className="arr">→</span></>}
              </button>
              <p className="lv2-btn-note">R$ 497 à vista ou 12× de R$ 51 · garantia incondicional de 7 dias</p>
            </div>

            <div className="lv2-mini-map rv">
              <div className="lv2-mini-map-label">Mapa do curso · MOD-00 → MOD-12</div>
              <div className="lv2-mini-map-ticks">
                {MODULES.map((m, i) => (
                  <div key={m.code} className={`lv2-tick ${i < 3 ? 'on' : ''}`}>
                    <i />
                    <span>{i.toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="lv2-marquee-wrap">
        <div className="lv2-marquee">
          {[...TOOLS, ...TOOLS].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* TOOLS EXPLORER */}
      <section className="lv2-section" id="ferramentas" style={{ padding: '80px 0 40px' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 44px', maxWidth: 760 }}>
            <span className="lv2-eyebrow">As ferramentas do curso</span>
            <h2>16 IAs. Uma por vez. <span className="lv2-grad-text">E cada uma na hora certa.</span></h2>
            <p className="lv2-lead" style={{ margin: '14px auto 0' }}>Passe o mouse por qualquer ferramenta para descobrir pra que ela serve — e em qual módulo você aprende a usá-la de verdade.</p>
          </div>
          <div className="rv"><ToolsExplorer /></div>
        </div>
      </section>

      {/* LIVE COUNTERS */}
      <LiveCounters />

      {/* LIVE TERMINAL */}
      <section className="lv2-section" style={{ padding: '80px 0' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 44px' }}>
            <span className="lv2-eyebrow">Veja funcionando</span>
            <h2>O que muda quando o <span className="lv2-grad-text">prompt é engenharia</span>, não sorte.</h2>
          </div>
          <LiveTerminal />
        </div>
      </section>



      {/* PROBLEMA + SOLUÇÃO */}
      <section className="lv2-section" id="problema">
        <div className="lv2-wrap">
          <div className="lv2-section-head rv">
            <span className="lv2-eyebrow">O problema</span>
            <h2>Por que a maioria trava — e desiste — ao aprender IA</h2>
            <p className="lv2-lead">Não é falta de conteúdo. A internet está cheia de aula sobre IA. O que falta é o que vem depois do play.</p>
          </div>
          <div className="lv2-pain-grid">
            {PAINS.map((p, i) => (
              <div key={i} className="lv2-pain rv" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="lv2-x">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
          <div className="lv2-sol-band rv">
            <h3>O Método IA Real foi desenhado para atacar as três causas — não os sintomas.</h3>
            <div className="lv2-sol-grid">
              {SOLUTIONS.map((s) => (
                <div key={s.n} className="lv2-sol">
                  <i>{s.n}</i>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BeforeAfterSlider />
        </div>
      </section>


      {/* MAPA */}
      <section className="lv2-section" id="mapa">
        <div className="lv2-wrap">
          <div className="lv2-section-head rv">
            <span className="lv2-eyebrow">O mapa</span>
            <h2>13 módulos. Um caminho. <span className="lv2-grad-text">Zero achismo.</span></h2>
            <p className="lv2-lead">Cada módulo termina com um projeto publicável. Toque em qualquer etapa para ver exatamente o que você constrói nela.</p>
          </div>

          <div className="lv2-map-rail">
            <div className="lv2-map-fill" style={{ height: `${(litCount / MODULES.length) * 100}%` }} />
            {MODULES.map((m, i) => (
              <div
                key={m.code}
                ref={(el) => (modsRef.current[i] = el)}
                data-idx={i}
                className={`lv2-mod rv ${i < litCount ? 'lit' : ''} ${openMod === i ? 'open' : ''}`}
              >
                <span className="lv2-mod-dot" />
                <button className="lv2-mod-btn" onClick={() => setOpenMod(openMod === i ? null : i)}>
                  <span className="lv2-mod-code">{m.code}</span>
                  <span className="lv2-mod-title">
                    {m.star && <span className="lv2-mod-star">⭐ </span>}
                    {m.title}
                  </span>
                  <span className="lv2-mod-h">{m.h}</span>
                  <span className="lv2-mod-plus">+</span>
                </button>
                <div className="lv2-mod-body" style={{ maxHeight: openMod === i ? 500 : 0 }}>
                  <div className="lv2-mod-body-in">
                    <p>{m.body}</p>
                    <div className="lv2-mod-proj">
                      <b>{m.final ? 'Projeto final' : 'Projeto'}</b>
                      <span>{m.proj}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lv2-map-foot rv">
            <span className="lv2-dotg" />
            <span>~36 horas no total · aulas de 5 a 15 minutos · um resultado por aula. E todo mês, o Radar IA adiciona mais. ↓</span>
          </div>
        </div>
      </section>

      {/* RADAR */}
      <section className="lv2-section" id="radar">
        <div className="lv2-wrap">
          <div className="lv2-radar-grid">
            <div className="lv2-radar-copy rv">
              <span className="lv2-eyebrow">Radar IA</span>
              <h2>Atualização não é promessa. <span className="lv2-grad-text">É produto.</span></h2>
              <p className="lv2-lead">IA muda toda semana — e é exatamente por isso que a atualização aqui é um compromisso público, com data e changelog, não uma frase de página de vendas.</p>
              <ul className="lv2-radar-points">
                <li>Toda aula carrega o selo "atualizado em mês/ano" — você vê a data antes do play.</li>
                <li>Mudança crítica numa ferramenta vira aula corrigida em até 7 dias, com registro no changelog.</li>
                <li>O Radar chega todo mês, sem exceção — é a regra nº 1 da escola.</li>
              </ul>
              <span className="lv2-selo">Selo de toda aula: atualizado em jul/2026</span>
            </div>

            <div className="lv2-feed rv">
              <div className="lv2-feed-bar">
                <i /><i /><i />
                <span>RADAR-IA — feed ao vivo</span>
                <span className="lv2-live-badge"><em /> AO VIVO</span>
              </div>
              {RADAR_FEED.map((f, i) => (
                <div key={i} className={`lv2-feed-item ${activeRadar === i ? 'active' : ''}`}>
                  <div className="lv2-feed-when">{f.when}</div>
                  <div>
                    <p>{f.title}</p>
                    <small>{f.sub}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRILHAS */}
      <section className="lv2-section" id="trilhas">
        <div className="lv2-wrap">
          <div className="lv2-section-head rv">
            <span className="lv2-eyebrow">As trilhas</span>
            <h2>Feito para o seu momento — não para um aluno genérico.</h2>
            <p className="lv2-lead">Um quiz de 2 minutos no primeiro acesso define a sua trilha. Você segue um caminho de 15 a 18 horas, na ordem certa para o seu objetivo.</p>
          </div>

          <div className="lv2-trail-grid">
            {TRAILS.map((t, ti) => {
              const open = openTrail === ti;
              return (
                <div key={t.name} className={`lv2-trail rv ${open ? 'open' : ''}`}>
                  <div className="lv2-trail-top">
                    <h3>{t.name}</h3>
                    <span className="lv2-trail-h">{t.hours}</span>
                  </div>
                  <p>{t.body}</p>
                  <div className="lv2-chips">
                    {t.chips.map((c) => (
                      <span key={c} className={t.hot.includes(c) ? 'hot' : ''}>{c}</span>
                    ))}
                  </div>
                  <button className="lv2-trail-toggle" onClick={() => setOpenTrail(open ? null : ti)}>
                    {open ? 'Fechar prévia' : 'Ver semana a semana'} <span className={`arr ${open ? 'up' : ''}`}>↓</span>
                  </button>
                  <div className="lv2-trail-weeks" style={{ maxHeight: open ? 600 : 0 }}>
                    <div className="lv2-trail-weeks-in">
                      {t.weeks.map((w, wi) => (
                        <div key={wi} className="lv2-week">
                          <span className="lv2-week-tag">{w.w}</span>
                          <div>
                            <strong>{w.t}</strong>
                            <p>{w.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


          <div className="lv2-trail-note rv">
            <span>Prefere ver tudo? A trilha Formação Completa percorre os 13 módulos na ordem (~36h).</span>
            <a href="#oferta" className="lv2-link-cta">Ver o que está incluído ↓</a>
          </div>

          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '90px auto 0', maxWidth: 780 }}>
            <span className="lv2-eyebrow">Comparativo honesto</span>
            <h2>Onde a diferença aparece — <span className="lv2-grad-text">linha por linha.</span></h2>
            <p className="lv2-lead" style={{ margin: '14px auto 0' }}>Sem inventar defeitos alheios. É o que a maioria dos cursos e a internet grátis não entregam — e o que aqui é regra da casa.</p>
          </div>
          <div className="rv"><ComparisonTable /></div>
        </div>
      </section>

      {/* PLAYGROUND — live AI */}
      <section className="lv2-section" id="playground" style={{ padding: '90px 0' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 44px' }}>
            <span className="lv2-eyebrow">Playground · 100% ao vivo</span>
            <h2>Antes de comprar, <span className="lv2-grad-text">teste a IA aqui.</span></h2>
            <p className="lv2-lead" style={{ margin: '16px auto 0' }}>Sem cadastro, sem cartão. Escolha um caso real, escreva uma frase e veja o resultado — é a mesma IA que você usa no curso.</p>
          </div>
          <LandingPlayground />
        </div>
      </section>

      {/* TRUST WALL */}
      <section className="lv2-section" style={{ padding: '60px 0 20px' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 20px', maxWidth: 760 }}>
            <span className="lv2-eyebrow">Alunos falando</span>
            <h2>Resultado real, no <span className="lv2-grad-text">tempo real de quem executou.</span></h2>
          </div>
          <div className="rv"><TrustWall /></div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="lv2-section" id="roi" style={{ padding: '70px 0' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto', maxWidth: 760 }}>
            <span className="lv2-eyebrow">Calculadora honesta</span>
            <h2>Quanto <span className="lv2-grad-text">o seu tempo</span> vale, de verdade.</h2>
            <p className="lv2-lead" style={{ margin: '14px auto 0' }}>Arraste os controles com o seu contexto. Os números são seus — não uma média inventada.</p>
          </div>
          <div className="rv"><ROICalculator /></div>
        </div>
      </section>

      {/* ANIMATED STATS */}
      <section className="lv2-section" id="numeros" style={{ padding: '30px 0 60px' }}>
        <div className="lv2-wrap">
          <div className="rv"><AnimatedStats /></div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="lv2-section" id="jornada" style={{ padding: '90px 0' }}>
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 50px' }}>
            <span className="lv2-eyebrow">Sua jornada · 30 dias</span>
            <h2>Do primeiro login ao <span className="lv2-grad-text">portfólio publicado.</span></h2>
            <p className="lv2-lead" style={{ margin: '16px auto 0' }}>Não é promessa de riqueza. É um plano de execução — o que você entrega em cada marco.</p>
          </div>
          <JourneyTimeline />
        </div>
      </section>

      {/* INSTRUCTOR CARD */}
      <section className="lv2-section" id="mentor" style={{ padding: '30px 0 60px' }}>
        <div className="lv2-wrap">
          <div className="rv"><InstructorCard /></div>
        </div>
      </section>

      {/* OFERTA */}
      <section className="lv2-section lv2-offer" id="oferta">
        <div className="lv2-orb lv2-orb-c" />
        <div className="lv2-wrap">
          <div className="lv2-offer-card rv">
            <span className="lv2-eyebrow">A oferta</span>
            <h2>Tudo isso, pelo preço de um jantar por mês.</h2>

            <ul className="lv2-stack">
              {STACK.map((s, i) => (
                <li key={s.label} className="rv lv2-stack-li" style={{ transitionDelay: `${i * 90}ms` }}>
                  <span>{s.label}</span><span>{s.value}</span>
                </li>
              ))}
            </ul>
            <div className="lv2-stack-total rv"><span>Valor total</span><s>R$ 3.252</s></div>

            <div className="lv2-price-line">
              <span className="lv2-price">R$ 497</span>
              <span className="lv2-price-alt">à vista · ou 12× de R$ 51</span>
            </div>

            <button className="lv2-btn" onClick={goCheckout} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Garantir minha vaga agora <span className="arr">→</span></>}
            </button>

            <div className="lv2-trust">
              <span><b>◆</b> Garantia incondicional de 7 dias</span>
              <span><b>◆</b> Acesso por 2 anos com todas as atualizações</span>
              <span><b>◆</b> Pix ou cartão em até 12×</span>
            </div>
          </div>
        </div>
      </section>

      {/* GUARANTEE SHIELD */}
      <section className="lv2-section" style={{ padding: '20px 0 60px' }}>
        <div className="lv2-wrap">
          <div className="rv"><GuaranteeShield onCta={goCheckout} /></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lv2-section" id="faq">
        <div className="lv2-wrap">
          <div className="lv2-section-head rv" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <span className="lv2-eyebrow">Dúvidas frequentes</span>
            <h2>O que você provavelmente quer saber</h2>
          </div>
          <div className="lv2-faq">
            {FAQS.map((f, i) => (
              <div key={i} className={`lv2-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="lv2-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>{f.q}</button>
                <div className="lv2-faq-a" style={{ maxHeight: openFaq === i ? 400 : 0 }}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lv2-footer">
        <div className="lv2-wrap">
          <div className="lv2-foot-in">
            <div className="lv2-logo">Método <em>IA Real</em></div>
            <p>Os resultados apresentados dependem de dedicação, contexto e execução individual. Nenhuma promessa de ganho garantido é feita — e recomendamos desconfiar de quem faz.</p>
          </div>
          <div className="lv2-foot-legal">
            © 2026 Método IA Real · metodoiareal.com.br · <Link to="/termos">Termos</Link> · <Link to="/privacidade">Privacidade</Link>
          </div>
        </div>
      </footer>

      <StickyMiniCTA onClick={goCheckout} />
      <FloatingSectionNav />
      <LiveEnrollmentFeed />
      <CheckoutDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} />
    </div>
  );
}
