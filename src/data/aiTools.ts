/**
 * "Planilha viva" de ferramentas e custos (promessa da landing). Revisar a cada Radar IA.
 *
 * Revisão de 24/09/2026, feita só com _guia/FATOS-VERIFICADOS.md (sem nova consulta à web):
 * - Apenas os preços das ferramentas que têm `pricingUrl` (ChatGPT, Claude, Gemini e Microsoft 365)
 *   foram conferidos em fonte oficial nesta data. Valores em dólar convertidos com USD_BRL_REFERENCE
 *   e arredondados para o múltiplo de R$ 5 mais próximo, como nas aulas.
 * - Nas demais ferramentas, `lastVerified` significa "entrada revisada nesta data", e não preço
 *   conferido: nenhum preço ou limite é informado, e o aluno é mandado ao site oficial. Quando não há
 *   certeza de que existe opção gratuita, `freeTier` pede para conferir, e toda entrada sem preço
 *   conferido traz `freeAlternative`.
 * - Ordem: por categoria (na ordem de TOOL_CATEGORY_LABELS) e, dentro dela, por nome.
 */
export type ToolCategory =
  | 'assistente'
  | 'pesquisa'
  | 'imagem'
  | 'video'
  | 'voz-musica'
  | 'apps'
  | 'automacao'
  | 'produtividade';

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  assistente: 'Assistentes de IA',
  pesquisa: 'Pesquisa e estudo',
  imagem: 'Imagem e design',
  video: 'Vídeo',
  'voz-musica': 'Voz e música',
  apps: 'Criação de apps',
  automacao: 'Automação e agentes',
  produtividade: 'Produtividade no trabalho',
};

export interface AiToolPlan {
  /** Nome do plano como aparece no site, ex.: "Plus". */
  name: string;
  /** Preço como o site informa + conversão aproximada, ex.: "US$ 20/mês (cerca de R$ 105 + IOF)". */
  price: string;
  note?: string;
}

export interface AiTool {
  id: string;
  name: string;
  company: string;
  category: ToolCategory;
  /** Para que serve, em uma frase. */
  whatFor: string;
  /** O que o plano gratuito oferece, ou "Sem plano gratuito". */
  freeTier: string;
  plans: AiToolPlan[];
  /** Obrigatório quando não há plano gratuito útil (regra da escola). */
  freeAlternative?: string;
  /** Módulos onde a ferramenta é ensinada, ex.: ["MOD-03"]. */
  moduleCodes: string[];
  url: string;
  pricingUrl?: string;
  /** Data da última conferência dos preços (AAAA-MM-DD). */
  lastVerified: string;
}

/** Câmbio de referência usado nas conversões (sem IOF e spread do cartão). */
export const USD_BRL_REFERENCE = 5.2;
export const AI_TOOLS_UPDATED_AT = '2026-09-24';

/** Plano pago das ferramentas cujo preço não foi conferido nesta revisão. */
const UNVERIFIED_PLANS: AiToolPlan[] = [{ name: 'Planos pagos', price: 'Consulte o valor atual no site oficial' }];
const FREE_WITH_LIMITS = 'Tem opção gratuita com limites; confira no site oficial';
const CHECK_FREE_OPTION = 'Confira no site oficial se há opção gratuita';
const FREE_IMAGE_ALTERNATIVE = 'ChatGPT ou Gemini (Nano Banana) nos planos grátis, com limite de uso';
const FREE_VIDEO_ALTERNATIVE = 'Imagens geradas no ChatGPT ou no Gemini grátis, animadas e montadas no CapCut grátis';
const FREE_AVATAR_ALTERNATIVE = 'Gravar você mesmo no celular e editar no CapCut grátis';

export const AI_TOOLS: AiTool[] = [
  // ------------------------------------------------------------ Assistentes de IA
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    company: 'OpenAI',
    category: 'assistente',
    whatFor: 'Assistente de IA para escrever, resumir, analisar arquivos, pesquisar na web, conversar por voz e criar imagens.',
    freeTier: 'Plano Free com o modelo GPT-5.6 Luna (com o botão "Think"), Projetos, até 3 tarefas agendadas ativas e uso limitado do ChatGPT para Word, Excel e PowerPoint.',
    plans: [
      { name: 'Go', price: 'R$ 39,99/mês (preço de lançamento no Brasil)', note: 'Usa o mesmo modelo do Free, o GPT-5.6 Luna.' },
      { name: 'Plus', price: 'US$ 20/mês (cerca de R$ 105 + IOF)', note: 'Usa o GPT-5.6 Sol. O real está entre as moedas de cobrança local: confira o valor em reais antes de pagar.' },
      { name: 'Pro (5x o Plus)', price: 'US$ 100/mês (cerca de R$ 520 + IOF)', note: 'Cinco vezes o uso do Plus, com acesso ao GPT-6 Pro.' },
      { name: 'Pro (20x o Plus)', price: 'US$ 200/mês (cerca de R$ 1.040 + IOF)', note: 'Vinte vezes o uso do Plus, com o GPT-6 Pro. Novas assinaturas pausadas desde 10/09/2026.' },
      { name: 'Business', price: 'US$ 25 por pessoa/mês ou US$ 20 no plano anual (cerca de R$ 130 ou R$ 105 + IOF)', note: 'Mínimo de 2 pessoas. Inclui o GPT-6 Pro e não treina modelos com o conteúdo da empresa por padrão.' },
    ],
    moduleCodes: ['MOD-00', 'MOD-03', 'MOD-06', 'MOD-09', 'MOD-10'],
    url: 'https://chatgpt.com',
    pricingUrl: 'https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus',
    lastVerified: '2026-09-24',
  },
  {
    id: 'claude',
    name: 'Claude',
    company: 'Anthropic',
    category: 'assistente',
    whatFor: 'Assistente de IA forte em escrita, documentos longos e raciocínio, com Projects, criação de arquivos, Skills e conectores.',
    freeTier: 'Plano grátis com os modelos Sonnet e Haiku, até 5 Projects, Skills e conectores de Gmail, Agenda e Drive. O uso é limitado por janelas de 5 horas.',
    plans: [
      { name: 'Pro', price: 'US$ 20/mês ou US$ 17/mês no plano anual (cerca de R$ 105 ou R$ 90 + IOF)', note: 'Libera o Opus, conectores de outras empresas, conectores personalizados via MCP (beta), Claude in Chrome (beta) e Claude Code no app e na web. Os planos pagos também têm limite semanal.' },
      { name: 'Max (5x o Pro)', price: 'US$ 100/mês (cerca de R$ 520 + IOF)', note: 'Cinco vezes o uso do Pro.' },
      { name: 'Max (20x o Pro)', price: 'US$ 200/mês (cerca de R$ 1.040 + IOF)', note: 'Vinte vezes o uso do Pro.' },
      { name: 'Team Standard', price: 'US$ 25 por pessoa/mês ou US$ 20 no plano anual (cerca de R$ 130 ou R$ 105 + IOF)' },
      { name: 'Team Premium', price: 'US$ 125 por pessoa/mês ou US$ 100 no plano anual (cerca de R$ 650 ou R$ 520 + IOF)' },
      { name: 'Enterprise', price: 'Sob contrato' },
    ],
    moduleCodes: ['MOD-00', 'MOD-04', 'MOD-09'],
    url: 'https://claude.ai',
    pricingUrl: 'https://claude.com/pricing',
    lastVerified: '2026-09-24',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    company: 'Google',
    category: 'assistente',
    whatFor: 'Assistente de IA do Google, ligado ao Gmail, ao Docs e ao Drive, com Gems, Deep Research, Gemini Live e imagens com Nano Banana.',
    freeTier: 'Plano grátis com Deep Research, Gemini Live e Gems. Em contas pessoais, o Gmail já resume conversas em português.',
    plans: [
      { name: 'Google AI Plus', price: 'R$ 24,99/mês', note: 'No Brasil, libera o "Me ajude a escrever" do Gmail.' },
      { name: 'Google AI Pro', price: 'R$ 96,99/mês' },
      { name: 'Google AI Ultra', price: 'A partir de R$ 779,90/mês', note: 'Único plano com Deep Think e com o agente Gemini Spark (para maiores de 18 anos).' },
    ],
    moduleCodes: ['MOD-00', 'MOD-05', 'MOD-06', 'MOD-09', 'MOD-10'],
    url: 'https://gemini.google.com',
    pricingUrl: 'https://gemini.google/br/subscriptions/?hl=pt-BR',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Pesquisa e estudo
  {
    id: 'gemini-notebook',
    name: 'Gemini Notebook (antigo NotebookLM)',
    company: 'Google',
    category: 'pesquisa',
    whatFor: 'Caderno de pesquisa que responde com base nas fontes que você envia, com citações, mapas mentais e resumos em áudio e vídeo. Mudou de nome em 16/07/2026.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Projects do Claude (até 5 no plano grátis) ou Projetos do ChatGPT, com os seus arquivos de referência',
    moduleCodes: ['MOD-00', 'MOD-05'],
    url: 'https://notebooklm.google.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    company: 'Perplexity',
    category: 'pesquisa',
    whatFor: 'Buscador com IA que responde citando as fontes, útil para pesquisa rápida e para conferir informações.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Deep Research do Gemini, incluído no plano grátis',
    moduleCodes: ['MOD-00', 'MOD-10'],
    url: 'https://www.perplexity.ai',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Imagem e design
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    company: 'Adobe',
    category: 'imagem',
    whatFor: 'Gerador e editor de imagens da Adobe, presente também no Photoshop, para quem já trabalha com as ferramentas da marca.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Edição de imagem por conversa no ChatGPT ou no Gemini (Nano Banana), nos planos grátis, com limite de uso',
    moduleCodes: ['MOD-06'],
    url: 'https://firefly.adobe.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'canva',
    name: 'Canva',
    company: 'Canva',
    category: 'imagem',
    whatFor: 'Editor de design online com recursos de IA, onde a peça final ganha texto, fontes e diagramação.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'O próprio plano grátis do Canva, com a imagem gerada no ChatGPT ou no Gemini grátis',
    moduleCodes: ['MOD-06'],
    url: 'https://www.canva.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'flux',
    name: 'Flux',
    company: 'Black Forest Labs',
    category: 'imagem',
    whatFor: 'Família de modelos de imagem que aparece integrada a vários sites e aplicativos, além do site da própria empresa.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_IMAGE_ALTERNATIVE,
    moduleCodes: ['MOD-06'],
    url: 'https://bfl.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    company: 'Ideogram',
    category: 'imagem',
    whatFor: 'Gerador de imagens que nasceu com foco em texto dentro da imagem, útil para capas, cartazes e posts.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Imagem gerada no ChatGPT ou no Gemini grátis, com o texto montado no Canva grátis',
    moduleCodes: ['MOD-06'],
    url: 'https://ideogram.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'leonardo',
    name: 'Leonardo',
    company: 'Leonardo.Ai',
    category: 'imagem',
    whatFor: 'Plataforma de geração e edição de imagens com vários modelos e estilos prontos, usada para ilustrações, personagens e fotos de produto.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_IMAGE_ALTERNATIVE,
    moduleCodes: ['MOD-06'],
    url: 'https://leonardo.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    company: 'Midjourney',
    category: 'imagem',
    whatFor: 'Gerador de imagens de estética marcante, com controle fino por parâmetros e referências de estilo. A V8 é a versão atual, e a V8.1 está em alfa.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_IMAGE_ALTERNATIVE,
    moduleCodes: ['MOD-06'],
    url: 'https://www.midjourney.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'recraft',
    name: 'Recraft',
    company: 'Recraft',
    category: 'imagem',
    whatFor: 'Ferramenta de imagem voltada a design gráfico, como ilustrações, ícones, vetores e peças de marca.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Conceitos de logo e ícones no ChatGPT ou no Gemini grátis, finalizados no Canva grátis',
    moduleCodes: ['MOD-06'],
    url: 'https://www.recraft.ai',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Vídeo
  {
    id: 'capcut',
    name: 'CapCut',
    company: 'ByteDance',
    category: 'video',
    whatFor: 'Editor de vídeo para celular e computador, com recursos de IA, para montar cenas, legendar e exportar no formato de cada rede.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Descript no plano grátis',
    moduleCodes: ['MOD-07'],
    url: 'https://www.capcut.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'descript',
    name: 'Descript',
    company: 'Descript',
    category: 'video',
    whatFor: 'Editor de vídeo e áudio em que você corta o material apagando palavras da transcrição, bom para podcasts e vídeos falados.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'CapCut no plano grátis',
    moduleCodes: ['MOD-07'],
    url: 'https://www.descript.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'hailuo',
    name: 'Hailuo',
    company: 'MiniMax',
    category: 'video',
    whatFor: 'Gerador de vídeo que cria cenas curtas a partir de um texto ou de uma imagem.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_VIDEO_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://hailuoai.video',
    lastVerified: '2026-09-24',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    company: 'HeyGen',
    category: 'video',
    whatFor: 'Cria vídeos com avatares e apresentadores digitais e traduz vídeos com dublagem, sempre com o consentimento de quem aparece.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_AVATAR_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://www.heygen.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'kling',
    name: 'Kling',
    company: 'Kuaishou',
    category: 'video',
    whatFor: 'Gerador de vídeo a partir de texto ou imagem, citado entre os mais usados em comparativos de mercado de 2026.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_VIDEO_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://klingai.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'runway',
    name: 'Runway',
    company: 'Runway',
    category: 'video',
    whatFor: 'Plataforma de vídeo com IA para gerar cenas a partir de texto ou imagem e editar com efeitos.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_VIDEO_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://runwayml.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'seedance',
    name: 'Seedance (Dreamina)',
    company: 'ByteDance',
    category: 'video',
    whatFor: 'Modelo de vídeo da ByteDance, usado na plataforma Dreamina, que gera cenas a partir de texto ou imagem.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_VIDEO_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://dreamina.capcut.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    company: 'Synthesia',
    category: 'video',
    whatFor: 'Cria vídeos com avatares apresentadores a partir de um texto, muito usada em treinamentos e comunicados de empresas.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_AVATAR_ALTERNATIVE,
    moduleCodes: ['MOD-07'],
    url: 'https://www.synthesia.io',
    lastVerified: '2026-09-24',
  },
  {
    id: 'veo-flow',
    name: 'Veo e Flow',
    company: 'Google',
    category: 'video',
    whatFor: 'Veo é o modelo de vídeo do Google, usado no app do Gemini e no Flow, a ferramenta de cenas do Google Labs; o Veo 3.1 aparece entre os mais usados em comparativos de 2026.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: FREE_VIDEO_ALTERNATIVE,
    moduleCodes: ['MOD-05', 'MOD-07'],
    url: 'https://labs.google',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Voz e música
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    company: 'ElevenLabs',
    category: 'voz-musica',
    whatFor: 'Voz com IA para narração, dublagem e efeitos sonoros, com clonagem de voz só com consentimento do dono da voz.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Gravar a narração com a sua própria voz no celular e ajustar o áudio no CapCut grátis',
    moduleCodes: ['MOD-07'],
    url: 'https://elevenlabs.io',
    lastVerified: '2026-09-24',
  },
  {
    id: 'suno',
    name: 'Suno',
    company: 'Suno',
    category: 'voz-musica',
    whatFor: 'Cria músicas completas, com letra, voz e arranjo, a partir de uma descrição; confira nos termos se o seu plano permite uso comercial.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Biblioteca de músicas do CapCut grátis, conferindo a licença de cada faixa',
    moduleCodes: ['MOD-07'],
    url: 'https://suno.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'udio',
    name: 'Udio',
    company: 'Udio',
    category: 'voz-musica',
    whatFor: 'Gera músicas a partir de uma descrição; confira os termos atuais antes de publicar ou usar comercialmente.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Suno no plano grátis',
    moduleCodes: ['MOD-07'],
    url: 'https://www.udio.com',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Criação de apps
  {
    id: 'bolt',
    name: 'Bolt',
    company: 'StackBlitz',
    category: 'apps',
    whatFor: 'Cria apps e sites a partir de uma conversa, direto no navegador.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Lovable no plano grátis, a ferramenta do MOD-08',
    moduleCodes: ['MOD-08'],
    url: 'https://bolt.new',
    lastVerified: '2026-09-24',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    company: 'Lovable',
    category: 'apps',
    whatFor: 'Cria apps completos a partir de conversa; a versão 2.0 trouxe o Lovable Cloud, com banco de dados, login e armazenamento integrados.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Bolt, v0 ou Replit, nos planos grátis',
    moduleCodes: ['MOD-08'],
    url: 'https://lovable.dev',
    lastVerified: '2026-09-24',
  },
  {
    id: 'replit',
    name: 'Replit',
    company: 'Replit',
    category: 'apps',
    whatFor: 'Ambiente online para criar e publicar apps, com um agente de IA que escreve e testa o código.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Lovable no plano grátis, a ferramenta do MOD-08',
    moduleCodes: ['MOD-08'],
    url: 'https://replit.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    company: 'Supabase',
    category: 'apps',
    whatFor: 'Banco de dados, login e armazenamento de arquivos para apps, com regras de acesso aos dados.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Planilha Google, para guardar os dados de um protótipo simples sem login',
    moduleCodes: ['MOD-08'],
    url: 'https://supabase.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'v0',
    name: 'v0',
    company: 'Vercel',
    category: 'apps',
    whatFor: 'Ferramenta da Vercel que cria telas e apps web a partir de conversa.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Lovable no plano grátis, a ferramenta do MOD-08',
    moduleCodes: ['MOD-08'],
    url: 'https://v0.app',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Automação e agentes
  {
    id: 'make',
    name: 'Make',
    company: 'Make',
    category: 'automacao',
    whatFor: 'Plataforma visual de automação que liga apps em cenários, passo a passo, inclusive com etapas de IA.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Zapier no plano grátis ou n8n auto-hospedado',
    moduleCodes: ['MOD-09'],
    url: 'https://www.make.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'n8n',
    name: 'n8n',
    company: 'n8n',
    category: 'automacao',
    whatFor: 'Plataforma de automação por fluxos visuais, com nós de IA e agentes, que roda na nuvem da empresa ou no seu próprio servidor.',
    freeTier: 'Tem opção gratuita com limites (a versão auto-hospedada, instalada no seu próprio servidor); confira no site oficial',
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Make ou Zapier nos planos grátis',
    moduleCodes: ['MOD-09'],
    url: 'https://n8n.io',
    lastVerified: '2026-09-24',
  },
  {
    id: 'whatsapp-business-platform',
    name: 'WhatsApp Business Platform',
    company: 'Meta',
    category: 'automacao',
    whatFor: 'Caminho oficial da Meta para ligar o WhatsApp da empresa a sistemas, automações e IA, direto pela API ou por um provedor parceiro.',
    freeTier: CHECK_FREE_OPTION,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Aplicativo WhatsApp Business, gratuito, com respostas rápidas, mensagens de saudação e de ausência e uma pessoa respondendo',
    moduleCodes: ['MOD-09'],
    url: 'https://business.whatsapp.com',
    lastVerified: '2026-09-24',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    company: 'Zapier',
    category: 'automacao',
    whatFor: 'Automação sem código que liga milhares de apps, com etapas de IA e agentes.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Make no plano grátis ou n8n auto-hospedado',
    moduleCodes: ['MOD-09'],
    url: 'https://zapier.com',
    lastVerified: '2026-09-24',
  },

  // ------------------------------------------------------------ Produtividade no trabalho
  {
    id: 'fireflies',
    name: 'Fireflies',
    company: 'Fireflies.ai',
    category: 'produtividade',
    whatFor: 'Assistente de reuniões que grava, transcreve e resume chamadas, com a lista de próximos passos.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'tl;dv ou Otter nos planos grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://fireflies.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'gamma',
    name: 'Gamma',
    company: 'Gamma',
    category: 'produtividade',
    whatFor: 'Cria apresentações, documentos e páginas a partir de um texto ou de um tema.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'ChatGPT para PowerPoint (uso limitado no plano grátis) ou Canva grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://gamma.app',
    lastVerified: '2026-09-24',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365 (planos pessoais)',
    company: 'Microsoft',
    category: 'produtividade',
    whatFor: 'Word, Excel, PowerPoint e Outlook com os recursos de IA do Copilot, nos planos para uso pessoal e familiar.',
    freeTier: CHECK_FREE_OPTION,
    plans: [
      { name: 'Personal', price: 'R$ 51,00/mês ou R$ 509,00/ano' },
      { name: 'Family', price: 'R$ 60,00/mês ou R$ 599,00/ano', note: 'Os recursos de IA valem só para o titular da assinatura.' },
      { name: 'Premium', price: 'R$ 109,00/mês ou R$ 1.089,00/ano' },
    ],
    freeAlternative: 'ChatGPT para Word, Excel e PowerPoint, com uso limitado no plano grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://www.microsoft365.com',
    pricingUrl: 'https://www.microsoft.com/pt-br/microsoft-365-copilot/pricing/individuals',
    lastVerified: '2026-09-24',
  },
  {
    id: 'microsoft-365-copilot',
    name: 'Microsoft 365 Copilot (empresas)',
    company: 'Microsoft',
    category: 'produtividade',
    whatFor: 'IA do Copilot no Word, no Excel, no PowerPoint, no Outlook e no Teams, usada com a conta corporativa da empresa.',
    freeTier: 'Copilot Chat sem custo adicional para quem usa conta corporativa do Microsoft 365',
    plans: [
      { name: 'Microsoft 365 Copilot', price: 'R$ 171,80 por pessoa/mês no plano anual', note: 'A função COPILOT do Excel foi descontinuada em 14/09/2026.' },
    ],
    moduleCodes: ['MOD-10'],
    url: 'https://www.microsoft365.com',
    pricingUrl: 'https://www.microsoft.com/pt-br/microsoft-365-copilot/pricing/enterprise',
    lastVerified: '2026-09-24',
  },
  {
    id: 'otter',
    name: 'Otter',
    company: 'Otter.ai',
    category: 'produtividade',
    whatFor: 'Transcrição e notas de reuniões com resumo automático; confira se o português é suportado antes de adotar.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'tl;dv ou Fireflies nos planos grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://otter.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'read-ai',
    name: 'Read.ai',
    company: 'Read AI',
    category: 'produtividade',
    whatFor: 'Assistente de reuniões que transcreve, resume e mede o engajamento das chamadas.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'tl;dv ou Fireflies nos planos grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://www.read.ai',
    lastVerified: '2026-09-24',
  },
  {
    id: 'tldv',
    name: 'tl;dv',
    company: 'tl;dv',
    category: 'produtividade',
    whatFor: 'Grava, transcreve e resume reuniões do Google Meet, do Zoom e do Teams, com trechos marcados para rever depois.',
    freeTier: FREE_WITH_LIMITS,
    plans: UNVERIFIED_PLANS,
    freeAlternative: 'Fireflies ou Otter nos planos grátis',
    moduleCodes: ['MOD-10'],
    url: 'https://tldv.io',
    lastVerified: '2026-09-24',
  },
];
