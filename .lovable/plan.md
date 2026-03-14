

# Auditoria Pente Fino — Bugs e Correções

## Problemas Encontrados

### 1. BUG CRITICO: Hook chamado após return condicional (MembersLayout.tsx)
Na linha 73, `useAchievementChecker(user?.id)` e chamado **depois** do `if (loading) return ...` na linha 61. Isso viola as regras de hooks do React — hooks devem ser chamados incondicionalmente, antes de qualquer return. Pode causar crashes silenciosos ou comportamento imprevisivel.

**Correção:** Mover o `useAchievementChecker` para antes do primeiro `if (loading)`.

### 2. WhatsApp com numero placeholder (WhatsAppBubble.tsx)
O link do WhatsApp usa `5500000000000` — um numero falso. O `constants.ts` tem `WHATSAPP_URL` com `5511999999999`, mas o WhatsAppBubble nao usa essa constante.

**Correção:** Importar `WHATSAPP_URL` de `@/lib/constants` e usar no href.

### 3. UrgencyBar importada mas nao renderizada (Index.tsx)
`UrgencyBar` e importada na linha 19 mas nunca usada no JSX. Import morto.

**Correção:** Remover o import nao utilizado.

### 4. FloatingRating e SocialProofCounter — componentes orfaos
Existem em `/landing/` mas nao sao importados em nenhum lugar do app. Codigo morto.

**Correção:** Remover arquivos nao utilizados.

### 5. ReadingProgress z-index conflita com header
O header usa `z-[100]` e o ReadingProgress usa `z-[55]` com `top-9 sm:top-10`. Isso posiciona a barra de progresso **atras** do header sticky. Deveria ficar logo abaixo do header.

**Correção:** Ajustar para `z-[101]` e `top-14 md:top-16` para ficar exatamente abaixo do header.

### 6. Variavel `session` nao utilizada (MembersLayout.tsx)
`session` e guardada em state mas nunca lida apos ser setada.

**Correção:** Remover estado `session` nao utilizado.

## Arquivos a Modificar

| Arquivo | Correção |
|---------|----------|
| `src/components/members/MembersLayout.tsx` | Mover hook antes dos returns; remover `session` state |
| `src/components/landing/WhatsAppBubble.tsx` | Usar `WHATSAPP_URL` de constants |
| `src/pages/Index.tsx` | Remover import `UrgencyBar` |
| `src/components/landing/ReadingProgress.tsx` | Ajustar z-index e top |
| `src/components/landing/FloatingRating.tsx` | Deletar (codigo morto) |
| `src/components/landing/SocialProofCounter.tsx` | Deletar (codigo morto) |

