# Laboratório e videoteca — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ensinar o fluxo real briefing → app publicado com um laboratório original, referências audiovisuais identificadas e um ambiente de estudo profissional.
**Architecture:** Reutilizar MembersLayout, curso/outline/RLS e componentes existentes. Metadados públicos de referências ficam num catálogo; aulas originais pagas ficam apenas no banco. Não instalar SDKs de vídeo nem copiar repositórios inteiros.
**Tech Stack:** React, TypeScript, Tailwind, Radix Dialog/Tabs existentes, Supabase, Playwright.
**Spec:** Pedido de continuação de 20/10/2026 e roteiro aprovado da experiência Entender / Ver / Fazer / Revisar. Base f69a8b6. Trabalho isolado em metodo-lab-v3-20261020.

## Global Constraints
- Preservar 138 aulas ativas existentes, IDs, progresso, notas, pagamentos, autenticação e regra do certificado principal.
- Curso adicional: 6 módulos, 12 entradas (11 aulas e 1 projeto), exercícios e critérios próprios em português. Não prometer produção audiovisual própria.
- Vídeos externos: autoria, idioma, data, duração, exercício original, limitação de revisão. Link de origem sempre disponível. Nenhum download/reupload/transcrição integral.
- Zero requisições a YouTube/Google thumbnails antes de ativação explícita. Depois, player youtube-nocookie, sem autoplay e com alternativa de abrir origem.
- Nenhuma dependência nova, contratação, cobrança ou envio de e-mail real. Não alterar DNS nesta entrega.
- Identidade existente preservada: azul-noite, dourado, Realis oficial e contraste alto. Sem números de sucesso ou depoimentos inventados.
- Canva: storyboard existente localizado; nova geração on-brand aguarda confirmação no widget. Não declarar novo design final antes de retorno.

## Review Focus
- Acesso negado não expõe aulas pagas no bundle ou numa URL direta.
- Fechar o vídeo remove iframe; reabrir pede ativação, sem consentimento amplo permanente.
- Consulta sem resultados e falha de rede têm mensagens honestas e caminhos de retorno.
- Títulos longos, idioma estrangeiro e telas estreitas não causam overflow nem escondem autoria.
- Código público tem licenças diferentes; referência não significa autorização universal de reuso ou aprovação de segurança.

## Task 1 — Curadoria e contrato dos dados
- [ ] Testar catálogo, IDs YouTube, URL segura, filtragem, datas e unicidade (RED).
- [ ] Implementar catalogue + helpers puros (GREEN). Somente metadados e desafios originais.
- [ ] Registrar pesquisas oficiais e diferenças de licença, incluindo n8n source-available.

## Task 2 — Laboratório visual e vídeo sob demanda
Files: MembersLaboratory.tsx, LabVideoDialog.tsx, labResources.ts, App.tsx, MembersSidebar.tsx, MembersCourses.tsx; scripts/verify-lab.mjs.
- [ ] Acrescentar rota, acesso pelo menu/cursos, seis missões, busca e filtros de vídeos/fontes.
- [ ] Integrar próximo passo e progresso reais do curso via useCourseCatalog/useCompletedLessons.
- [ ] Testar 360/390/768/1440, teclado, consentimento, fechar/reabrir, zero rede externa antecipada, sem escritas de progresso.

## Task 3 — Conteúdo original no banco
- [ ] Criar snapshot/digest dos registros existentes e curso adicional em rascunho, transação idempotente.
- [ ] Escrever 11 aulas completas e projeto com exemplo, exercício, critérios e fontes; quizzes alinhados. Não inserir links externos como videoaulas próprias.
- [ ] Verificar contagens, campos, links, resposta correta e limites de acesso. Publicar somente após disponibilidade da UI.

## Task 4 — Validação e entrega
- [ ] Executar npm run check, smoke, SEO, study e novo lab; revisar diff.
- [ ] PR, CI verde, merge autorizado, sincronização Lovable, deploy único e leitura da versão real.
- [ ] Conferir recursos publicados com backend simulado e informar limites; relatório e evidências.

## Baseline e decisões
171 testes passaram antes da alteração. Diretório isolado usa junction para node_modules existente, sem reinstalar por espaço limitado no PC. Progresso das missões vem do banco, nunca de assistir um vídeo externo. As referências podem ser úteis em contas sem acesso ao curso, mas isso não concede leitura das aulas protegidas.

## Ledger da execução
- Curadoria: 9 vídeos (2 PT, 7 EN), 11 repositórios; 20 endpoints de referência conferidos, com uma URL 404 corrigida.
- Código/UI: implementados e verificados. Oito cenários de navegador passaram; dados e identidades simulados.
- Banco: curso adicional em rascunho com 12 entradas, 24 prompts, 11 quizzes e 44 questões; 465 minutos estimados. Digests de aulas/quizzes anteriores iguais.
- Qualidade local: 182 testes, TypeScript/build, smoke/SEO/estudo e laboratório aprovados; 37 avisos de lint anteriores.
- Publicação, revisão do PR e confirmação do domínio ainda serão registradas na entrega final.
