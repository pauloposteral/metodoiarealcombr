
# Plano: Reestruturar Curso para os 13 Módulos do PRD

## Objetivo
Alinhar o curso "Método IA Real — Fundamentos" com a estrutura MOD-00 a MOD-12 do PRD, **preservando 100% das aulas já cadastradas** e criando os módulos que faltam (vazios, prontos para receber conteúdo).

## Estado Atual (auditado)

**Curso principal:** `Método IA Real — Fundamentos` (`0ddb2e14…`)

**8 módulos órfãos** (sem `course_id`) contêm ~35 aulas. **3 módulos** já estão no curso principal mas com nomes desalinhados. Vou consolidar tudo dentro do curso principal.

### Mapeamento módulo atual → módulo PRD

| Módulo atual (aulas)                    | Vira no PRD                          | Ação                     |
|-----------------------------------------|--------------------------------------|--------------------------|
| O que é IA e por que importa (3)        | MOD-01 Fundamentos: como a IA pensa  | Renomear + reordenar     |
| Fundamentos da IA (4) [órfão]           | MOD-01 (mesclar com o de cima)       | Fundir em MOD-01         |
| Dominando Prompts (2)                   | MOD-02 Engenharia de Prompt          | Renomear                 |
| Prompts que Funcionam (6) [órfão]       | MOD-02 (mesclar)                     | Fundir em MOD-02         |
| Ferramentas Essenciais (5) [órfão]      | MOD-01 (aulas viram sub-tópicos)     | Migrar aulas p/ MOD-01   |
| IA para Conteúdo (5) [órfão]            | MOD-11 IA para negócios e conteúdo   | Renomear + reordenar     |
| IA para Negócios (5) [órfão]            | MOD-11 (mesclar)                     | Fundir em MOD-11         |
| Produtividade com IA (3) [órfão]        | MOD-10 IA no trabalho: produtividade | Renomear                 |
| IA como Renda Extra (4) [órfão]         | MOD-12 Monetização                   | Renomear                 |
| O Jogo é Mental (3) [órfão]             | MOD-12 (mesclar como aulas finais)   | Fundir em MOD-12         |
| IA na Prática Profissional (0)          | descartar (vazio, redundante)        | Deletar módulo vazio     |

### Módulos NOVOS a criar (vazios, `is_published=false`)

- **MOD-00** — Comece por aqui (Onboarding)
- **MOD-03** — ChatGPT do zero ao avançado
- **MOD-04** — Claude do zero ao avançado
- **MOD-05** — Gemini e ecossistema Google
- **MOD-06** — Imagem: do prompt à arte profissional
- **MOD-07** — Vídeo, voz e música
- **MOD-08** — ⭐ Lovable: primeiro app sem código
- **MOD-09** — Automações e agentes

Total final: **13 módulos** (MOD-00 a MOD-12) no curso `Método IA Real — Fundamentos`.

## Ordem de Execução (uma migração SQL única)

```text
1. UPDATE modules SET course_id = <curso principal> nos 8 órfãos que serão preservados
2. UPDATE modules SET title = 'MOD-01 Fundamentos: como a IA pensa', order_index = 1
   nos módulos que viram MOD-01, MOD-02, MOD-10, MOD-11, MOD-12
3. Para fusões: UPDATE lessons SET module_id = <módulo destino>, reindexar order_index;
   depois DELETE do módulo agora vazio
4. DELETE módulo "IA na Prática Profissional" (0 aulas)
5. INSERT dos 8 módulos novos (MOD-00, 03, 04, 05, 06, 07, 08, 09) com is_published=false,
   description do PRD, order_index correto
6. Ajustar order_index final de todos os 13 módulos (0..12)
```

## Prefixo dos títulos

Todos os módulos vão receber prefixo `MOD-XX ` no `title` para bater com o PRD e facilitar navegação:
- `MOD-00 Comece por aqui`
- `MOD-01 Fundamentos: como a IA pensa`
- ... até `MOD-12 Monetização: os 5 caminhos`

## Fora de escopo (não faço agora)

- **Não** crio aulas novas dentro dos módulos vazios — o próprio admin (`/admin/cursos`) já permite adicionar aulas depois.
- **Não** mexo em `courses` "IA para Criação de Conteúdo" nem "Introdução à IA — Gratuito" (ficam como estão).
- **Não** implemento trilhas (fica para próxima rodada com o quiz).
- **Não** mexo em UI/código — só reorganizo dados. A área de membros já lê `modules ORDER BY order_index` corretamente.

## Arquivos afetados

- Nenhum arquivo de código. Só 1 migração SQL.

## Riscos / Reversibilidade

- Todas as operações são idempotentes por ID de módulo (não deleto aulas, só remapeio `module_id`).
- Antes da migração rodar, você aprova o SQL. Se algo estiver errado, posso reverter em outra migração.
