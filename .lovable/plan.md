

# Plano: Ajustar Header Fixo e Logo Responsivo

## Problemas Identificados

1. **Header fixo com offset complexo**: `top-9 sm:top-10` + `z-50` pode causar inconsistências no empilhamento
2. **Logo pode estar pequeno**: `h-8 sm:h-9 md:h-10` pode não ser visível o suficiente em todas as viewports
3. **Footer logo inconsistente**: `h-10 md:h-12` vs header `h-8 md:h-10`

## Solução Proposta

### 1. Header Fixo Otimizado (TopHeader.tsx)
- Converter para `sticky top-0` para melhor comportamento de scroll
- Padronizar z-index: `z-[100]` para garantir que fique acima de tudo
- Ajustar altura do header: `h-14 md:h-16` para mais área de clique
- Manter posicionamento relativo à UrgencyBar (offset automático via sticky)

### 2. Logo Responsivo e Visível
**TopHeader.tsx:**
- Aumentar logo: `h-10 sm:h-11 md:h-12` (antes: `h-8 md:h-10`)
- Garantir `object-contain` e `w-auto` para preservar proporção
- Adicionar `min-w-[100px]` para evitar compressão extrema

**Footer.tsx:**
- Padronizar com header: `h-10 md:h-12` já está ok, talvez aumentar para `h-11 md:h-14`

### 3. Ajustes de Z-Index e Ordem
- UrgencyBar: manter `z-[60]` no topo absoluto
- TopHeader: elevar para `z-[50]` ou usar sticky context
- Adicionar `will-change-transform` para performance de scroll

### 4. Espaçamento do Main Content
- Ajustar `main` em Index.tsx para compensar altura do header fixo
- Adicionar `pt-14 md:pt-16` no container principal

## Arquivos a Modificar
- `src/components/TopHeader.tsx` - header sticky + logo maior
- `src/components/Footer.tsx` - logo consistente
- `src/pages/Index.tsx` - ajuste de padding top no main

