

# Análise do Print — Problemas e Correções

## Problemas Identificados no Screenshot

1. **Logo minúsculo no mobile** — quase invisível, parece um favicon
2. **Gap enorme entre header e hero** — `pt-14 md:pt-16` no `<main>` é redundante porque `sticky` já ocupa espaço no fluxo. Resultado: ~56px de espaço vazio cinza
3. **UrgencyBar escondida** — `fixed top-0 z-[60]` fica ATRÁS do header `sticky top-0 z-[100]`
4. **WhatsApp tooltip sobrepõe os CTAs** — botão e tooltip bloqueiam "Ver módulos" e parte do CTA principal
5. **Header desconectado visualmente** — border-b cria separação artificial do hero

## Correções

### 1. Remover padding redundante do main (Index.tsx)
- Remover `pt-14 md:pt-16` — sticky já ocupa espaço no fluxo, esse padding cria o gap vazio

### 2. UrgencyBar acima do header (UrgencyBar.tsx + TopHeader.tsx)
- Mudar UrgencyBar de `fixed` para elemento normal no fluxo (antes do header)
- Header `sticky top-0` vai colar no topo quando UrgencyBar sair da viewport ao scrollar
- Resultado: UrgencyBar visível → scroll → header cola no topo

### 3. Logo maior e mais visível (TopHeader.tsx)
- Mobile: `h-8` → `h-9` com `min-w-[120px]`  
- Botão Área VIP: ícones maiores, texto visível até em telas pequenas

### 4. WhatsApp reposicionado (WhatsAppBubble.tsx)
- Mover tooltip para a esquerda do botão (não acima)
- Posicionar mais alto: `bottom-24` no mobile para não cobrir StickyMobileCTA
- Reduzir tamanho do botão no mobile

### 5. Header visual refinado (TopHeader.tsx)
- Remover `border-b` — usar apenas shadow sutil para separação
- Aumentar opacidade do backdrop: `bg-navy-dark/95`

### 6. Hero ajuste (HeroSection.tsx)
- Reduzir `pt-20` mobile para `pt-8` — header sticky já dá o offset
- Min-height ajustado para compensar

## Arquivos a Modificar
- `src/pages/Index.tsx` — remover pt redundante
- `src/components/landing/UrgencyBar.tsx` — de fixed para fluxo normal
- `src/components/TopHeader.tsx` — logo maior, visual refinado
- `src/components/sections/HeroSection.tsx` — padding ajustado
- `src/components/landing/WhatsAppBubble.tsx` — reposicionar

