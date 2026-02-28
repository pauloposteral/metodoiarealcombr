

## Plano: Atualizar modelo de geração de imagens para Gemini 3 Pro

Trocar o modelo `google/gemini-2.5-flash-image-preview` para `google/gemini-3-pro-image-preview` em todas as edge functions de geração de imagem. Isso vai produzir imagens de qualidade significativamente superior.

### Arquivos a alterar

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `supabase/functions/generate-story/index.ts` | 129 | `gemini-2.5-flash-image-preview` → `gemini-3-pro-image-preview` |
| `supabase/functions/generate-image/index.ts` | 36 | `gemini-2.5-flash-image-preview` → `gemini-3-pro-image-preview` |
| `supabase/functions/generate-slide-image/index.ts` | 67 | `gemini-2.5-flash-image-preview` → `gemini-3-pro-image-preview` |

### Detalhes técnicos

- O modelo `google/gemini-3-pro-image-preview` é o modelo de geração de imagem mais avançado disponível
- A API é compatível — mesma estrutura de request/response, apenas troca o campo `model`
- Imagens geradas terão qualidade superior mas podem ser ligeiramente mais lentas
- Após a edição, as 3 edge functions serão re-deployed automaticamente

