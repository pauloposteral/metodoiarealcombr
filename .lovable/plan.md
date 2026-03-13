

# Plano: Pagamento Integrado + Logos Responsivos + 20 Melhorias

## 1. Pagamento Integrado no Site (Checkout Embutido)

**Problema atual:** Ao clicar em "Comprar", o usuario precisa ir para pagina externa do Stripe. Isso causa abandono.

**Solucao:** Criar um fluxo de checkout inline na propria landing page:

1. **Criar componente `CheckoutDialog`** — Modal que aparece ao clicar qualquer CTA de compra. Contém:
   - Se nao logado: formulario rapido de login/signup embutido (email + senha)
   - Se logado: mostra resumo da compra + botao "Pagar agora"
   - Redireciona para Stripe Checkout (que ja esta funcionando)
   
2. **Criar pagina `/checkout`** como rota alternativa ao dialog, para usuarios que preferem tela cheia. Mostra:
   - Resumo do produto (nome, preco, bonus)
   - Login/signup inline se nao autenticado
   - Botoes "Pagar com Cartao" e "Pagar com PIX" separados
   - Selos de seguranca e garantia

3. **Atualizar `useCheckout`** — Em vez de redirecionar para `/auth`, abrir o CheckoutDialog ou ir para `/checkout`

4. **Atualizar `Auth.tsx`** — Tratar query param `?redirect=checkout` para apos login redirecionar para checkout automatico

## 2. Logos Responsivos

**Problema:** Logo no TopHeader tem tamanhos fixos grandes (`h-[70px]` a `h-[110px]`) que pode overflow no header de `h-12`/`h-14`. Footer logo tambem precisa ajuste.

**Correcoes:**
- `TopHeader.tsx`: Reduzir logo para `h-8 sm:h-9 md:h-10` com `object-contain`
- `Footer.tsx`: Padronizar logo `h-8 md:h-10`
- `Auth.tsx`: Logo `h-10 md:h-12`
- `Obrigado.tsx`: Logo responsivo

## 3. 20 Melhorias

| # | Melhoria | Arquivo |
|---|----------|---------|
| 1 | Checkout inline com dialog/pagina dedicada | Novo `CheckoutDialog.tsx` + `/checkout` |
| 2 | Login embutido no checkout (sem redirect) | `CheckoutDialog.tsx` |
| 3 | Botoes separados Cartao vs PIX no checkout | `CheckoutDialog.tsx` |
| 4 | Logo responsivo no TopHeader (fix overflow) | `TopHeader.tsx` |
| 5 | Logo responsivo no Footer | `Footer.tsx` |
| 6 | Logo responsivo na Auth | `Auth.tsx` |
| 7 | Logo responsivo na Obrigado | `Obrigado.tsx` |
| 8 | Selos de seguranca no checkout (SSL, Stripe) | `CheckoutDialog.tsx` |
| 9 | Resumo visual do produto no checkout | `CheckoutDialog.tsx` |
| 10 | Auto-redirect apos login quando vem de checkout | `Auth.tsx` |
| 11 | Animacao de loading melhorada durante checkout | `useCheckout.ts` |
| 12 | Toast de sucesso personalizado pos-checkout | `useCheckout.ts` |
| 13 | Badge "Pagamento Seguro" nos CTAs | `HeroSection.tsx`, `PricingAnchor.tsx` |
| 14 | Icones de bandeiras de cartao nos CTAs | `PricingAnchor.tsx` |
| 15 | Copy melhorada nos CTAs com urgencia | Varios |
| 16 | Contador de vagas restantes no checkout | `CheckoutDialog.tsx` |
| 17 | Selo de garantia visual maior no checkout | `CheckoutDialog.tsx` |
| 18 | Feedback visual de hover melhorado nos CTAs | `button.tsx` updates |
| 19 | Mobile: checkout fullscreen em vez de dialog | `CheckoutDialog.tsx` |
| 20 | Meta pixel tracking no inicio do checkout | `useCheckout.ts` |

## Arquivos

- **Criar:** `src/components/landing/CheckoutDialog.tsx`, `src/pages/Checkout.tsx`
- **Modificar:** `TopHeader.tsx`, `Footer.tsx`, `Auth.tsx`, `Obrigado.tsx`, `useCheckout.ts`, `HeroSection.tsx`, `PricingAnchor.tsx`, `FinalCTASection.tsx`, `StickyMobileCTA.tsx`, `ExitIntentPopup.tsx`, `App.tsx`

