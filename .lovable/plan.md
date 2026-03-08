

# Plano de Implementação — Arquitetura v1.0 da Plataforma de Curso de IA

## Considerações Importantes

**Stack:** O projeto Lovable usa **React + Vite + React Router** (não Next.js). A arquitetura proposta será adaptada para essa stack. Não há Server Components, Route Handlers nem `middleware.ts` do Next.js. A lógica server-side vive em **Edge Functions** do Lovable Cloud.

**Roles:** O documento propõe `role` no `profiles`, mas a plataforma já segue o padrão correto com tabela `user_roles` separada + função `has_role()`. Vamos manter esse padrão.

---

## O que já existe vs. O que precisa ser criado

### Já existe (manter/evoluir):
- Auth (login/signup com Supabase), profiles, trigger `handle_new_user`
- Tabelas: `profiles`, `modules`, `lessons`, `lesson_progress`, `certificates`, `community_posts`, `community_comments`, `post_likes`, `comment_likes`, `user_points`, `user_badges`, `badges`, `user_roles`
- Dashboard aluno com progresso, gamificação, ranking
- Admin panel com dashboard, gestão de usuários, leads, empresas
- Comunidade com posts, comentários, likes, moderação
- Certificados com código verificável
- Carrossel editor (feature avançada já implementada)

### Precisa ser criado/refatorado:

| Feature | Status | Ação |
|---------|--------|------|
| **Planos/Subscriptions (Stripe)** | Não existe | Criar tabelas `plans`, `subscriptions` + integração Stripe |
| **Quizzes** | Não existe | Criar tabelas `quizzes`, `quiz_attempts` + UI |
| **AI Sandbox** | Não existe | Criar tabela `sandbox_sessions` + UI playground |
| **Courses (multi-curso)** | Parcial (modules/lessons existem, mas sem `courses` parent) | Criar tabela `courses` + refatorar modules |
| **Content JSONB blocks** | Lessons usam `content: text` | Migrar para JSONB com blocos tipados |
| **Achievements avançados** | Básico (`badges`/`user_badges`) | Expandir com `criteria` JSONB e auto-unlock |
| **Onboarding flow** | Não existe | Criar fluxo pós-signup |
| **Billing page (Pricing)** | Não existe | Criar página de pricing + checkout |
| **Streaks** | Não rastreado | Adicionar tracking de dias consecutivos |

---

## Plano por Sprints (adaptado para Vite/React)

### Sprint 1 — Fundação (DB + Auth refinement)
1. **Migração DB**: Criar tabelas `courses`, `plans`, `subscriptions`, `quizzes`, `quiz_attempts`, `sandbox_sessions`, `achievements`, `user_achievements`
2. **Refatorar `modules`**: Adicionar FK `course_id` referenciando nova tabela `courses`
3. **Refatorar `lessons`**: Adicionar campos `type`, `slug`, `is_free`, `estimated_minutes`; migrar `content` de text para JSONB
4. **Refatorar `lesson_progress`**: Adicionar `status`, `started_at`, `time_spent_seconds`, `score`
5. **RLS policies** para todas as novas tabelas
6. **Onboarding**: Adicionar `onboarding_done` e `bio` ao `profiles`

### Sprint 2 — Stripe Billing
1. Habilitar Stripe via ferramenta Lovable
2. Criar tabela `plans` com dados dos 3 planos (Free/Pro/Premium)
3. Criar Edge Function para webhooks Stripe
4. Página `/pricing` com cards de planos
5. Lógica de acesso condicional por subscription status
6. Portal do cliente Stripe para gerenciar assinatura

### Sprint 3 — Sistema de Conteúdo Multi-Curso
1. Página `/membros/cursos` com grid de cursos
2. Página `/membros/cursos/:courseId` com overview
3. Refatorar `LessonContent` para renderizar blocos JSONB (markdown, code, callout, image, checkpoint)
4. CMS admin para CRUD de cursos/módulos/aulas
5. Editor de aulas com blocos (ContentEditor)
6. Sistema draft/published

### Sprint 4 — Quizzes + Sandbox IA
1. UI de quiz: renderizar perguntas, validar respostas, calcular score
2. Tracking de tentativas com `quiz_attempts`
3. AI Playground com chat interface
4. Edge Function proxy para Lovable AI (Gemini/GPT)
5. Rate limiting por plano (contagem em `sandbox_sessions`)
6. Histórico de sessões

### Sprint 5 — Gamificação Avançada + Polish
1. Tabela `achievements` com `criteria` JSONB
2. Auto-unlock via DB function/trigger
3. Sistema de streaks (dias consecutivos)
4. Notificações in-app para conquistas
5. Onboarding flow para novos alunos
6. SEO e meta tags com react-helmet-async

---

## Detalhes Técnicos

### Novas tabelas (SQL resumido):
- `courses` — id, title, slug, description, thumbnail_url, difficulty, estimated_hours, is_published, is_free, tags[], timestamps
- `plans` — id, name, slug, price_monthly, price_yearly, features JSONB, stripe_price_ids, is_active
- `subscriptions` — id, user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, period_start/end, cancel_at
- `quizzes` — id, lesson_id, title, questions JSONB, passing_score, time_limit, max_attempts
- `quiz_attempts` — id, user_id, quiz_id, answers JSONB, score, passed, time_spent, completed_at
- `sandbox_sessions` — id, user_id, lesson_id, prompt, response, model_used, tokens_used, created_at
- `achievements` — id, slug, title, description, icon, criteria JSONB, points
- `user_achievements` — id, user_id, achievement_id, unlocked_at, metadata JSONB

### Alterações em tabelas existentes:
- `modules`: ADD `course_id UUID REFERENCES courses(id)`, ADD `slug TEXT`, ADD `is_published BOOLEAN`
- `lessons`: ADD `slug TEXT`, ADD `type TEXT`, ADD `is_free BOOLEAN`, ADD `estimated_minutes INTEGER`; ALTER `content` to JSONB
- `lesson_progress`: ADD `status TEXT`, ADD `started_at`, ADD `time_spent_seconds`, ADD `score`
- `profiles`: ADD `bio TEXT`, ADD `onboarding_done BOOLEAN`

### Routing (React Router):
- `/pricing` — Página de planos
- `/membros/cursos` — Lista de cursos
- `/membros/cursos/:courseId` — Overview do curso
- `/membros/sandbox` — AI Playground
- `/admin/conteudo` — CMS admin
- `/admin/billing` — Gestão de assinaturas

---

## Recomendação

Sugiro começar pela **Sprint 1 (Fundação DB)** — criar as tabelas novas e alterar as existentes. Isso prepara a base para todas as features seguintes sem quebrar o que já funciona.

Quer que eu comece pela Sprint 1?

