
# Plano — Correções críticas da landing + Sprint 1 de plataforma

Executado em duas frentes independentes que podem seguir em paralelo. Nada aqui grava aula nem promete conteúdo inexistente — a landing só passa a vender de verdade quando você me disser que a garantia (7 ou 15 dias) e o link real do Kiwify estão prontos.

## Frente A — Landing: destravar venda e conformidade

### A1. Legal (LGPD) — Termos e Privacidade
- Nova rota `/termos-de-uso` e reforço da `/privacidade` existente com textos completos: identificação do controlador, finalidades, bases legais, dados coletados (checkout, quiz, progresso, e-mail marketing), compartilhamento (Kiwify, Supabase, Meta, Google), direitos do titular (art. 18 LGPD), retenção, cookies, canal do encarregado.
- CNPJ real substituindo o placeholder `00.000.000/0001-00` no Footer e nos documentos. **Você me passa o CNPJ; sem ele o rodapé mantém "CNPJ em cadastro" em vez de um número inventado.**
- Links de Termos e Privacidade também no `CheckoutDialog` (checkbox opcional de aceite antes de "Pagar").

### A2. Checkout real
- Substituir o placeholder de checkout pelo produto Kiwify real (link único definitivo) em uma única constante `CHECKOUT_URL` em `src/lib/constants.ts`.
- Guard: se `CHECKOUT_URL` estiver vazio, os CTAs mostram um toast "Checkout em configuração" em vez de abrir uma URL quebrada.
- **Preciso do link final do Kiwify.** Enquanto ele não vier, deixo o guard ativo; a landing continua navegável mas não vende — melhor do que vender no vácuo.

### A3. Medição (Meta Pixel + GA4)
- `index.html`: snippets do Meta Pixel e GA4 com IDs vindos de `VITE_META_PIXEL_ID` e `VITE_GA_MEASUREMENT_ID` no `.env`. Se o ID estiver ausente, o snippet não é injetado (sem "PIXEL_ID" hardcoded).
- Eventos padronizados: `PageView` (auto), `ViewContent` no scroll da seção oferta, `InitiateCheckout` no clique dos CTAs, `Lead` no submit de qualquer formulário de captura futuro.
- Consent gate simples via banner de cookies (necessário/analytics/marketing) — pixel e GA só disparam após consentimento (LGPD art. 7º e 8º).
- **Preciso do Pixel ID e do Measurement ID (G-XXXXXXX).**

### A4. Head, OG e favicon
- Adotar `react-helmet-async` (provider no `main.tsx`) para permitir que a Landing V2, `/termos`, `/privacidade` e `/checkout` tenham `<title>`, `<meta description>`, `canonical` e `og:*` próprios apontando para `https://metodoiareal.com.br`.
- `index.html` sitewide: título "Método IA Real — Aprenda IA na prática" (~55 chars), meta description factual (sem promessa de renda, respeita RN-011), `og:type=website`, `og:url` canônico, JSON-LD `Organization` + `Course`.
- Favicon derivado do logo `src/assets/logo-iareal.png` copiado para `public/favicon.png`; remove `public/favicon.ico` padrão.
- `og:image` só entra se você aprovar uma imagem 1200×630 gerada a partir do hero — caso contrário, deixo a hospedagem injetar a preview automática (placeholder ruim atrapalha compartilhamento).

### A5. Higienização de copy antes do lançamento
- Ajuste dos números que hoje inflam expectativa: "2.847 alunos", "96% concluem projeto", "24h suporte" (nos contadores animados do Wow5) são substituídos por copy honesta de pré-lançamento ("Turma fundadora aberta", "Suporte comprometido em ≤24h úteis"). Sem inventar métricas até o beta terminar — protege contra CDC art. 37 (publicidade enganosa) e a promessa nº 2 da escola.
- Bloco RN-011 ("sem promessa de ganho") continua visível.

## Frente B — Plataforma: migrations 001–016 + Sprint 1

### B1. Migrations 001–016
- Aplicar via `supabase--migration` em uma única migration consolidada (ordem preservada, mesmo conteúdo do PRD), com o padrão obrigatório: `CREATE TABLE` → `GRANT` (authenticated + service_role; `anon` só onde a política permite leitura pública) → `ENABLE RLS` → `CREATE POLICY`.
- Cobertura esperada (a confirmar contra os arquivos das migrations que você tem — se elas estiverem versionadas em algum lugar do repo, uso o texto exato; caso contrário, escrevo a partir do PRD e você aprova antes de rodar): `profiles`, `enrollments`, `modules`, `lessons`, `lesson_progress`, `bookmarks`, `notes`, `certificates`, `community_posts/comments`, `radar_editions`, `prompts_library`, `user_roles` (enum `app_role`), função `has_role` `SECURITY DEFINER`.
- Auditoria de conflitos com o schema atual (existe `profiles`, `courses`, `modules`, `lessons`, `lesson_progress`, `user_roles`, `has_role` etc.): antes de gerar SQL, leio o schema real com `supabase--read_query` e produzo um diff — só migro o que falta, sem recriar tabelas existentes. Nenhuma tabela é dropada.
- Sem trigger em schemas `auth`/`storage`/`realtime`.

### B2. Sprint 1 — Auth
- Rota `/entrar` com email/senha + Google (defaults Lovable Cloud) e `/redefinir-senha` (`type=recovery`, `supabase.auth.updateUser({ password })`).
- `emailRedirectTo: window.location.origin` no signup; `redirectTo: ${origin}/redefinir-senha` no reset.
- `onAuthStateChange` registrado cedo no `App.tsx`; checagens sensíveis usam `getUser()` (revalidação), atalho de token com `getSession()`.
- Trigger `handle_new_user` já existe — apenas confirmo que popula `profiles` com `full_name` do `raw_user_meta_data`.

### B3. Sprint 1 — Webhook Kiwify (`/api/webhooks/kiwify`)
- Edge Function `kiwify-webhook` (`verify_jwt = false`, adicionado ao `supabase/config.toml`).
- Validação HMAC do payload com secret `KIWIFY_WEBHOOK_SECRET` — pedido via `add_secret` **depois** da sua confirmação, não antes.
- Eventos tratados: `paid` (upsert em `enrollments` marcando `status='active'`, `expires_at` conforme plano), `refunded`/`chargedback` (marca `status='refunded'`), `subscription_canceled` (encerra acesso ao fim do período).
- Log estruturado em `webhook_events` para debug; idempotência por `order_id`.
- **Ponto de bloqueio honesto:** o payload real da Kiwify precisa ser validado em sandbox — se você tiver um sample do payload, uso o schema exato; se não, escrevo defensivo (`safeParse` com Zod) e um endpoint `/api/webhooks/kiwify/test` só em dev para você colar payloads reais.

### B4. Sprint 1 — Guard de acesso à área de membros
- HOC `<RequireEnrollment>` embrulhando `/membros/*`: consulta `enrollments` do usuário logado; se `status != 'active'` redireciona para `/acesso-pendente` (já existe uma rota `/metodo/acesso-pendente` como referência).
- Sem checagem client-side de role para admin — continua via `has_role(auth.uid(), 'admin')` server-side (política e função já existem, respeitando o padrão anti-recursão de RLS).

## Ordem de execução

1. **Frente B primeiro no lado de banco** (é a única coisa que precisa aprovação da migration antes de qualquer outro trabalho travar).
2. Em paralelo: Frente A1 (legal), A4 (helmet + favicon), A5 (copy honesta) — não dependem de nenhum secret seu.
3. Depois que você me passar CNPJ, Pixel ID, GA ID e link Kiwify: A2 + A3 (checkout real + medição) e B3 (webhook com secret).
4. B2 (auth) e B4 (guard) fecham a Sprint 1.

## O que **não** faço neste plano

- Não gravo, roteirizo nem publico aulas (é a §7 do seu doc; entra em plano separado quando você pedir).
- Não implemento o sistema de indicação (§5) — fica para depois do Sprint 1.
- Não altero o design/copy premium existente da Landing V2 além dos ajustes de honestidade (A5) e das inserções legais (A1). Zero regressão visual.
- Não invento CNPJ, IDs de pixel/GA nem link de checkout — cada um vira guard até você fornecer.

## Riscos assumidos

- Se você aprovar antes de me passar os IDs/link, executo tudo que **não** depende deles e deixo os pontos de integração com guard + TODO explícito no código. Nada de placeholder disfarçado passando por real.
- A consolidação das migrations 001–016 é reescrita a partir do PRD + schema atual (não tenho os arquivos originais no workspace). Você revisa o SQL antes de eu rodar `supabase--migration` — aprovação da migration é sua, por padrão.
