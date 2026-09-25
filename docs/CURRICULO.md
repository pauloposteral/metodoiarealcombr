# Currículo: como o conteúdo entra na plataforma

O conteúdo das aulas é o produto pago. Por isso ele **não fica neste repositório**, que é público. Aqui ficam só as ferramentas que validam, empacotam e importam o conteúdo.

## Onde fica cada coisa

| Peça | Onde | Público? |
| --- | --- | --- |
| Aulas em Markdown (13 módulos) | pasta privada `curso/` (entregue fora do Git) | Não |
| Pacote de importação `.json` | gerado a partir da pasta privada | Não |
| Validador e gerador | `scripts/curriculum/` | Sim |
| Esquema do pacote | `src/lib/curriculumPack.ts` | Sim |
| Importação no banco | RPCs `admin_import_curriculum_module` e `admin_finalize_curriculum_import` (migração `20260925000000_curriculum_platform.sql`) | Sim |
| Tela de importação | `/admin/cursos` → "Importar currículo" | Sim |

## Fluxo de publicação

1. Aplique a migração `20260925000000_curriculum_platform.sql` (depois das três de `20260924`).
2. Valide o conteúdo: `node scripts/curriculum/validate.mjs --src <pasta privada>/curso`. O resultado precisa ter 0 erro.
3. Gere o pacote: `node scripts/curriculum/build-pack.mjs --src <pasta privada>/curso --out <arquivo>.json`.
4. Entre como administrador em `/admin/cursos`, clique em "Importar currículo", escolha o `.json`, confira o resumo e clique em importar. A tela envia um módulo por vez e depois finaliza.
5. Confira em `/membros/cursos` com uma conta paga e com uma conta gratuita.

A importação pode ser repetida sem duplicar nada. Os IDs de módulos, aulas e quizzes são determinísticos (UUID v5 a partir do slug). Ela nunca altera `video_url`, então os vídeos cadastrados depois continuam no lugar.

Na primeira importação, as aulas antigas do curso que não estão no pacote vão para o módulo despublicado "Arquivo — aulas da versão anterior". O progresso dos alunos nessas aulas é preservado.

## Revisão de 90 dias e Radar IA

1. Edite a aula na pasta privada.
2. Atualize `updated:` no cabeçalho.
3. Valide, gere o pacote e importe de novo.

O selo "Atualizado em" das aulas vem desse campo. Quando os 90 dias passam, a plataforma mostra "em revisão".

## Regras de acesso

- **Módulos 00 e 01:** abertos para contas gratuitas logadas. As demais aulas exigem acesso pago.
- **Outline:** `get_course_outline` mostra os títulos de todas as aulas a qualquer aluno logado, nunca o conteúdo, e marca o que está liberado.
- **Certificado:** exige 75% das aulas da trilha escolhida em `/membros/trilha` (ou das 13 na Formação completa) e o projeto final do MOD-12 concluído e entregue no campo "Entregar projeto". Enquanto o currículo novo não for importado, vale a regra antiga (100% das aulas).
