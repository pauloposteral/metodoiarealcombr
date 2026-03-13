

# Padronizar Logo 250px em Todo o Site

## Locais com logo e tamanhos atuais

| Arquivo | Tamanho atual |
|---------|--------------|
| `TopHeader.tsx` | `h-12 sm:h-14 md:h-16 lg:h-20, min-w-[180px] lg:min-w-[280px]` |
| `Footer.tsx` | `h-14 md:h-16 lg:h-20, min-w-[180px] md:min-w-[200px]` |
| `Auth.tsx` | `h-12 md:h-16 lg:h-20, min-w-[160px] md:min-w-[200px]` |
| `Obrigado.tsx` | `h-12 md:h-16 lg:h-20, min-w-[160px] md:min-w-[200px]` |
| `Checkout.tsx` | `h-7 sm:h-8` |
| `CheckoutDialog.tsx` | `h-8` |
| `Termos.tsx` | `h-8` |
| `Privacidade.tsx` | `h-8` |
| `ValidateCertificate.tsx` | `h-8` |
| `MembersSidebar.tsx` | `h-8` / `h-10` (colapsado/expandido) |
| `CertificateTemplate.tsx` | `h-16` |

## Correção

Aplicar `w-[250px] h-auto object-contain` em **todos** os logos listados acima, garantindo que a largura seja sempre 250px e a altura se ajuste proporcionalmente.

**Exceções com tamanho menor** (espaço limitado):
- `MembersSidebar.tsx` — sidebar tem largura restrita, usar `w-[180px]` expandido / `w-[40px]` colapsado
- `CertificateTemplate.tsx` — manter proporcional ao certificado, usar `w-[250px]`

## Arquivos a modificar (10 arquivos)
1. `src/components/TopHeader.tsx`
2. `src/components/Footer.tsx`
3. `src/pages/Auth.tsx`
4. `src/pages/Obrigado.tsx`
5. `src/pages/Checkout.tsx`
6. `src/components/landing/CheckoutDialog.tsx`
7. `src/pages/Termos.tsx`
8. `src/pages/Privacidade.tsx`
9. `src/pages/ValidateCertificate.tsx`
10. `src/components/members/MembersSidebar.tsx`

