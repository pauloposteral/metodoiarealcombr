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

    const systemPrompt = `Você é um especialista em criação de carrosséis para Instagram focados em educação sobre IA e produtividade. 
    
Gere um carrossel profissional seguindo esta estrutura:
1. Slide 1 (cover): Título impactante como gancho + subtítulo curto
2. Slide 2 (intro): Contextualização do tema
3. Slides intermediários (content): Conteúdo dividido em passos/insights, 1 ideia por slide
4. Último slide (cta): Chamada para ação

Para cada slide de conteúdo, escolha um ícone apropriado desta lista:
Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle, ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield, Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle

Regras de copywriting:
- Títulos curtos e impactantes (máx 8 palavras)
- Conteúdo claro e direto (máx 25 palavras por slide)
- Use linguagem ativa e engajante
- Foque em transformação e resultados
- Inclua números e dados quando possível

Responda APENAS com um JSON válido no formato:
{
  "slides": [
    {
      "id": "uuid",
      "type": "cover|intro|content|cta",
      "title": "string",
      "subtitle": "string (opcional)",
      "content": "string (opcional)",
      "icon": "string (apenas para content)",
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
