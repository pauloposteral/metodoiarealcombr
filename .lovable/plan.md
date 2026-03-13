

# Plano: Migrar todos os links de pagamento para Stripe (Crédito + PIX)

## Situação Atual
- 5 componentes usam `PAYMENT_URL` apontando para Greenn (`payfast.greenn.com.br/152833`)
- Todos usam `<a href={PAYMENT_URL}>` — links estáticos sem autenticação
- Já existe edge function `create-checkout` funcional com Stripe
- O curso da landing é venda única (R$497), diferente dos planos de assinatura (Pro/Premium)

## Estratégia

Criar um **hook `useCheckout`** que encapsula a lógica de checkout Stripe para o curso (pagamento único). Todos os CTAs da landing passam de `<a href>` para `<button onClick>`, que:
1. Se logado → chama `create-checkout` com mode `payment` + PIX habilitado
2. Se não logado → redireciona para `/auth?redirect=checkout`

## Mudanças

### 1. Atualizar edge function `create-checkout`
- Adicionar suporte a `mode: "payment"` (além de subscription)
- Adicionar `payment_method_types: ['card', 'pix']` para pagamentos únicos
- Aceitar parâmetro `mode` no body request

### 2. Criar hook `src/hooks/useCheckout.ts`
- Verifica autenticação
- Chama `create-checkout` com priceId do curso + mode payment
- Abre URL do Stripe em nova aba
- Mostra loading/toast de erro

### 3. Atualizar 5 componentes (remover `<a href={PAYMENT_URL}>`)
- `HeroSection.tsx` → botão com `onClick={handleCheckout}`
- `FinalCTASection.tsx` → idem
- `PricingAnchor.tsx` → idem
- `StickyMobileCTA.tsx` → idem
- `ExitIntentPopup.tsx` → idem

### 4. Atualizar `src/lib/constants.ts`
- Remover `PAYMENT_URL` (Greenn)
- Adicionar `COURSE_PRICE_ID` com o price_id do Stripe do curso

### 5. Criar produto/preço no Stripe
- Usar ferramenta Stripe para criar produto "Método IA Real" com preço R$497 (pagamento único)
- Obter o `price_id` real

## Arquivos Modificados
- `supabase/functions/create-checkout/index.ts` — suporte payment + PIX
- `src/hooks/useCheckout.ts` — novo hook
- `src/lib/constants.ts` — trocar Greenn por Stripe price ID
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/FinalCTASection.tsx`
- `src/components/landing/PricingAnchor.tsx`
- `src/components/landing/StickyMobileCTA.tsx`
- `src/components/landing/ExitIntentPopup.tsx`

