# Login, cadastro e acesso — auditoria + 30 melhorias em ondas

## O que foi confirmado
- A página inicial nova não tem nenhum botão "Entrar". Todos os botões (hero, oferta, barra fixa do celular) só abrem o checkout.
- A página inicial não verifica se a pessoa já está logada. Por isso, quem já tem acesso vê "comprar" de novo.
- A conta pauloposteral@hotmail.com existe, tem acesso **ativo** e é **admin**. Não tem pagamento registrado, porque o acesso foi liberado manualmente. Por isso, qualquer verificação baseada só em pagamento a trataria como "não comprou". A regra certa é usar o status de acesso.

## Onda 1 — Urgente (resolve o que você relatou)
1. Botão "Entrar" fixo no topo da landing, visível no celular e no computador.
2. A landing reconhece quem já está logado. O botão vira "Minha área", com seu nome ou foto.
3. Quem tem acesso ativo não vê mais "comprar". Os botões do hero, da oferta e da barra fixa viram "Continuar estudando" e levam para /membros.
4. Admin vê também um atalho "Painel admin".
5. Se alguém que já tem acesso abrir o checkout (por link direto ou /checkout), aparece "Você já tem acesso" com botão para a área do aluno, em vez do pagamento.
6. Enquanto a sessão carrega, os botões não piscam de "comprar" para "entrar".

## Onda 2 — Tela de login e cadastro
7. Revisar /auth: separar claramente as abas Entrar e Criar conta.
8. Mensagens de erro em português claro (senha errada, email não confirmado, email já cadastrado).
9. Aviso "confira seu email" depois do cadastro, com opção de reenviar.
10. Página /reset-password funcionando. Hoje o link de recuperação do Método aponta para /metodo/app.
11. Link "Esqueci a senha" em todas as telas de login.
12. Mostrar/ocultar senha e medidor de força.
13. Depois de logar, voltar para a página onde a pessoa estava.
14. Botão "Entrar com Google".

## Onda 3 — Acesso e segurança
15. Uma única regra de acesso para o site inteiro: status ativo ou admin (hook compartilhado).
16. Tela clara para acesso pendente ou bloqueado, com contato de suporte.
17. Proteção contra senhas vazadas ativada.
18. Sair em todos os dispositivos, no perfil.
19. Trocar a senha pedindo a senha atual.
20. Registro de último acesso visível para o admin.

## Onda 4 — Compra e pós-compra
21. Depois do pagamento, liberar o acesso automaticamente e levar direto para a área do aluno.
22. Se a pessoa comprar deslogada, criar ou vincular a conta pelo email da compra.
23. Página "Obrigado" com botão "Acessar agora" já logado.
24. Corrigir o PIX, que hoje é concluído sem identificar o plano.
25. Admin consegue liberar ou revogar acesso com um clique na lista de usuários.

## Onda 5 — Acabamento e experiência
26. Boas-vindas personalizadas no primeiro login.
27. Menu do usuário na landing (Minha área, Perfil, Sair).
28. No celular, a barra fixa mostra "Continuar" para alunos.
29. Teste automático dos fluxos em modo anônimo, com os papéis deslogado, aluno e admin, no celular e no computador.
30. Evento de análise para login, cadastro e "já tem acesso", para medir conversão.

## Como vou executar
- Uma onda por vez. Mostro o que mudou e espero seu "APROVADO" antes da próxima.
- As alterações são cirúrgicas: não mexo no visual cinematográfico nem nos vídeos.

## Detalhes técnicos
- Novo `useAccess()`: sessão via `onAuthStateChange` + `profiles.access_status` + `has_role(admin)`. Retorna `{ status: 'loading'|'guest'|'member'|'admin'|'blocked' }`.
- LandingCinema: renderizar CTAs condicionalmente por status; link Entrar → `/auth?redirect=/`.
- CheckoutDialog / Checkout.tsx: curto-circuito para quem já é membro.
- Auth.tsx: aceitar `redirect` na query string; `enable_email_auth` + Google via `configure_social_auth`; `configure_auth` com HIBP.
- Rota pública `/reset-password` com `updateUser({ password })`.
