# Implantação e operação

Esta entrega prepara correções; nenhuma migração, função ou alteração de frontend foi publicada em produção durante a auditoria.

## 1. Acessos e cópias de segurança

O plugin Supabase foi conectado durante a auditoria, mas as ações de consulta/exportação não ficaram disponíveis ao executor. Retome em uma sessão que exponha essas ações e confirme o projeto correto antes de exportar. A URL pública e a chave anon do frontend não permitem um backup administrativo. Não envie senhas por chat nem as registre no Git.

Com cliente PostgreSQL compatível e `SUPABASE_DB_URL` definida em um ambiente privado:

```bash
./scripts/backup-db.sh /caminho/privado/backups
```

O script cria um dump customizado, índice e checksum com permissões restritas. Execute uma restauração em um banco descartável compatível e confira contagens por tabela antes de considerá-lo um backup validado. Schemas/roles gerenciados, extensões, Auth, URLs de redirecionamento, SMTP e configurações do projeto precisam ser reconciliados com o Supabase de destino. `--no-owner --no-acl` torna necessária a revisão dos grants no destino.

O dump não contém os bytes do Storage. Exporte separadamente todos os buckets/objetos com credenciais administrativas, registre caminhos, metadados, tamanhos e checksums e valide amostras restauradas. Não coloque dados de clientes ou dumps no repositório público.

## 2. Configurações

Use `.env.example` para o frontend e `supabase/functions/.env.example` como inventário de configurações **do servidor**.

| Configuração | Uso |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Injetadas pelo Supabase nas funções hospedadas; separar projetos de teste e produção |
| `APP_ORIGIN` | Origem HTTPS aprovada para retorno do checkout e portal; padrão `https://metodoiareal.com.br` |
| `STRIPE_SECRET_KEY` | Chave do ambiente correto; testar primeiro no modo de teste |
| `STRIPE_WEBHOOK_SECRET` | Segredo de assinatura do endpoint, obrigatório |
| `GREENN_WEBHOOK_SECRET` | Segredo aleatório com pelo menos 32 caracteres, obrigatório |
| `GREENN_PRODUCT_IDS` | IDs exatos dos produtos Greenn autorizados a liberar o curso |
| `LOVABLE_API_KEY` | Chave do gateway de IA, somente no servidor |
| `SCRAPE_ALLOWED_HOSTS` | Restrição opcional por hostname exato para extração de páginas |
| `VITE_WHATSAPP_NUMBER` | Número real com DDI, apenas dígitos; vazio usa o e-mail de contato existente |
| `VITE_META_PIXEL_ID`, `VITE_GA_MEASUREMENT_ID` | Analytics opcionais, ativados após consentimento |

Confirme na conta Stripe os cinco preços permitidos em `_shared/billing.ts` e a configuração dos planos em `plans`. São os IDs já presentes no projeto, não preços de teste criados nesta auditoria. O curso avulso usa `mode=payment`; os planos usam `mode=subscription`.

O token Greenn é recebido por `?token=...` na URL de webhook ou pelo header `x-webhook-token` de um adaptador controlado. Isso é um contrato desta implementação, não uma afirmação de que a Greenn emite esse header nativamente. Configure o envio antes da troca de endpoint, masque o token nos logs de acesso e teste um payload real. Restrinja os IDs de produto. Não publique a URL com token.

Configure no Supabase Auth a URL do site e o retorno `/auth?recovery=1`. Valide confirmação de e-mail e SMTP. Novos compradores Greenn recebem uma senha aleatória não exposta; definem a própria senha pela recuperação. Esta versão não presume nem implementa envio automático de boas-vindas.

## 3. Homologação e migrações

1. Faça backup e compare schema/histórico de produção com o Git. Os testes locais modelam Auth/Storage, não reproduzem toda a infraestrutura Supabase.
2. Aplique em homologação as três novas migrações `20260924000000`, `20260924000001`, `20260924000002` na ordem. Elas restringem RLS, acrescentam pagamentos avulsos, cotas e RPCs, e movem pontuação, provas e certificados para validação no servidor.
3. O ajuste na migração histórica `20260718162552` apenas evita um seed vinculado a um curso inexistente durante reconstrução vazia. Não reaplique essa migração em produção; preserve o histórico já aplicado. Se ela ainda estiver pendente no destino, revise seu conteúdo, pois o seed original transforma dados de curso.
4. Reconcilie concessões históricas `profiles.access_status='active'` com pagamentos e concessões administrativas. O default anterior liberava novas contas. As migrações preservam esses registros porque revogá-los indiscriminadamente prejudicaria compradores legítimos.
5. Confira `course_payments`, `subscriptions` e `purchases`. Compras antigas não são recriadas automaticamente: os metadados e registros precisam ser conciliados com os provedores.
6. Faça deploy das Edge Functions com os segredos configurados, depois do banco. O `verify_jwt=false` de endpoints no config permite webhooks e validação dentro do handler; endpoints de usuário agora verificam o token com `auth.getUser`, enquanto webhooks validam assinatura/segredo próprios.
7. Publique o frontend depois das funções/RPCs. Regenere os tipos Supabase a partir do schema homologado e compare com os tipos locais.

## 4. Aceite necessário antes da produção

- Signup, confirmação de e-mail, login, logout e recuperação pelo link real.
- Contas gratuita, paga, revogada, admin e de duas empresas distintas.
- Checkout avulso e assinatura; duplicação, atraso e reordenação de webhook; renovação, cancelamento, reembolso e disputa.
- Greenn: pagamento, tentativa repetida, reembolso, produto fora da lista e token inválido.
- Quotas e pagamentos por uso do gateway de IA; erro, timeout e falta de crédito.
- Upload e download do próprio usuário; tentativa de acesso a arquivos e dados alheios.
- Liberação real do curso, conteúdo privado, notas, prova, certificado e funcionalidades administrativas.
- Restauração validada do dump e do Storage; alertas de erro e responsável pelo acompanhamento.

## 5. Limites e manutenção

As rotas de IA autenticadas compartilham limites de proteção de 60 requisições/hora e 200/dia por conta. Sandbox exige acesso pago; Pro e curso avulso têm 50/dia, Premium não tem cota adicional de plano, mantendo os limites gerais. As janelas iniciam na primeira chamada e solicitações aceitas pela guarda consomem a cota mesmo se o provedor falhar. O playground público tem 5/minuto por identificador de IP e teto global de 100/dia. O cabeçalho de IP deve ser validado no gateway; o teto global protege o custo mesmo quando ele não for confiável.

Defina retenção e limpeza periódica dos contadores expirados em `private.ai_quotas`, eventos, sessões e dados pessoais. Monitore respostas 429/5xx e entregas falhas de webhook. Revise os custos antes de ampliar limites.

A extração de URLs bloqueia redes privadas/literais, checa DNS e revalida redirects. A separação entre consulta DNS e conexão ainda exige proteção de saída na infraestrutura ou uma allowlist confiável contra DNS rebinding. Não existe garantia completa de SSRF apenas com essa checagem.

Certificados validam o progresso registrado pelo aluno; o player ainda permite marcar uma aula concluída. Quizzes são material didático e enviam respostas para feedback no cliente. Não são avaliação fiscalizada nem prova de tempo efetivo de estudo.

Os 37 avisos de lint restantes exigem revisão de dependências de hooks e organização de exports. Não foram ocultados por desativação de regras. Otimize imagens/vídeo/fontes, valide WCAG e meça Core Web Vitals em condições reais.

## 6. Recuperação

Mantenha o commit anterior e um backup verificado. Em caso de falha do frontend, publique novamente o artefato anterior enquanto mantém as novas restrições de acesso; verifique sua compatibilidade com as RPCs. Para falhas de banco, use uma correção progressiva revisada ou restaure o backup em ambiente separado e valide antes de trocar o tráfego. Não reabra as políticas vulneráveis como solução rápida. Reprocesse eventos dos provedores a partir de um intervalo conhecido após estabilizar o serviço.
