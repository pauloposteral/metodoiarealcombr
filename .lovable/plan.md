# Nova Landing Page — Método IA Real (design premium editorial)

Aplicar o HTML enviado como a **nova landing `/`**, convertendo para React + Tailwind, mantendo integrações existentes (Stripe checkout, auth, roteamento).

## O que muda

Substituir toda a landing atual (Hero + 12 seções) por uma versão mais enxuta, editorial e alinhada ao PRD "Escola de IA", com paleta escura (mint #6EE7B7 + blue #3B82F6), Space Grotesk + Instrument Sans + Space Mono.

## Estrutura nova (7 seções)

1. **Nav fixo** — logo "Método IA Real" + links âncora (Mapa, Radar IA, Trilhas, Oferta) + botão Entrar
2. **Hero** — headline "O curso de IA mais organizado e atualizado do Brasil" + CTA + mini-mapa MOD-00 → MOD-12 animado
3. **Marquee** — ferramentas rolando (ChatGPT, Claude, Gemini, Lovable, n8n, etc.)
4. **Problema → Solução** — 3 dores (desorganização, desatualização, abandono) + 4 pilares
5. **Mapa do curso** — accordion dos 13 módulos MOD-00 → MOD-12 com projeto de cada um, trilho vertical com progresso conforme scroll
6. **Radar IA** — copy + feed simulado das semanas 1-4 do mês + selo "atualizado em jul/2026"
7. **Trilhas** — 4 cards (Carreira, Empreendedor, Criador, Construtor) com chips dos módulos
8. **Oferta** — stack de valor (R$ 3.252 → R$ 497), CTA Stripe, garantia 7 dias
9. **FAQ** — 7 perguntas
10. **Footer** minimalista

## Componentes React a criar

Em `src/components/landing-v2/`:
- `NavV2.tsx`, `HeroV2.tsx`, `MarqueeV2.tsx`, `ProblemSolutionV2.tsx`
- `CourseMapV2.tsx` (accordion + rail animado via IntersectionObserver)
- `RadarV2.tsx`, `TrailsV2.tsx`, `OfferV2.tsx`, `FaqV2.tsx`, `FooterV2.tsx`

`src/pages/Index.tsx` reescrito para renderizar apenas esses componentes.

## Design tokens

Adicionar em `src/index.css` (sem quebrar tokens existentes):
- `--ink`, `--ink-2`, `--ink-3`, `--mint`, `--blue`, `--grad-mint-blue`
- Fontes: Space Grotesk (display), Instrument Sans (body), Space Mono (mono) via Google Fonts em `index.html`
- Classes utilitárias `.grad-text`, `.eyebrow` no CSS global

## Integrações preservadas

- CTAs "Quero minha vaga" e "Garantir minha vaga" → `useCheckout()` (Stripe já configurado, R$ 497)
- Link "Entrar" → `/auth`
- Meta tags (Helmet): title/description novos conforme HTML enviado
- JSON-LD Course mantido, com preço 497
- WhatsAppBubble e ReadingProgress: **removidos** (design pede tela limpa)
- StickyMobileCTA: **removido** (Hero já tem CTA sempre visível em mobile)

## Componentes antigos a arquivar (não deletar)

Ficam no repo mas deixam de ser importados:
`HeroSection`, `ProblemSection`, `SolutionSection`, `ProcessSection`, `ComparisonSection`, `PromptExampleSection`, `LearningSection`, `TargetAudienceSection`, `ModulesSection`, `BonusSection`, `TestimonialsSection`, `FAQSection`, `FinalCTASection`, `ObjectionHandler`, `PricingAnchor`, `TopHeader`, `Footer`.

## Interações JS

- Nav ganha borda ao scrollar (>10px)
- Mini-mapa hero e rail do mapa: preencher pontos conforme viewport passa por eles (IntersectionObserver)
- Accordion módulos: um aberto por vez, `max-height` transition
- FAQ: mesmo padrão do accordion
- Reveals `.rv → .rv.in` via IntersectionObserver

## Responsivo

- Mobile: nav só logo + Entrar; hero 1 coluna; grids 3→1; oferta padding reduzido
- Respeitar `prefers-reduced-motion`

## Fora de escopo

- Não alterar `/membros`, `/admin`, `/metodo`, checkout, edge functions
- Sem nova seção de depoimentos por enquanto (o HTML não trouxe — posso adicionar depois se quiser)
- Nome comercial permanece "Método IA Real" (rebrand para "Escola de IA" fica para outra rodada)
