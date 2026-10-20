# Método IA Real — Laboratório V3

Base: f69a8b6fbdfb55ae8ad5417472dd7c254a888cfd. Data editorial: 20/10/2026. Continuação solicitada pelo proprietário: ensinar o fluxo real de construção de aplicativos e melhorar a experiência com referências de GitHub, YouTube, Context7, Firecrawl, Superpowers e Canva.

## Entrega de produto

Nova área `/membros/laboratorio`, acessível pelo menu e pela página de cursos. Três ambientes: Jornada, Vídeos e Código. A jornada consulta curso e progresso reais; a próxima aula depende de acesso e conclusão existentes, não de um contador artificial. O erro de catálogo tem tentativa de recuperação e não bloqueia a consulta das referências.

A identidade existente foi preservada: azul-noite, dourado, tipografia do aplicativo e Realis. A imagem oficial foi otimizada de 1.636.858 bytes para WebP de 32.356 bytes, sem gerar um personagem concorrente. Não foram adicionadas dependências de interface ou vídeo.

A videoteca possui busca, filtros de tema e idioma, autoria, duração, data e atividade original em português. O player só monta após a ação específica “Carregar vídeo do YouTube”. Não há requisições a YouTube/ytimg nem thumbnails remotos antes dessa ação. Fechar remove o iframe; reabrir requer nova ativação. O player usa youtube-nocookie sem autoplay e oferece o link original. Isso reduz carregamento antecipado; não significa ausência de tratamento de dados pelo serviço após ativação.

## Conteúdo original adicional

Curso: **Laboratório: do briefing ao aplicativo publicado**, slug `laboratorio-apps-ia`. Estrutura independente, sem alterar as 124 aulas e o certificado da formação principal. As 178 entradas e 122 quizzes existentes foram comparados por digest antes/depois das inserções e permaneceram iguais.

| Missão | Aulas |
|---|---|
| Descobrir | Problema e briefing; pesquisa com Context7, Firecrawl e GitHub |
| Desenhar | Identidade e acessibilidade; PRD com dados, estados e critérios |
| Construir | Agentes, TDD e versões; autenticação, autorização e RLS |
| Integrar | IA e automações com limites; pagamentos e e-mails com prova |
| Publicar | Testes no navegador; domínio, Cloudflare e SEO verificáveis |
| Operar | Manutenção e distribuição nativa; projeto final com evidências |

São **11 aulas textuais e 1 projeto**, 24 prompts, 11 quizzes/44 questões e **465 minutos (7h45) estimados de estudo e prática**. A coluna de horas do catálogo arredonda para uma casa decimal. Cada entrada possui exercício, fontes e pelo menos 4.090 caracteres. Tempo estimado não é duração de vídeo nem promessa universal de execução. O projeto final usa uma rubrica de autoavaliação, sem criar nota ou certificado automático.

Os textos pagos ficam somente no banco. O repositório contém metadados de referências públicas, código e evidências fictícias de interface. Manifesto privado `private.ia_real_lab_releases`, chave `2026-10-20-v3`, registra os digests e a publicação. O curso começa em rascunho e só será publicado depois de confirmar a entrega da interface. A confirmação final de publicação será registrada no PR.

## Curadoria audiovisual

Nove vídeos, **dois com áudio em português e sete em inglês**. Autoria preservada, sem download, reupload ou transcrição integral. A revisão desta entrega cobre identidade, descrição, idioma, duração, data, playability e resposta oEmbed; não representa assistir e revisar integralmente cada vídeo. Conteúdos antigos trazem aviso explícito sobre menus, versões e planos.

| ID YouTube | Canal | Áudio | Referência |
|---|---|---|---|
| mUZOySyVcuQ | Curso em Vídeo | Português | Você sabe usar Issues? |
| 0g_43SQtR0M | Canva Brasil | Português | Branding pessoal no Canva |
| rqvtLxwMklo | Lovable | Inglês | Master Lovable In 24 Minutes |
| i_bPeTZVlg0 | Supabase | Inglês | Getting Started with Supabase |
| Ow_Uzedfohk | Supabase | Inglês; legenda PT identificada | Authorization / RLS |
| BQrohJ3PT7I | GitHub | Inglês | GitHub Actions for Beginners |
| 4BVTkqbn_tY | n8n | Inglês | Introduction to Automation |
| y_cpFMF1pzk | n8n | Inglês | APIs and Webhooks |
| QHNVPlxpqKw | Canva | Inglês | Conteúdo acessível |

Os nove endpoints oEmbed responderam 200 e forneceram iframe. Isso não garante reprodução integral em todo dispositivo, região ou contexto. A alternativa de abrir no YouTube permanece visível. Referências externas não são contabilizadas como videoaulas produzidas pelo Método IA Real.

## Código de referência

Onze repositórios verificados: obra/superpowers, upstash/context7, firecrawl/firecrawl, shadcn-ui/ui, supabase/supabase, microsoft/playwright, stripe-samples/checkout-one-time-payments, resend/resend-node, cloudflare/workers-sdk, ionic-team/capacitor e n8n-io/n8n. Foram registradas licença e cautelas, sem comandos de instalação automática. n8n é rotulado source-available com restrições e componentes Enterprise; Firecrawl indica AGPL-3.0. Licença identificada não é parecer jurídico de reuso.

A checagem de links encontrou uma URL antiga de licença do n8n com 404. Ela foi substituída pelo arquivo LICENSE.md do repositório oficial, confirmado 200. As 20 verificações HTTP/oEmbed estão no relatório `reference-http-checks.json`, incluindo o histórico da correção.

## Design e ferramentas

O storyboard existente no Canva (`DAHYjxJ74Uo`, 16 páginas) foi localizado e inspecionado para continuidade da marca. Uma proposta on-brand foi preparada no widget do Canva; sua geração exige confirmação no próprio widget e não é declarada concluída por este documento. O aplicativo foi implementado no código existente, não pela conversão automática de slides em produto.

A busca de plugins não retornou um conector exato Design Partner. Nenhuma revisão foi atribuída a ele. Context7 foi usado para consultar Playwright e Supabase; Firecrawl para busca e metadados YouTube; GitHub para fontes e licenças; Superpowers orientou plano, testes e verificação.

## Verificação e limites

Baseline: 171 testes. Novos contratos de catálogo e mensagem de conclusão foram observados falhando antes da implementação. A confirmação final inclui a suíte completa e oito cenários de laboratório: 360/390/768/1440px, curso ausente, acesso bloqueado, visitante e falha do catálogo.

Os testes autenticados usam identidades e dados fictícios, interceptando banco, autenticação e player externo. Verificam progresso exibido conforme fixture, pesquisa, idioma, nenhuma requisição YouTube antecipada, fechamento/reabertura, ausência de autoplay, nenhuma escrita de progresso e ausência de overflow. Não equivalem a compra real, entrega de e-mail, reprodução real de cada vídeo ou autenticação de um aluno real.

O novo teste integra o CI junto dos testes de estudo, SEO e smoke anteriores. A mensagem ao terminar um curso adicional não sugere emissão automática do certificado principal. O fluxo e critérios do certificado principal permanecem inalterados.

## Pendências que esta entrega não encobre

- Revisão factual individual de todas as aulas anteriores ainda não concluída.
- Homologação de compra, e-mail e acesso com contas reais continua separada.
- Produção de videoaulas próprias em português ainda não realizada.
- Cloudflare raiz/www continuam DNS-only; nenhuma migração de proxy foi feita aqui.
- Exceção temporária de braces no build permanece documentada, com vencimento em 03/11/2026; não foi renovada. Não declarar audit completo sem achados.
- A ampliação não comprova o título de maior curso do Brasil nem justifica uma nota global de 100%.

## Reversão

Reverter o commit remove a nova interface sem apagar conteúdo/progresso. O curso adicional pode ser despublicado preservando IDs e entregas. Não remover tabelas, usuários, compras ou tentativas para desfazer esta publicação. O manifesto privado permite verificar que as entradas anteriores não foram reescritas.

## Resultado local confirmado antes do PR

`npm run check` passou: 182 testes, zero falhas, TypeScript e build aprovados; lint com zero erros e 37 avisos existentes. Smoke anterior, SEO e estudo passaram. Os oito cenários do laboratório também passaram. Um teste de captura precisou aguardar o fechamento efetivo do diálogo antes de buscar o título fora dele; a sincronização foi corrigida e a bateria foi repetida, sem alteração de autorização ou conteúdo. O CI ainda será confirmado no PR antes do merge.
