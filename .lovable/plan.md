

# Plano: Remover ExitIntentPopup e Aumentar Logo

## Objetivo
Remover o popup de intenção de saída (ExitIntentPopup) e corrigir o tamanho do logo no header para 250px como solicitado.

## Análise do Estado Atual

Baseado no screenshot enviado:
- **Logo no header**: Está muito pequeno (apenas 80-100px de largura visível)
- **ExitIntentPopup**: Componente ativo em `src/components/landing/ExitIntentPopup.tsx` sendo importado em Index.tsx

## Correções Necessárias

### 1. Remover ExitIntentPopup (Index.tsx)
- Remover import do componente
- Remover `<ExitIntentPopup />` do JSX
- Remover import do CheckoutDialog se não for mais usado

### 2. Aumentar Logo no TopHeader.tsx
O logo parece estar com tamanho visual menor do que o configurado. Possíveis causas:
- Altura `h-10 sm:h-12 md:h-14 lg:h-16` pode estar limitando a largura
- `min-w` pode não estar sendo aplicado corretamente
- Container do logo pode estar restringindo o tamanho

**Ajustes:**
- Aumentar altura para `h-12 sm:h-14 md:h-16 lg:h-20` 
- Garantir `w-auto` e `min-w-[160px] md:min-w-[200px] lg:min-w-[250px]`
- Verificar se o container do Link está restringindo

### 3. Verificar Footer.tsx também
Padronizar com mesmo tamanho se necessário

## Arquivos a Modificar
- `src/pages/Index.tsx` — remover ExitIntentPopup
- `src/components/TopHeader.tsx` — corrigir tamanho do logo

