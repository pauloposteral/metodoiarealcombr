# Método IA Real — expansão e SEO, 20/10/2026

## Escopo e base
Base revisada: c9bab99d38359362ef16848a93e757111f70a0dd. Implementação incremental, mantendo currículo principal, progresso, preços e pagamentos. Este documento registra o estado validado antes da publicação; a homologação pública deve ser registrada separadamente.

## Código e recursos
- Login por e-mail e senha visível na abertura, usando Supabase Auth existente; recuperação acessível e erros preservam os campos.
- Copy comercial ligada às entregas comprovadas; retiradas as promessas universais de renda/prazo e o parcelamento não homologado. Preço-base de R$ 497 preservado.
- 13 guias gratuitos originais com HTML estático, exemplos, modelos e checklists para download. Nenhum corpo de aula paga foi publicado no Git.
- Hub /aprender, metadados centralizados, canonical, sitemap de 16 URLs, dados estruturados sem avaliações inventadas e noindex em entradas privadas.
- Materiais passam a consultar registros reais, com busca e estados de carregamento, erro e vazio. Os registros devem ser publicados após comprovar os arquivos no domínio final.
- Lockfile reconciliado com package.json; atualização pontual de source-map-js para 1.2.2.

## Banco de produção
Snapshot privado de rollback: private.content_revision_snapshots, revisão 2026-10-20-content-seo-before. Contém conteúdo e definições afetadas, não dados pessoais. É uma cópia no mesmo banco, não prova de backup externo ou restauração de desastre.
- Prévia gratuita agora restrita aos módulos 0/1 da formação principal; cursos e aulas explicitamente gratuitos continuam acessíveis.
- O curso de criação de conteúdo recebeu 12 aulas originais (10 textos e dois projetos), 10 quizzes de quatro perguntas e 24 prompts dentro das aulas. IDs determinísticos e escrita idempotente.
- Validação estrutural: 12 aulas, cada corpo com mais de 4.500 caracteres, dois prompts por aula, quizzes com quatro opções e resposta válida, sem ordens duplicadas. Duração cadastrada: 344 minutos; estimativa, não medição de tempo de todos os alunos.
- Total após gravação: 178 aulas, 122 quizzes e 15 projetos. As 166 aulas anteriores mantiveram seus corpos de texto sem alteração. 40 continuam arquivadas.
- O curso novo fica despublicado até a etapa final de liberação. Não afirmar que já está visível antes dessa confirmação.

## Evidências executadas
- npm run check: exit 0; TypeScript aprovado, 153 testes passam, build aprovado.
- ESLint: zero erros e 37 avisos existentes, não desativados.
- Navegador Chromium/Edge em 390 e 1440 px: login e senha visíveis, erros tratados, campos preservados, canonical/description únicos, recuperação e noindex, guia legível, download local real, sem overflow ou exceções nos cenários.
- Testes de credenciais inválidas usam resposta simulada. Não comprovam compra, login válido de aluno, SMTP, reembolso ou emissão real de certificado.

## Dependências: risco residual explícito
A consulta npm audit --omit=dev após atualizar source-map-js reporta sete ocorrências: cinco altas e duas moderadas, concentradas na cadeia de ferramentas CSS/glob (braces, chokidar, micromatch, fast-glob, Tailwind 3 e parser CSS). Não equivalem a sete explorações demonstradas no site. O projeto gera frontend estático; não foi observada uma API de produção que receba padrões de glob ou seletores de terceiros para essas ferramentas. Não foi forçada migração incompatível para Tailwind 4 apenas para zerar o relatório.
- braces <=3.0.3: advisory sem versão corrigida na consulta. https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- postcss-selector-parser: correção disponível em 7.1.6; dependência herdada da cadeia de build requer atualização compatível. https://github.com/advisories/GHSA-rj75-hqrm-r3gf
- source-map-js: atualizado para 1.2.2. https://github.com/advisories/GHSA-68fv-2mgg-jv7q
Não usar esta entrega como certificação de ausência de vulnerabilidades.

## Infraestrutura e pesquisa
- Search Console: propriedade sc-domain:metodoiareal.com.br verificada como siteOwner e ativada no GSC Wizard. Palavras de marca e limites conservadores de rastreamento configurados.
- Cloudflare: zona ativa, Full (strict) observado. Os registros do Lovable estavam em DNS-only; não ativar proxy sobre o A 185.158.133.1. A configuração com proxy exige o CNAME e o modo compatível indicados pelo Lovable.
- Referência: https://docs.lovable.dev/features/custom-domain
- SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Context7 consultado para Cloudflare O2O/Full strict e Supabase Auth/RLS.

## Limites de conclusão
A revisão estrutural do acervo não é revisão factual linha a linha das 124 aulas principais. Não há prova de liderança nacional, de ranking no Google, de receita, de Core Web Vitals reais ou de uma biblioteca de videoaulas. Publicar e enviar sitemap não garantem indexação. Os resultados de produção devem ser lidos após o deploy, sem inferir sucesso a partir do build local.
