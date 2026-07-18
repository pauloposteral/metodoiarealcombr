
-- ========================================
-- Reestruturar curso "Método IA Real — Fundamentos" nos 13 módulos do PRD
-- ========================================

-- 1. Assignar curso principal aos módulos órfãos que serão preservados
UPDATE public.modules SET course_id = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7'
WHERE id IN (
  '87cc8d43-235a-4ab7-aa20-6442d95619da', -- Fundamentos da IA (funde MOD-01)
  '2e6fc6de-5284-4cc4-b71f-939420d471a8', -- Ferramentas Essenciais (funde MOD-01)
  'c51df6d0-fe88-451e-aed6-16f6459cced9', -- Prompts que Funcionam (funde MOD-02)
  'dac35d45-a8e4-4ac4-9cd7-5c4a8619ef9d', -- IA para Conteúdo (vira MOD-11)
  '7ba94d29-3082-4a72-b871-1a074c84a2b4', -- IA para Negócios (funde MOD-11)
  'ceff4d7e-cbd4-41c4-9c4a-b3f159c50b23', -- Produtividade (vira MOD-10)
  'b476ea7c-5287-41b3-a99d-3a98ee8389f4', -- Renda Extra (vira MOD-12)
  'b12c53a7-c209-4235-9efa-3bb8e1b19c40'  -- O Jogo é Mental (funde MOD-12)
);

-- 2. Migrar aulas dos módulos que serão fundidos para os módulos-destino
-- Offset order_index em +100 para garantir que aulas migradas fiquem após as originais

-- MOD-01 destino: c23619f9 (recebe aulas de 87cc8d43 e 2e6fc6de)
UPDATE public.lessons SET module_id = 'c23619f9-b2f2-41ae-9dc3-fe5189551a00',
  order_index = order_index + 100
WHERE module_id = '87cc8d43-235a-4ab7-aa20-6442d95619da';

UPDATE public.lessons SET module_id = 'c23619f9-b2f2-41ae-9dc3-fe5189551a00',
  order_index = order_index + 200
WHERE module_id = '2e6fc6de-5284-4cc4-b71f-939420d471a8';

-- MOD-02 destino: 842c2bf2 (recebe aulas de c51df6d0)
UPDATE public.lessons SET module_id = '842c2bf2-3d89-495e-8983-8fb69e4bbc98',
  order_index = order_index + 100
WHERE module_id = 'c51df6d0-fe88-451e-aed6-16f6459cced9';

-- MOD-11 destino: dac35d45 (recebe aulas de 7ba94d29)
UPDATE public.lessons SET module_id = 'dac35d45-a8e4-4ac4-9cd7-5c4a8619ef9d',
  order_index = order_index + 100
WHERE module_id = '7ba94d29-3082-4a72-b871-1a074c84a2b4';

-- MOD-12 destino: b476ea7c (recebe aulas de b12c53a7)
UPDATE public.lessons SET module_id = 'b476ea7c-5287-41b3-a99d-3a98ee8389f4',
  order_index = order_index + 100
WHERE module_id = 'b12c53a7-c209-4235-9efa-3bb8e1b19c40';

-- 3. Deletar módulos agora vazios (funditos + o vazio "IA na Prática Profissional")
DELETE FROM public.modules WHERE id IN (
  '87cc8d43-235a-4ab7-aa20-6442d95619da',
  '2e6fc6de-5284-4cc4-b71f-939420d471a8',
  'c51df6d0-fe88-451e-aed6-16f6459cced9',
  '7ba94d29-3082-4a72-b871-1a074c84a2b4',
  'b12c53a7-c209-4235-9efa-3bb8e1b19c40',
  'b6a29bed-2ea4-4089-86d0-62cc613891bf'  -- IA na Prática Profissional (0 aulas)
);

-- 4. Renomear + reordenar os 5 módulos preservados
UPDATE public.modules SET
  title = 'MOD-01 Fundamentos: como a IA pensa',
  description = 'Como a IA funciona sem matemática: LLMs, tokens, alucinação, multimodal e o mapa dos modelos (GPT, Claude, Gemini). Ética e uso comercial na prática.',
  order_index = 1
WHERE id = 'c23619f9-b2f2-41ae-9dc3-fe5189551a00';

UPDATE public.modules SET
  title = 'MOD-02 Engenharia de Prompt',
  description = 'A habilidade-mãe da IA: anatomia do prompt perfeito, frameworks, few-shot, cadeia de prompts, meta-prompt e sua biblioteca pessoal.',
  order_index = 2
WHERE id = '842c2bf2-3d89-495e-8983-8fb69e4bbc98';

UPDATE public.modules SET
  title = 'MOD-10 IA no trabalho: produtividade 10×',
  description = 'E-mail, escrita, Excel/Sheets, apresentações, reuniões e pesquisa profunda. Kit pessoal de produtividade implantado e medido em horas/semana.',
  order_index = 10
WHERE id = 'ceff4d7e-cbd4-41c4-9c4a-b3f159c50b23';

UPDATE public.modules SET
  title = 'MOD-11 IA para negócios e conteúdo',
  description = 'Máquina de conteúdo com sua voz, copy que vende, atendimento, SEO, pesquisa de mercado e proposta comercial com IA.',
  order_index = 11
WHERE id = 'dac35d45-a8e4-4ac4-9cd7-5c4a8619ef9d';

UPDATE public.modules SET
  title = 'MOD-12 Monetização: os 5 caminhos do dinheiro com IA',
  description = 'Valorizar seu emprego, freela, agência enxuta, produto próprio e aplicar no próprio negócio. Portfólio e plano de 30 dias.',
  order_index = 12
WHERE id = 'b476ea7c-5287-41b3-a99d-3a98ee8389f4';

-- 5. Criar os 8 módulos novos vazios (is_published=false para não confundir alunos)
INSERT INTO public.modules (course_id, title, description, order_index, is_published) VALUES
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-00 Comece por aqui (Onboarding)',
    'Aluno ambientado, contas criadas, trilha definida. Vitória no dia 1: setup completo + comparação da mesma pergunta em 3 IAs.',
    0, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-03 ChatGPT do zero ao avançado',
    'Interface, memória, Projetos, análise de arquivos, imagem, voz, Deep Research, GPTs personalizados e introdução ao Sora.',
    3, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-04 Claude do zero ao avançado',
    'Projects, Artifacts, documentos gigantes, estilos com sua voz, Claude Code para não-programadores e conectores (MCP).',
    4, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-05 Gemini e o ecossistema Google',
    'Gemini app, integração com Gmail/Docs/Sheets, NotebookLM, AI Studio, Deep Research, Nano Banana e Veo.',
    5, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-06 Imagem: do prompt à arte profissional',
    'Midjourney, GPT Image, Ideogram, Flux, edição por instrução, consistência de personagem, identidade visual de marca e direitos comerciais.',
    6, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-07 Vídeo, voz e música',
    'Veo, Sora, Kling, Runway, HeyGen, Synthesia, ElevenLabs e Suno. Fluxo completo: roteiro → cenas → montagem → legendas.',
    7, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-08 ⭐ Lovable: seu primeiro app sem código',
    'Do prompt ao app em 30 minutos: banco de dados, login, IA dentro do app, publicação com domínio, debug e custos reais.',
    8, false),
  ('0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
    'MOD-09 Automações e agentes',
    'n8n, Make, Zapier, WhatsApp + IA, agentes de múltiplas etapas e quando NÃO automatizar. 1 automação real rodando.',
    9, false);
