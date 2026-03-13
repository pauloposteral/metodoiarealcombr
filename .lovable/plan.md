

# Plano: Corrigir Links, Compactar Pagina e 20 Melhorias

## 1. Corrigir Links de Pagamento

Todos os 5 arquivos usam o mesmo link `https://payfast.greenn.com.br/152833`. Vou centralizar num unico lugar para facilitar manutencao futura.

**Acao:** Criar constante `PAYMENT_URL` em `src/lib/constants.ts` e substituir em:
- `HeroSection.tsx`
- `FinalCTASection.tsx`
- `ExitIntentPopup.tsx`
- `PricingAnchor.tsx`
- `StickyMobileCTA.tsx`

## 2. Compactar a Pagina (Reduzir ~40% da rolagem)

A landing tem **21 secoes** + 3 objection handlers. Muitas sao redundantes. Plano de fusao:

| Remover/Fundir | Motivo |
|---|---|
| `HowAIWorksSection` + `StepByStepSection` | Ambas explicam o processo. Fundir em uma unica secao com flow + 4 passos |
| `LearningMapSection` + `WhatYouLearnSection` | Ambas sobre jornada de aprendizado. Fundir em uma secao compacta |
| `HumanSection` | Redundante com TestimonialsSection. Remover |
| `DifferentialsSection` + `HowItWorksSection` | Muito similares. Fundir em uma secao "Por que escolher" |
| `ComparisonSection` + `BeforeAfterSection` | Ambas sao "antes vs depois". Fundir |
| Objection #2 e #3 | Reduzir para apenas 1 objection handler |
| `StorytellingSection` | Integrar como card dentro de TestimonialsSection |
| `RealProofSection` | Integrar prints dentro de PromptExampleSection |

**Resultado:** De ~21 secoes para ~12 secoes. Reducao de padding de `py-20 md:py-28` para `py-10 md:py-16` nas secoes restantes.

**Nova ordem da pagina:**
1. Hero
2. Problema
3. Objection handler (1 unico)
4. Solucao
5. Processo + Como funciona (fundida)
6. Antes vs Depois (fundida)
7. Exemplo de Prompt + Prova Real (fundida)
8. Modulos (accordion compacto)
9. Para Quem E + Diferenciais (fundida)
10. Bonus
11. Pricing
12. Depoimentos (com storytelling integrado)
13. FAQ
14. CTA Final
15. Footer

## 3. 20 Melhorias Adicionais

| # | Melhoria | Arquivo |
|---|----------|---------|
| 1 | Centralizar URL de pagamento em constante | `src/lib/constants.ts` + 5 arquivos |
| 2 | Reduzir padding vertical de todas as secoes (~30%) | Todas as secoes |
| 3 | Fundir HowAIWorks + StepByStep | Nova secao compacta |
| 4 | Fundir LearningMap + WhatYouLearn | Nova secao compacta |
| 5 | Fundir Comparison + BeforeAfter | Nova secao compacta |
| 6 | Fundir Differentials + HowItWorks | Nova secao compacta |
| 7 | Remover HumanSection (redundante) | `Index.tsx` |
| 8 | Integrar Storytelling dentro de Testimonials | `TestimonialsSection.tsx` |
| 9 | Reduzir de 3 para 1 ObjectionHandler | `Index.tsx` |
| 10 | Modulos em accordion colapsavel (economia vertical) | `ModulesSection.tsx` |
| 11 | Lazy load de imagens com `loading="lazy"` em todas as secoes | Varias |
| 12 | Melhorar FinalCTA copy - "Quero comecar agora" em vez de "Comunidade" | `FinalCTASection.tsx` |
| 13 | Adicionar micro-animacao pulse no CTA principal do Hero | `HeroSection.tsx` |
| 14 | FAQ: limitar a 6 perguntas mais importantes (remover duplicatas) | `FAQSection.tsx` |
| 15 | PricingAnchor: adicionar badge PIX com desconto extra | `PricingAnchor.tsx` |
| 16 | Testimonials: reduzir de 6 para 4 depoimentos | `TestimonialsSection.tsx` |
| 17 | BonusSection: layout horizontal mais compacto | `BonusSection.tsx` |
| 18 | StickyMobileCTA: adicionar preco "12x R$41" no botao | `StickyMobileCTA.tsx` |
| 19 | UrgencyBar: melhorar copy com emoji e desconto | `UrgencyBar.tsx` |
| 20 | Remover FloatingRating (distrai e ocupa espaco) | `Index.tsx` |

## Resumo Tecnico

- **Arquivos a criar:** `src/lib/constants.ts`
- **Arquivos a modificar:** ~15 arquivos de secoes
- **Arquivos a remover do Index:** `HumanSection`, `FloatingRating`, 2 ObjectionHandlers
- **Secoes fundidas:** 5 fusoes (10 secoes viram 5)
- **Impacto:** Pagina ~40% mais curta, links centralizados, UX mais focada

