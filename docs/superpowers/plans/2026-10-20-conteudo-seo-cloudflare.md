# Método IA Real — conteúdo, SEO e infraestrutura

Data: 20/10/2026. Base: c9bab99d38359362ef16848a93e757111f70a0dd. Branch isolada.

## Invariantes
Preservar IDs, progresso, 124 aulas principais, 40 aulas arquivadas, preços cobrados, pagamentos e autenticação existente. Não publicar texto pago no Git público. Os novos checklists são recursos gratuitos, não a reprodução das aulas. Não anunciar liderança nacional, renda ou avaliações sem comprovação. Não alterar contas de outros produtos nem contratar planos. Não ativar proxy no A do Lovable sem configurar o modo suportado e testar a origem.

## Entregas
1. Reparar lockfile incompatível, mantendo dependências declaradas.
2. Restringir preview gratuito à formação principal, sem abrir automaticamente os primeiros módulos de qualquer curso pago.
3. Criar 13 checklists originais gratuitos e downloads reais.
4. Fazer a página de materiais consumir registros reais, com busca e estados honestos.
5. Publicar hub de aprendizagem com HTML estático, canonical, títulos únicos, sitemap e links internos; nenhuma aula paga no HTML público.
6. Aplicar noindex a autenticação, administração, área do aluno e URLs sem conteúdo indexável.
7. Colocar login visível na abertura com a autenticação atual e retirar promessas comerciais não comprovadas.
8. Preencher dois módulos vazios do curso de criação de conteúdo: 12 aulas, 10 quizzes e dois projetos. Preservar certificado principal.
9. Auditar estruturalmente o acervo completo e revisar afirmações temporais de maior risco; não confundir cobertura estrutural e factual.
10. Configurar Cloudflare dentro das permissões e do contrato Lovable, com backup e rollback. Verificar propriedade GSC antes de enviar sitemap.

## Validação
Baseline: npm ci falhou por lockfile; reparo mínimo realizado; 145 testes existentes passam e TypeScript passa.
RED: reprodução de preview em outro curso pago; sitemap/canonicals inexistentes.
GREEN: suíte completa, TypeScript, lint, build e navegador desktop/mobile.
Publicar após revisão do diff, rechecagem de main e confirmação do deploy. Banco: escrita aditiva/idempotente em transações, com snapshot dos registros afetados.

## Limitações verificadas
GSC conectado não lista o domínio; adicionar sem propriedade verificada foi recusado. Cloudflare: zona ativa, A e www DNS-only em 185.158.133.1; token Wrangler permite Workers, mas recusa DNS/settings/rulesets. Painel do proprietário acessível. Aulas sem video_url não serão anunciadas como videoaulas.

## Consolidação
Mantidos HeroLogin e RouteSEO como componentes canônicos da implementação encontrada na retomada. Removidos apenas InlineSignIn e RouteMetadata redundantes desta continuação; metadados duplicados eliminados. A verificação adicional preserva os testes de H1, erros, inputs e recuperação.
