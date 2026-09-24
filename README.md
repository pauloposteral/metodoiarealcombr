# Método IA Real

Plataforma React/TypeScript com Vite, Supabase (PostgreSQL/Auth/Storage/Edge Functions), Stripe, Greenn e geração de conteúdo com IA.

## Executar localmente

Requer Node.js 24. Use a versão indicada em `.nvmrc`.

```bash
npm ci --ignore-scripts
cp .env.example .env.local
# Preencha somente a URL e a chave pública do seu projeto de desenvolvimento.
npm run dev
```

As variáveis `VITE_*` ficam públicas no navegador. Nunca coloque nelas chaves Stripe, service-role, senha do banco ou tokens de webhook. O `.env` histórico do projeto contém configuração pública; `.env.local` permite usar outro projeto sem alterá-lo.

## Verificar a entrega

```bash
npm run check
npm audit --audit-level=moderate
npx playwright install chromium
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# Em outro terminal:
npm run test:smoke
```

`check` executa TypeScript do frontend e das Edge Functions, ESLint, testes de validação, handlers e banco, e build. Os testes SQL usam PostgreSQL via PGlite com um modelo mínimo dos schemas gerenciados pelo Supabase. O smoke de navegador simula serviços externos e cobre desktop e celular; não realiza cobranças, envio de e-mails ou chamadas de IA.

A integração contínua em `.github/workflows/ci.yml` repete essas verificações e a consulta de vulnerabilidades do npm.

## Estrutura

- `src/`: aplicação, área de membros, administração e ferramentas de criação.
- `supabase/functions/`: 14 endpoints e módulos compartilhados de segurança/pagamentos.
- `supabase/migrations/`: histórico SQL do aplicativo e correções de acesso, cobrança e integridade.
- `tests/`: regressões de segurança e comportamento.
- `scripts/backup-db.sh`: backup PostgreSQL somente de leitura; exige conexão privada.
- `docs/IMPLANTACAO.md`: configurações, homologação, implantação e recuperação.
- `docs/AUDITORIA-2026-09-24.md`: avaliação, evidências e limitações da auditoria.

## Banco de dados

O repositório contém migrações e alguns seeds. Ele **não contém um backup dos dados reais** nem os arquivos armazenados no Supabase Storage. A reprodução local dos testes não certifica que o schema de produção é igual ao Git.

Antes de implantar, compare o histórico de migrações com o projeto de destino, obtenha backup, teste restauração e valide os fluxos de pagamento em ambiente de homologação. Não execute novamente migrações antigas sobre uma produção existente.
