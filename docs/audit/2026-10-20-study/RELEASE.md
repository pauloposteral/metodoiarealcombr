# Método IA Real — navegação de estudo e revisão editorial

Base: `79ab90612578ea886a79a628947388a9661823b5`. Continuação solicitada pelo proprietário em 20/10/2026.

## Intenção e limites

Facilitar o estudo do conteúdo existente sem apagar aulas, mudar IDs, recalcular notas, enviar projetos automaticamente ou substituir autenticação/pagamento. A navegação deve oferecer Entender, Ver, Fazer e Revisar apenas quando existe um destino real. Todos os componentes de aula permanecem montados para preservar rascunhos, respostas e estado de interface.

Três alternativas foram consideradas: dividir a aula em telas, duplicar resumos em abas ou navegar pelas seções existentes. Foi escolhida a terceira: menor risco de perda de conteúdo/estado e permite evolução posterior sem reescrever o renderizador. Esta entrega é navegação progressiva, não um novo motor de curso ou uma obrigação de cumprir etapas.

## Implementação

- `studyOutline.ts` usa o parser Markdown existente e seus IDs estáveis. Identifica explicação, exemplo/código/tabela/vídeo válido, exercício/projeto/prompts e resumo/revisão.
- `StudyNavigator` usa botões acessíveis, foco no destino e movimento reduzido quando solicitado. Não salva progresso nem chama APIs.
- `LessonPlayer` mantém texto, notas, quizzes, sandbox, projeto e conclusão. Os novos wrappers identificam os destinos, sem desmontá-los.
- Aulas sem vídeo não ganham um player fictício. Aulas sem exemplo ou exercício exibem somente etapas pertinentes.
- O teste autenticado simulado revelou overflow de 24px em 768px, originado pelo campo de busca de largura fixa junto da barra lateral. O breakpoint foi corrigido, a coluna flex pode encolher e a busca compacta ganhou nome acessível.

## Evidência antes/depois

Baseline: 159 testes passaram. Os 12 testes do novo mapeamento produziram 11 falhas e 1 sucesso antes da implementação. Depois, 171 testes passaram, zero falhas.

O navegador testa 360, 390, 768 e 1440px. Verifica quatro destinos reais, teclado/foco, rascunho preservado, nenhum envio/conclusão/nota automático, ausência de vídeo inexistente e overflow. Cenários adicionais: aula mínima, projeto e conteúdo bloqueado. A falha de 768px foi reproduzida, diagnosticada por geometria e corrigida; a repetição passou.

**Importante:** os testes da área autenticada usam usuário, sessão e dados inteiramente fictícios; requisições externas são interceptadas. Não equivalem à homologação de compra, login de aluno real, recuperação por e-mail ou certificação em produção. Os screenshots deste diretório são fixtures, não conteúdo pago.

## Revisão editorial aplicada no banco

Revisão `2026-10-20-v2` em `private.ia_real_editorial_revisions`, com snapshots antes da escrita, transação e comparação de hashes. A tabela tem RLS e não permite SELECT a anon/authenticated.

| Aula | Correção principal | Caracteres antes/depois |
|---|---|---|
| MOD-08 — Publicação e domínio próprio | Registrador versus DNS autoritativo; DNS-only versus proxy; teste/rollback e preservação de dados; HTTPS não certifica o aplicativo | 6.935 / 8.731 |
| MOD-09 — Automação x agente | Regras com condições; diferenças de cobrança entre n8n, Zapier e Make; memória opcional; agente não obrigatório para pergunta variável | 8.827 / 10.672 |
| MOD-11 — SEO e busca com IA | Descoberta/indexação/posição; sitemap sem garantia; noindex não é autenticação; elegibilidade real do Perfil da Empresa | 9.235 / 11.932 |

Três quizzes/12 questões foram alinhados mantendo os índices das respostas corretas. Os prompts relevantes foram corrigidos. Comparação de estrutura confirmou IDs, ordem, tipo, módulos e campos não editoriais inalterados. As 138 aulas ativas e os 13 materiais continuam existentes. Não houve escrita em progresso, tentativas, compras ou usuários.

A revisão dessas três aulas não certifica a atualidade factual de todas as outras 121 aulas principais. Conteúdo pago e snapshots não são publicados neste repositório.

## Fontes primárias consultadas

- https://docs.lovable.dev/features/custom-domain
- https://developers.cloudflare.com/dns/proxy-status/
- https://docs.n8n.io/flow-logic/
- https://n8n.io/pricing/
- https://help.make.com/credits
- https://help.zapier.com/hc/en-us/articles/8496196837261-How-is-task-usage-measured-in-Zapier
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://support.google.com/business/answer/13763036?hl=pt-BR
- https://support.google.com/business/answer/3038177?hl=pt-BR

## Cloudflare e segurança

Full (strict) e Search Console estavam configurados na entrega anterior. Nesta continuação foi inspecionado o caminho de proxy suportado pelo Lovable, sem desconectar o domínio principal. O formulário de um hostname de teste não foi concluído: nenhum novo domínio ou DNS foi aplicado. Root/www continuam DNS-only. Não anunciar CDN/cache/WAF da zona como ativos.

A exceção temporária de dependência de build documentada em `docs/SECURITY-BUILD-EXCEPTION.md` continua separada desta mudança, expira em 03/11/2026 e não foi renovada. Nenhuma dependência foi adicionada.

## Reversão

Reverter o commit desta interface restaura a navegação anterior sem modificar os dados. As alterações editoriais podem ser restauradas seletivamente a partir dos snapshots da revisão v2, após conferir que não houve nova edição. Nunca restaurar tabelas inteiras ou remover progresso para reverter uma aula.
