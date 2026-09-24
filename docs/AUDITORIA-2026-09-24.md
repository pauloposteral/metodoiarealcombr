# Auditoria técnica — Método IA Real

Data: 24/09/2026. Repositório: [pauloposteral/metodoiarealcombr](https://github.com/pauloposteral/metodoiarealcombr).

**Nota inicial: 21/100. Nota da entrega corrigida: 79/100. Produção ainda não homologada.**

As notas são uma avaliação técnica interna de prontidão, com a mesma rubrica antes/depois; não são uma certificação, probabilidade de segurança, percentual de cobertura de testes ou garantia de ausência de defeitos. Não seria correto declarar “100% perfeito” sem acesso ao banco real, às integrações e à operação.

## Escopo e origem

O código e o histórico Git foram baixados integralmente. A avaliação inicial partiu de `7f4e8a69e07dc6a65e0d8cd38f32695886e1ab07`. Durante o trabalho, a `main` recebeu a atualização `91ab0a9e46812c70394921b91f66ce4f0bd020d2`; suas mudanças de autenticação no preview e tipos foram incorporadas à entrega.

Foram examinados a arquitetura React, autenticação, rotas, fronteiras de acesso, políticas SQL, 14 Edge Functions, pagamentos Stripe/Greenn, geração de IA, upload, compartilhamento, provas/certificados, dependências, build e fluxos públicos em navegador. O histórico SQL original contém 24 migrações; esta entrega acrescenta três migrações e torna uma transformação de dados antiga condicionada à existência de seu curso de origem.

O exame combina revisão de código, análise de dependências, verificações TypeScript/ESLint, testes com PostgreSQL local e handlers reais com dependências simuladas. Não foi um pentest do site ao vivo, nem uma revisão manual de cada combinação visual ou de cada operação administrativa.

**Dados de produção não foram baixados.** O Git contém schema/migrações e seeds parciais, mas não contém usuários, compras, progresso, conteúdo criado no banco ou arquivos privados do Storage. O aplicativo confirmou a conexão do plugin Supabase durante a finalização, mas nenhuma ação de consulta SQL, inventário de projetos ou exportação foi exposta ao executor nesta sessão. A conexão foi reconhecida; acesso administrativo efetivo e backup não foram obtidos. Nenhuma modificação foi aplicada em produção.

## Rubrica de 0 a 100

| Área | Peso | Inicial | Corrigido | Justificativa e desconto restante |
| --- | ---: | ---: | ---: | --- |
| Segurança e controle de acesso | 20 | 3 | 16 | RLS, identidade, quotas e proteção de URLs corrigidas; faltam reconciliação de acessos históricos, validação no serviço real e barreira de rede para rebinding |
| Pagamentos e direitos de acesso | 15 | 3 | 12 | Assinatura, metadados, preço, idempotência e reembolso tratados; faltam segredos, eventos reais e conciliação histórica |
| Banco e integridade | 15 | 4 | 11 | Migrações reproduzíveis e regras no servidor; faltam dump, Storage, restauração e comparação do schema vivo |
| Qualidade do código | 10 | 4 | 9 | Tipos passam e nenhum erro de lint; permanecem 37 avisos de hooks/exports |
| Testes e regressões | 15 | 0 | 12 | 78 testes automatizados e 18 verificações de navegador; faltam integração Deno/Supabase real, fluxos autenticados completos e carga |
| Desempenho | 10 | 3 | 7 | Rotas sob demanda reduzem o arquivo de entrada; imagens, vídeo, fontes e métricas reais ainda precisam de otimização |
| Experiência e acessibilidade | 5 | 2 | 4 | Recuperação de senha, suporte, compartilhamento mobile e mensagens corrigidos; falta revisão WCAG completa |
| Reprodutibilidade e entrega | 5 | 1 | 5 | Lockfile, Node 24, comandos, testes, CI e guia de implantação incluídos |
| Operação e recuperação | 5 | 1 | 3 | Procedimento de backup/recuperação e limites documentados; faltam execução, alertas e comprovação do serviço real |
| **Total** | **100** | **21** | **79** | **Prontidão da entrega local; não representa estado já implantado** |

## Achados e correções

As severidades abaixo expressam impacto potencial observado no código. Não há evidência de exploração histórica e não foi verificada a política atualmente instalada em produção.

| ID | Severidade | Achado | Tratamento na entrega |
| --- | --- | --- | --- |
| A01 | Crítica | Stripe aceitava JSON sem assinatura quando a configuração estava ausente | Segredo e assinatura obrigatórios, verificação criptográfica e falha fechada |
| A02 | Crítica | Greenn aceitava eventos sem autenticação | Token obrigatório, lista de produtos, validação de payload e credenciais nunca registradas |
| A03 | Crítica | A policy de compras com nome “Service role” aplicava `USING true` a PUBLIC | Policy removida; anon sem acesso; escrita administrativa restrita |
| A04 | Alta | Conta podia receber acesso ativo por default e alterar o próprio acesso | Default `pending`, trigger impede autoelevação; ativos históricos preservados para conciliação |
| A05 | Alta | Endpoints de IA consumiam créditos sem autenticar | Verificação do usuário/e-mail, payload limitado e cotas atômicas compartilhadas |
| A06 | Alta | Extração de URL podia alcançar destinos internos | Protocolos/portas restritos, bloqueio de IPs privados, DNS, redirects e tamanho/tempo limitados; proteção de rede residual documentada |
| A07 | Alta | Checkout e webhook discordavam sobre preços, modo e identificação do comprador | Allowlist de preços, metadados coerentes, cliente associado e URLs de retorno controladas pelo servidor |
| A08 | Alta | Conflito SQL por `user_id` e período Stripe incompatível com Basil | Upsert por assinatura única, períodos por item, tratamento separado do curso avulso |
| A09 | Alta | Repetição/reordenação de eventos podia duplicar ou restaurar acesso indevido | Stripe consulta estado atual; Greenn aplica evento em transação com trava e comparação temporal |
| A10 | Alta | Reembolso/disputa não tinha revogação confiável do curso Stripe | Pagamentos avulsos registrados por sessão/intent/charge, com estado verificado; legado exige conciliação |
| A11 | Alta | RLS de equipe era recursiva e administrador de empresa alterava campos de cobrança | Função privada de associação, vínculo ao tenant de destino e proteção de plano/status/limites |
| A12 | Alta | Conteúdo pago dependia de bloqueio no navegador | Policies de aulas, materiais e quizzes usam direito de acesso verificado no banco |
| A13 | Alta | Compartilhamento público expunha linhas completas e permitia enumeração | RPC por identificador exato retorna somente slides/tema/tópico; comentários restritos ao dono |
| A14 | Alta | Upload podia usar o diretório de outro usuário | Policy exige o UUID autenticado no primeiro segmento do caminho |
| A15 | Alta | Pontuação, sequência de estudos, conquistas, notas e certificados eram manipuláveis pelo cliente | Cálculo e elegibilidade no banco; prova com tentativa idempotente; certificado com progresso e horas calculados |
| A16 | Alta | Dependências tinham 24 ocorrências vulneráveis, incluindo uma crítica | Lockfile atualizado, jsPDF/Vite/Router corrigidos; consulta final npm sem ocorrências conhecidas |
| A17 | Média | Não havia fluxo completo para definir nova senha após recuperação | Modo de atualização de senha e tratamento do evento de recuperação |
| A18 | Média | Callbacks de autenticação podiam bloquear chamadas e deixar estado de plano/acesso antigo | Verificação fora do callback, limpeza de estado e tratamento de erro |
| A19 | Média | Cadastro/setup administrativo público e página de cursos sem verificação adequada | Setup passa a login; acesso à administração de cursos exige papel admin |
| A20 | Média | CSV permitia interpretação de fórmulas e Markdown aceitava URLs executáveis | Sanitização de células e allowlist de protocolos |
| A21 | Média | Toda a aplicação era importada no carregamento inicial | Rotas com `React.lazy` e fallback; arquivo principal de JS reduzido |
| A22 | Média | Visitar `/obrigado` disparava compra fictícia e afirmava confirmação/e-mail enviado | Eventos não verificados removidos e mensagem condicional à confirmação real |
| A23 | Média | Suporte usava telefone fictício e carrossel cortava texto no celular | Número configurável com fallback de e-mail; canvas escalonado preservando proporção |
| A24 | Média | Migrações falhavam em banco vazio e não havia verificação automatizada | Seed específico condicionado, testes PostgreSQL e workflow CI |
| A25 | Média | Plano podia ser perdido na consulta Stripe após troca de e-mail | Consulta usa primeiro o vínculo de cliente salvo no banco |
| A26 | Alta | Conta gratuita podia chamar o Sandbox pago diretamente | Direito e cota do Sandbox verificados pelo servidor; limites divulgados na tela de planos |

## Evidências de validação

| Verificação | Antes | Depois |
| --- | --- | --- |
| Instalação reproduzível | `npm ci` concluído | Dependências fixadas em lockfile; Node 24 definido |
| TypeScript | Frontend passava; Edge sem gate próprio | Frontend, configuração e 14 funções Edge passam; Edge em modo estrito |
| ESLint | 189 erros e 37 avisos | 0 erros e 37 avisos; regras não desativadas |
| Dependências (`npm audit`) | 24: 1 crítica, 16 altas, 6 moderadas, 1 baixa | 0 vulnerabilidades reportadas na consulta desta auditoria |
| Testes automatizados | Sem suíte no repositório | 78 testes passam: validação, handlers e SQL |
| Navegador | Sem teste reproduzível | 18 cenários: 9 rotas em 1440 px e 390 px, sem exceções JS ou overflow horizontal nos cenários |
| Build de produção | Passava com entrada monolítica | Passa com rotas separadas |
| JS de entrada | 2.902,71 kB / gzip 822,79 kB | Aproximadamente 369,70 kB / gzip 120,40 kB |
| Segredos de alta confiança | Não havia evidência de varredura | Busca por assinaturas em 971 blobs textuais históricos de até 1,5 MB sem chave privada, token GitHub, chave Stripe ou JWT service-role detectados |

A redução aproximada de 87% se refere **somente ao arquivo JavaScript de entrada**, não ao total baixado pela home: chunks compartilhados e da rota ainda são carregados. Não foi medido Lighthouse nem Core Web Vitals em produção.

A varredura de segredos é limitada aos padrões descritos; não prova inexistência de credenciais. A chave anon histórica é pública por projeto e foi distinguida de service-role. A segurança do acesso depende das políticas do banco.

Os cenários do navegador são `/`, `/auth`, `/auth?recovery=1`, `/pricing`, `/checkout`, `/admin/setup`, `/membros`, `/preview/:shareId` e `/obrigado`. Verificam recuperação, preservação do formulário ao consentir, exibição da senha, redirecionamentos e navegação entre slides. Os serviços externos foram bloqueados/simulados; não houve cobrança nem envio de e-mail. Chromium 141 foi usado localmente porque o download do Chromium padrão mais novo falhou no ambiente. A CI está configurada para o navegador correspondente ao Playwright do lockfile.

Os testes de banco aplicam todo o histórico em PostgreSQL/PGlite, com schemas mínimos de Auth/Storage. Cobrem autoelevação, equipes, namespaces, direitos pagos/reembolso, compartilhamento, certificados, pontuação, streaks, provas, conquistas, cotas e repetição/reordenação Greenn. Os testes de handlers executam o código das funções com Stripe/Supabase simulados: eles não certificam deploy Deno ou credenciais reais.

Os logs selecionados estão em `docs/audit/`. As imagens de revisão são evidência do ambiente local com dados fictícios.

Uma checagem adicional, somente de leitura e sem solicitar linhas, consultou por `HEAD` a API pública de `purchases`, `profiles` e `saved_carousels`. As três responderam HTTP 200 com zero linhas visíveis ao papel anônimo. Isso não distingue tabelas vazias de filtragem por RLS e não confirma nem refuta a instalação das policies do Git. A checagem não fornece backup nem inventário administrativo.

## O que impede 100/100

1. **Supabase conectado, sem ações administrativas disponíveis nesta sessão:** obter dump e arquivos do Storage, validar restauração e comparar schema/permissões reais com as migrações.
2. **Integrações sem homologação:** configurar segredos, produtos e SMTP; executar pagamentos de teste, renovação, cancelamento, reembolso e disputa; confirmar entregas Greenn e gateway de IA.
3. **Acessos antigos:** reconciliar perfis ativos por default, concessões manuais e pagamentos históricos. Alterá-los automaticamente sem registros confiáveis poderia remover acesso legítimo.
4. **Limitações de produto e abuso:** quizzes continuam didáticos com feedback no cliente; conclusão de aula é autodeclarada. A comunidade não recebeu uma política antifraude completa. Rever também a promessa “3 aulas preview” frente à regra herdada de módulos 0/1 gratuitos, vagas de equipes e recursos comerciais que hoje dependem de apresentação no frontend.
5. **Infraestrutura e operação:** proteção de saída/allowlist para DNS rebinding, retenção de quotas/dados, alertas e processo de recuperação ainda devem ser instalados e comprovados.
6. **Qualidade restante:** 37 avisos de lint, revisão completa de acessibilidade, carga, dispositivos reais e otimização dos assets. O frontend mantém a configuração TypeScript permissiva herdada; o êxito de `tsc` não equivale a tipagem estrita integral.

A sequência de implantação e a lista de aceite estão em [IMPLANTACAO.md](IMPLANTACAO.md). A entrega deve passar por homologação antes de integrar a `main` e publicar.

## Referências técnicas consultadas

- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Supabase — Stripe webhooks em Edge Functions](https://supabase.com/docs/guides/functions/examples/stripe-webhooks).
- [Stripe — períodos por item na versão Basil](https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end).
- [Greenn — estrutura de webhook](https://ajuda.greenn.com.br/pt-br/article/documentacao-webhook-greenn-cbbxsl/).
- [Lovable — integração de IA](https://docs.lovable.dev/features/ai).
- [TanStack — adaptador Lovable](https://tanstack.com/ai/latest/docs/adapters/lovable).

Essas referências orientam os contratos técnicos. A prova de cada achado é o código original e a validação local, não a documentação externa.
