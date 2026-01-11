import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, slideCount } = await req.json();

    if (!topic || !slideCount) {
      return new Response(
        JSON.stringify({ error: 'Topic and slideCount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

const systemPrompt = `Você é um especialista em criação de carrosséis virais e educacionais para Instagram, focados em IA, produtividade e empreendedorismo digital.

ESTRUTURA NARRATIVA OBRIGATÓRIA:

SLIDE 1 — CAPA (type: cover)
• Frase de gancho forte e curiosa (máx 6 palavras)
• Subtítulo que gera identificação
• imagePrompt: descrição visual impactante para a capa

SLIDE 2 — CONTEXTO (type: intro)
• Conexão emocional com o leitor
• Problema ou situação comum
• imagePrompt: visual que representa o contexto/problema

SLIDES 3 a N-2 — CONTEÚDO (type: content)
• 1 ideia principal por slide
• Texto curto e memorável (máx 20 palavras)
• Escolha ícone apropriado da lista
• imagePrompt: ilustração ou diagrama do conceito

SLIDE N-1 — CONSOLIDAÇÃO (type: summary)
• Síntese do aprendizado
• Frase de autoridade ou insight final
• imagePrompt: visual de síntese/conquista

SLIDE N — CTA (type: cta)
• Incentivo claro: salvar, comentar, compartilhar
• Benefício de engajar
• imagePrompt: visual motivacional

ÍCONES DISPONÍVEIS:
Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle, ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield, Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle

REGRAS DE COPYWRITING:
- Títulos: máximo 6-8 palavras, impactantes
- Conteúdo: máximo 20 palavras, claro e direto
- Use números e dados quando relevante
- Linguagem ativa, engajante, transformadora
- Evite jargões técnicos complexos

REGRAS PARA imagePrompt:
- Descrição em inglês para melhor geração
- Estilo: moderno, profissional, minimalista
- Cores: tons escuros (navy, graphite) com acentos dourados
- Evite: texto na imagem, pessoas genéricas, visual poluído
- Foque em: conceitos abstratos, diagramas, metáforas visuais

Responda APENAS com JSON válido:
{
  "slides": [
    {
      "id": "uuid",
      "type": "cover|intro|content|summary|cta",
      "title": "string",
      "subtitle": "string (opcional, para cover)",
      "content": "string (para intro, content, summary, cta)",
      "icon": "string (apenas para content)",
      "imagePrompt": "string (descrição da imagem em inglês)",
      "order": number
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Crie um carrossel com ${slideCount} slides sobre o tema: "${topic}"` 
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(jsonContent);

    // Ensure IDs are unique
    const slides = parsed.slides.map((slide: any, index: number) => ({
      ...slide,
      id: crypto.randomUUID(),
      order: index,
    }));

    return new Response(
      JSON.stringify({ slides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-carousel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate carousel';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
