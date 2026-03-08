import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ==========================================
// CAROUSEL ENGINE vNext - ADVANCED AI MOTOR
// ==========================================

interface CarouselConfig {
  objective: string;
  audience: {
    level: string;
    niche: string;
    tone: string;
  };
  format: {
    width: number;
    height: number;
    slideCount: number;
    style: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, config, topic, slides, slideIndex, improvementAction, targetLang, voicePerson, userPrompt, textContent, dataPoints, rssUrl, threadText } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result;

    switch (action) {
      case 'generate-ideas':
        result = await generateIdeas(LOVABLE_API_KEY, topic, config);
        break;
      case 'generate-hooks':
        result = await generateHooks(LOVABLE_API_KEY, topic, config);
        break;
      case 'generate-carousel':
        result = await generateFullCarousel(LOVABLE_API_KEY, topic, config);
        break;
      case 'improve-slide':
        result = await improveSlide(LOVABLE_API_KEY, slides, slideIndex, improvementAction);
        break;
      case 'quality-check':
        result = await qualityCheck(LOVABLE_API_KEY, slides, config);
        break;
      case 'generate-caption':
        result = await generateCaption(LOVABLE_API_KEY, topic, slides);
        break;
      case 'generate-hashtags':
        result = await generateHashtags(LOVABLE_API_KEY, topic, config);
        break;
      case 'rewrite-carousel':
        result = await rewriteCarousel(LOVABLE_API_KEY, slides, config, topic);
        break;
      case 'translate-carousel':
        result = await translateCarousel(LOVABLE_API_KEY, slides, targetLang || 'en');
        break;
      case 'ab-hooks':
        result = await generateABHooks(LOVABLE_API_KEY, topic, config);
        break;
      case 'suggest-ideas':
        result = await suggestIdeasByNiche(LOVABLE_API_KEY, config);
        break;
      case 'detect-cliches':
        result = await detectCliches(LOVABLE_API_KEY, slides);
        break;
      case 'suggest-cta':
        result = await suggestCTA(LOVABLE_API_KEY, topic, config);
        break;
      case 'readability-score':
        result = await readabilityScore(LOVABLE_API_KEY, slides);
        break;
      case 'suggest-emojis':
        result = await suggestEmojis(LOVABLE_API_KEY, slides);
        break;
      case 'refine-prompt':
        result = await refinePrompt(LOVABLE_API_KEY, userPrompt, config);
        break;
      case 'generate-variations':
        result = await generateVariations(LOVABLE_API_KEY, topic, config);
        break;
      case 'rewrite-voice':
        result = await rewriteVoice(LOVABLE_API_KEY, slides, voicePerson);
        break;
      case 'sequence-psychology':
        result = await sequencePsychology(LOVABLE_API_KEY, slides, config);
        break;
      case 'suggest-posting-time':
        result = await suggestPostingTime(LOVABLE_API_KEY, config);
        break;
      case 'generate-alt-text':
        result = await generateAltText(LOVABLE_API_KEY, slides);
        break;
      case 'summarize-to-carousel':
        result = await summarizeToCarousel(LOVABLE_API_KEY, textContent, config);
        break;
      case 'thread-to-carousel':
        result = await threadToCarousel(LOVABLE_API_KEY, threadText, config);
        break;
      case 'data-storytelling':
        result = await dataStorytelling(LOVABLE_API_KEY, dataPoints, topic, config);
        break;
      case 'detect-language':
        result = await detectLanguageAndAdapt(LOVABLE_API_KEY, slides);
        break;
      case 'podcast-to-carousel':
        result = await podcastToCarousel(LOVABLE_API_KEY, textContent, config);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Carousel Engine error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ==========================================
// IdeaRank - Generate and rank carousel ideas
// ==========================================
async function generateIdeas(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um estrategista de conteúdo viral para Instagram. 
Gere 5 ideias de carrossel rankeadas por potencial viral.

Para cada ideia, avalie de 0-100:
- curiosidade: quão intrigante é
- clareza: quão fácil de entender
- relevancia: quão útil para o público
- potencialSalvamento: probabilidade de salvar
- potencialCompartilhamento: probabilidade de compartilhar
- potencialComentario: probabilidade de comentar

Objetivo: ${config.objective}
Público: ${config.audience.level} - ${config.audience.niche || 'geral'}
Tom: ${config.audience.tone}

Responda APENAS com JSON:
{
  "ideas": [
    {
      "id": "uuid",
      "title": "título da ideia",
      "score": 85,
      "factors": {
        "curiosidade": 90,
        "clareza": 85,
        "relevancia": 80,
        "potencialSalvamento": 88,
        "potencialCompartilhamento": 82,
        "potencialComentario": 75
      },
      "reasoning": "Por que essa ideia é boa"
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema base: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return {
    ideas: content.ideas.map((idea: any) => ({
      ...idea,
      id: crypto.randomUUID(),
    })),
  };
}

// ==========================================
// HookLab - Generate hook variations
// ==========================================
async function generateHooks(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um copywriter especialista em hooks virais para Instagram.
Crie 5 variações de capa/hook para um carrossel.

Tipos de hook:
- curiosidade: gera vontade de saber mais
- contraste: antes/depois, errado/certo
- erro-comum: "pare de fazer X"
- promessa: resultado claro e realista
- provocacao: afirmação ousada

REGRAS ANTI-CLICKBAIT:
- Proibido promessas falsas
- Proibido exageros ("mude sua vida em 1 dia")
- Promessas devem ser realistas e alcançáveis

Objetivo: ${config.objective}
Tom: ${config.audience.tone}

Responda APENAS com JSON:
{
  "hooks": [
    {
      "id": "uuid",
      "text": "texto do hook (máx 8 palavras)",
      "type": "curiosidade|contraste|erro-comum|promessa|provocacao",
      "score": 85,
      "legibilityScore": 90
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return {
    hooks: content.hooks.map((hook: any) => ({
      ...hook,
      id: crypto.randomUUID(),
    })),
  };
}

// ==========================================
// SlideScript + ClarityGuard - Full carousel generation
// ==========================================
async function generateFullCarousel(apiKey: string, topic: string, config: CarouselConfig) {
  const objectiveStructures: Record<string, string> = {
    educar: 'Cover → Contexto → 3-5 Insights didáticos → Síntese → CTA salvar',
    converter: 'Cover dor → Prova social → Solução → Oferta → CTA converter',
    autoridade: 'Cover contraintuitivo → Framework → Demonstração → Prova → CTA seguir',
    viral: 'Cover hook forte → Microvitórias → Lista objetiva → Twist → CTA share/save',
    storytelling: 'Cover situação → Conflito → Jornada → Resolução → Lição → CTA',
    polemica: 'Cover afirmação forte → Contexto → Argumentos → Nuance → CTA debate',
    'mito-realidade': 'Cover (Mito Popular) → Mito 1 + Realidade 1 → Mito 2 + Realidade 2 → Mito 3 + Realidade 3 → Conclusão surpreendente → CTA',
    'antes-depois': 'Cover (Transformação) → Antes (estado atual/problema) → O Ponto de Virada → Depois (resultado) → Como Chegou Lá → Prova/Dados → CTA',
    'thread-visual': 'Cover (Tweet Principal) → Insight/Tweet 1 → Insight/Tweet 2 → Insight/Tweet 3 → Insight/Tweet 4 → Resumo do Thread → CTA retweet/salvar',
  };

  const structure = objectiveStructures[config.objective] || objectiveStructures.educar;

  const systemPrompt = `Você é o melhor criador de carrosséis do mundo para Instagram.

ESTRUTURA PARA ${config.objective.toUpperCase()}:
${structure}

TOTAL DE SLIDES: ${config.format.slideCount}

REGRAS DE COPY (ClarityGuard):
- Título: máximo 8 palavras, impactante
- Conteúdo: máximo 25 palavras por slide
- Frases curtas e rítmicas
- Linguagem ${config.audience.tone}
- Nível: ${config.audience.level}
${config.audience.niche ? `- Nicho: ${config.audience.niche}` : ''}

SLIDE TYPES:
- cover: gancho principal + subtítulo
- intro: contexto/problema
- content: 1 ideia por slide (com ícone)
- summary: síntese do aprendizado  
- cta: call-to-action claro

ÍCONES DISPONÍVEIS:
Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle, ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield, Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle, Eye, Lock, Unlock, DollarSign, Percent, Calendar, Bell, Gift

REGRAS PARA imagePrompt (em inglês):
- Estilo: premium, moderno, minimalista
- Fundo: gradiente escuro sofisticado
- Elementos: formas geométricas, linhas sutis
- Sem texto na imagem
- Metáforas visuais do conceito

Responda APENAS com JSON:
{
  "slides": [
    {
      "id": "uuid",
      "type": "cover|intro|content|summary|cta",
      "title": "string",
      "subtitle": "string (opcional)",
      "content": "string",
      "bullets": ["item1", "item2"] (opcional),
      "icon": "string (apenas content)",
      "order": number,
      "imagePrompt": "string em inglês",
      "clarityScore": number 0-100,
      "characterCount": number
    }
  ],
  "caption": "legenda sugerida para o post",
  "hashtags": ["#tag1", "#tag2"],
  "alternativeTitle": "título alternativo para A/B test",
  "firstComment": "sugestão de primeiro comentário"
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Crie um carrossel viral sobre: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return {
    slides: content.slides.map((slide: any, index: number) => ({
      ...slide,
      id: crypto.randomUUID(),
      order: index,
      characterCount: (slide.title?.length || 0) + (slide.content?.length || 0),
      clarityScore: slide.clarityScore || 85,
    })),
    caption: content.caption,
    hashtags: content.hashtags,
    alternativeTitle: content.alternativeTitle,
    firstComment: content.firstComment,
  };
}

// ==========================================
// Improve Slide with AI
// ==========================================
async function improveSlide(apiKey: string, slides: any[], slideIndex: number, action: string) {
  const slide = slides[slideIndex];
  
  const actionPrompts: Record<string, string> = {
    shorter: 'Reduza o texto pela metade mantendo o impacto. Seja mais direto.',
    viral: 'Torne mais viral: use números, contraste, ou curiosidade.',
    didactic: 'Torne mais didático: simplifique, use analogias, seja mais claro.',
    direct: 'Seja mais direto: remova palavras desnecessárias, vá direto ao ponto.',
    premium: 'Eleve o tom: linguagem mais sofisticada, premium, exclusiva.',
  };

  const systemPrompt = `Você é um editor de carrosséis. Melhore este slide.
  
Ação: ${actionPrompts[action] || actionPrompts.shorter}

REGRAS:
- Título: máximo 8 palavras
- Conteúdo: máximo 25 palavras
- Mantenha o tipo de slide: ${slide.type}
- Atualize o imagePrompt se necessário

Responda APENAS com JSON:
{
  "title": "novo título",
  "subtitle": "novo subtítulo (se aplicável)",
  "content": "novo conteúdo",
  "imagePrompt": "novo prompt (em inglês)",
  "clarityScore": number
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Slide atual:\nTítulo: ${slide.title}\nConteúdo: ${slide.content || ''}\nSubtítulo: ${slide.subtitle || ''}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return {
    slideIndex,
    updates: {
      title: content.title,
      subtitle: content.subtitle,
      content: content.content,
      imagePrompt: content.imagePrompt,
      clarityScore: content.clarityScore || 90,
      characterCount: (content.title?.length || 0) + (content.content?.length || 0),
    },
  };
}

// ==========================================
// QualityScore - Automatic QA
// ==========================================
async function qualityCheck(apiKey: string, slides: any[], config: CarouselConfig) {
  const systemPrompt = `Você é um QA especialista em carrosséis de Instagram.
Analise este carrossel e pontue de 0-100.

CRITÉRIOS:
- legibilidade: tamanho do texto adequado para mobile
- densidadeTexto: não muito texto por slide
- coerenciaNarrativa: fluxo lógico entre slides
- consistenciaVisual: uniformidade de estilo
- ctaClaro: chamada para ação clara e específica

Para cada problema encontrado, sugira correção.

Responda APENAS com JSON:
{
  "total": number,
  "legibilidade": number,
  "densidadeTexto": number,
  "coerenciaNarrativa": number,
  "consistenciaVisual": number,
  "ctaClaro": number,
  "issues": [
    {
      "id": "uuid",
      "slideIndex": number,
      "type": "warning|error",
      "message": "descrição do problema",
      "suggestion": "como corrigir",
      "action": "encurtar|contraste|hook|cta|simplificar"
    }
  ]
}`;

  const slidesText = slides.map((s, i) => 
    `Slide ${i + 1} (${s.type}): "${s.title}" - "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analise:\n${slidesText}\n\nObjetivo: ${config.objective}\nPúblico: ${config.audience.level}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return {
    qualityScore: {
      total: content.total,
      legibilidade: content.legibilidade,
      densidadeTexto: content.densidadeTexto,
      coerenciaNarrativa: content.coerenciaNarrativa,
      consistenciaVisual: content.consistenciaVisual,
      ctaClaro: content.ctaClaro,
      issues: (content.issues || []).map((issue: any) => ({
        ...issue,
        id: crypto.randomUUID(),
      })),
    },
  };
}

// ==========================================
// Generate Caption
// ==========================================
async function generateCaption(apiKey: string, topic: string, slides: any[]) {
  const systemPrompt = `Você é um copywriter de Instagram.
Crie uma legenda engajante para este carrossel.

REGRAS:
- Máximo 2200 caracteres
- Primeira linha deve ser um gancho
- Use emojis estrategicamente (não exagere)
- Inclua CTA: salvar, compartilhar, comentar
- Quebre em parágrafos curtos

Responda APENAS com JSON:
{
  "caption": "texto da legenda"
}`;

  const slideTitles = slides.map(s => s.title).join(', ');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"\nSlides: ${slideTitles}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return { caption: content.caption };
}

// ==========================================
// Generate Hashtags
// ==========================================
async function generateHashtags(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um especialista em hashtags de Instagram.
Gere 20 hashtags relevantes para o carrossel.

REGRAS:
- Mix de hashtags populares e nichadas
- Relevantes para o tema e nicho
- Sem hashtags genéricas demais (#love, #instagood)
- Português brasileiro

Responda APENAS com JSON:
{
  "hashtags": ["#tag1", "#tag2", ...]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"\nNicho: ${config.audience.niche || 'empreendedorismo digital'}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  
  return { hashtags: content.hashtags };
}

// ==========================================
// #4 Rewrite Carousel
// ==========================================
async function rewriteCarousel(apiKey: string, slides: any[], config: CarouselConfig, topic: string) {
  const systemPrompt = `Você é um editor sênior de carrosséis virais. Reescreva TODOS os slides mantendo a estrutura mas melhorando:
- Copywriting mais impactante
- Textos mais curtos e diretos
- Hooks mais fortes
- CTA mais claro

Objetivo: ${config?.objective || 'educar'}
Tom: ${config?.audience?.tone || 'humano'}

Responda APENAS com JSON:
{
  "slides": [
    {
      "title": "novo título",
      "subtitle": "novo subtítulo",
      "content": "novo conteúdo",
      "imagePrompt": "novo prompt em inglês"
    }
  ]
}`;

  const slidesText = slides.map((s: any, i: number) => 
    `Slide ${i + 1} (${s.type}): Título: "${s.title}" | Conteúdo: "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"\n\n${slidesText}` },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  return { slides: content.slides };
}

// ==========================================
// #5 Translate Carousel
// ==========================================
async function translateCarousel(apiKey: string, slides: any[], targetLang: string) {
  const langNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian' };
  const langName = langNames[targetLang] || 'English';

  const systemPrompt = `You are a professional translator. Translate all carousel slide texts to ${langName}.
Keep the same tone and impact. Adapt idioms and expressions naturally.

Respond ONLY with JSON:
{
  "slides": [
    {
      "title": "translated title",
      "subtitle": "translated subtitle",
      "content": "translated content"
    }
  ]
}`;

  const slidesText = slides.map((s: any, i: number) => 
    `Slide ${i + 1}: Título: "${s.title}" | Subtítulo: "${s.subtitle || ''}" | Conteúdo: "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  return { slides: content.slides };
}

// ==========================================
// #9 A/B Test Hooks
// ==========================================
async function generateABHooks(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um copywriter especialista em hooks virais.
Gere 3 variações de CAPA para teste A/B.

Cada variação deve ter abordagem diferente:
1. Curiosidade (pergunta ou mistério)
2. Contraste/Provocação (afirmação ousada)
3. Promessa com número (resultado específico)

Objetivo: ${config?.objective || 'educar'}
Tom: ${config?.audience?.tone || 'humano'}

Responda APENAS com JSON:
{
  "hooks": [
    {
      "id": "uuid",
      "title": "texto do hook (máx 8 palavras)",
      "subtitle": "subtítulo complementar",
      "approach": "curiosidade|contraste|promessa",
      "score": 85,
      "reasoning": "por que funciona"
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  return {
    hooks: content.hooks.map((h: any) => ({ ...h, id: crypto.randomUUID() })),
  };
}

// ==========================================
// #8 Suggest Ideas by Niche
// ==========================================
async function suggestIdeasByNiche(apiKey: string, config: CarouselConfig) {
  const systemPrompt = `Você é um estrategista de conteúdo para Instagram.
Sugira 6 ideias de carrosséis para o nicho informado, com alto potencial de engajamento.

Objetivo: ${config?.objective || 'educar'}
Público: ${config?.audience?.level || 'intermediario'}
Nicho: ${config?.audience?.niche || 'empreendedorismo digital'}
Tom: ${config?.audience?.tone || 'humano'}

Responda APENAS com JSON:
{
  "ideas": [
    {
      "id": "uuid",
      "title": "título do carrossel (máx 10 palavras)",
      "description": "breve descrição do conteúdo (máx 20 palavras)",
      "category": "trending|evergreen|polêmico|educativo|inspiracional|prático",
      "viralScore": 85
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Sugira ideias para o nicho: ${config?.audience?.niche || 'empreendedorismo digital'}` },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  return {
    ideas: content.ideas.map((idea: any) => ({ ...idea, id: crypto.randomUUID() })),
  };
}

// ==========================================
// #61 Detect Clichés and Weak Phrases
// ==========================================
async function detectCliches(apiKey: string, slides: any[]) {
  const systemPrompt = `Você é um editor de copy exigente. Analise os slides e detecte:
- Clichês e frases batidas
- Frases fracas ou vagas
- Palavras desnecessárias (muito, realmente, basicamente)
- Promessas genéricas

Para cada problema, sugira uma alternativa mais forte.

Responda APENAS com JSON:
{
  "issues": [
    {
      "slideIndex": number,
      "original": "frase original",
      "problem": "cliche|fraco|vago|generico",
      "suggestion": "versão melhorada",
      "severity": "low|medium|high"
    }
  ],
  "overallScore": number 0-100,
  "summary": "resumo geral da qualidade do copy"
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): "${s.title}" - "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #62 Suggest CTA by Objective
// ==========================================
async function suggestCTA(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um especialista em CTAs para Instagram.
Sugira 5 CTAs personalizados para este carrossel.

Objetivo: ${config?.objective || 'educar'}
Tom: ${config?.audience?.tone || 'humano'}

Tipos de CTA:
- salvar: incentiva salvar o post
- compartilhar: incentiva compartilhar
- comentar: incentiva comentários
- seguir: incentiva seguir o perfil
- link: direciona para link na bio

Responda APENAS com JSON:
{
  "ctas": [
    {
      "text": "texto do CTA (máx 15 palavras)",
      "type": "salvar|compartilhar|comentar|seguir|link",
      "emoji": "emoji sugerido",
      "score": number 0-100
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #63 Readability Score
// ==========================================
async function readabilityScore(apiKey: string, slides: any[]) {
  const systemPrompt = `Você é um especialista em legibilidade para mobile.
Analise cada slide e pontue a legibilidade de 0-100.

CRITÉRIOS:
- Tamanho da fonte visual (texto curto = melhor)
- Contraste presumido
- Hierarquia de informação
- Escaneabilidade (lê rápido?)
- Adequação para tela de celular

Responda APENAS com JSON:
{
  "slides": [
    {
      "slideIndex": number,
      "score": number,
      "wordCount": number,
      "issues": ["issue1", "issue2"],
      "suggestion": "como melhorar"
    }
  ],
  "averageScore": number,
  "worstSlide": number
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): Título(${(s.title || '').length}chars): "${s.title}" | Conteúdo(${(s.content || '').length}chars): "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #66 Suggest Strategic Emojis
// ==========================================
async function suggestEmojis(apiKey: string, slides: any[]) {
  const systemPrompt = `Você é um estrategista de emojis para Instagram.
Para cada slide, sugira 1-2 emojis estratégicos que:
- Reforçam a mensagem visualmente
- Quebram o texto para escaneabilidade
- São relevantes ao conteúdo (não aleatórios)

Responda APENAS com JSON:
{
  "slides": [
    {
      "slideIndex": number,
      "titleEmoji": "emoji para início do título",
      "contentEmojis": ["emoji1", "emoji2"],
      "reasoning": "por que esses emojis"
    }
  ]
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): "${s.title}" - "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #69 Prompt Refinement
// ==========================================
async function refinePrompt(apiKey: string, userPrompt: string, config: CarouselConfig) {
  const systemPrompt = `Você é um especialista em prompts para carrosséis.
O usuário quer criar um carrossel sobre um tema mas o prompt pode ser vago.
Melhore o prompt para gerar um carrossel mais impactante.

Objetivo: ${config?.objective || 'educar'}
Público: ${config?.audience?.level || 'intermediario'}
Nicho: ${config?.audience?.niche || 'geral'}

Gere 3 versões refinadas do prompt:
1. Mais específico e direto
2. Com ângulo polêmico/provocativo
3. Com dados/números

Responda APENAS com JSON:
{
  "refinements": [
    {
      "prompt": "prompt refinado",
      "approach": "especifico|polemico|dados",
      "improvement": "o que melhorou"
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt original: "${userPrompt}"` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #70 Generate 3 Variations
// ==========================================
async function generateVariations(apiKey: string, topic: string, config: CarouselConfig) {
  const systemPrompt = `Você é um estrategista de conteúdo. Gere 3 abordagens COMPLETAMENTE DIFERENTES para o mesmo tema.

Cada variação deve ter:
- Ângulo diferente (educativo vs provocativo vs inspiracional)
- Hook diferente
- Estrutura narrativa diferente

Objetivo: ${config?.objective || 'educar'}
Público: ${config?.audience?.level || 'intermediario'}

Responda APENAS com JSON:
{
  "variations": [
    {
      "id": "uuid",
      "name": "Nome da abordagem",
      "angle": "educativo|provocativo|inspiracional",
      "hook": "hook de capa (máx 8 palavras)",
      "outline": ["slide1 resumo", "slide2 resumo", "slide3 resumo"],
      "viralScore": number 0-100,
      "reasoning": "por que essa abordagem funciona"
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: "${topic}"` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  const content = parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
  return { variations: content.variations.map((v: any) => ({ ...v, id: crypto.randomUUID() })) };
}

// ==========================================
// #68 Rewrite in Specific Person's Voice
// ==========================================
async function rewriteVoice(apiKey: string, slides: any[], voicePerson: string) {
  const systemPrompt = `Você é um ghostwriter especialista em adaptar textos ao tom de voz de pessoas específicas.
Reescreva todos os slides no estilo/tom de voz de "${voicePerson}".

Capture:
- Vocabulário típico
- Estrutura de frases
- Expressões características
- Nível de formalidade
- Ritmo do texto

Mantenha o conteúdo/mensagem mas adapte completamente o estilo.

Responda APENAS com JSON:
{
  "slides": [
    {
      "title": "novo título",
      "subtitle": "novo subtítulo",
      "content": "novo conteúdo"
    }
  ],
  "voiceNotes": "observações sobre o tom aplicado"
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): "${s.title}" | "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #74 Ideal Slide Sequence by Psychology
// ==========================================
async function sequencePsychology(apiKey: string, slides: any[], config: CarouselConfig) {
  const systemPrompt = `Você é um psicólogo comportamental especialista em sequenciamento de conteúdo.
Analise a ordem dos slides e sugira a MELHOR sequência baseada em:

PRINCÍPIOS:
- Efeito de primazia (o que vem primeiro é mais lembrado)
- Efeito de recência (o que vem por último tem mais impacto)
- Curva de atenção (pico no slide 2-3, queda no meio)
- Tensão narrativa (conflito → resolução)
- Cognitive load (não sobrecarregar no início)

Objetivo: ${config?.objective || 'educar'}

Responda APENAS com JSON:
{
  "suggestedOrder": [0, 2, 1, 3, 4, 5, 6],
  "reasoning": "explicação da lógica psicológica",
  "attentionCurve": [
    { "slideIndex": number, "attentionLevel": number 0-100, "note": "por que neste nível" }
  ],
  "tips": ["dica 1", "dica 2"]
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): "${s.title}" - "${s.content || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #58 Suggest Best Posting Time
// ==========================================
async function suggestPostingTime(apiKey: string, config: CarouselConfig) {
  const systemPrompt = `Você é um analista de redes sociais. Baseado no nicho e público, sugira os melhores horários de postagem no Instagram.

Nicho: ${config?.audience?.niche || 'geral'}
Público: ${config?.audience?.level || 'intermediario'}

CONSIDERE:
- Horários de pico do Instagram Brasil
- Comportamento do público-alvo
- Dia da semana
- Competição por atenção

Responda APENAS com JSON:
{
  "bestTimes": [
    {
      "day": "segunda|terca|quarta|quinta|sexta|sabado|domingo",
      "time": "HH:MM",
      "score": number 0-100,
      "reasoning": "por que este horário"
    }
  ],
  "tips": ["dica 1", "dica 2"],
  "worstTimes": ["horário a evitar 1", "horário a evitar 2"]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Nicho: ${config?.audience?.niche || 'empreendedorismo digital'}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// #59 Auto-generate Alt Text
// ==========================================
async function generateAltText(apiKey: string, slides: any[]) {
  const systemPrompt = `Você é um especialista em acessibilidade web.
Gere textos alternativos (alt-text) descritivos para cada slide de carrossel.

REGRAS:
- Descreva o conteúdo visual de forma concisa
- Inclua o texto principal do slide
- Máximo 125 caracteres por alt-text
- Seja útil para leitores de tela

Responda APENAS com JSON:
{
  "altTexts": [
    {
      "slideIndex": number,
      "altText": "descrição acessível do slide"
    }
  ]
}`;

  const slidesText = slides.map((s: any, i: number) =>
    `Slide ${i + 1} (${s.type}): Título: "${s.title}" | Conteúdo: "${s.content || ''}" | ImagePrompt: "${s.imagePrompt || ''}"`
  ).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: slidesText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const aiResponse = await response.json();
  return parseJsonFromResponse(aiResponse.choices?.[0]?.message?.content);
}

// ==========================================
// Helper: Parse JSON from AI response
// ==========================================
function parseJsonFromResponse(content: string): any {
  if (!content) {
    throw new Error('Empty AI response');
  }

  let jsonContent = content;
  
  // Handle markdown code blocks
  if (content.includes('```json')) {
    jsonContent = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    jsonContent = content.split('```')[1].split('```')[0].trim();
  }

  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('JSON parse error:', e, 'Content:', jsonContent.substring(0, 500));
    throw new Error('Failed to parse AI response as JSON');
  }
}
