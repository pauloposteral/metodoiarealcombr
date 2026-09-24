import { safeFetchHtml } from '../_shared/safe-fetch.ts';
import { errorResponse } from '../_shared/http.ts';
import { guardAIRequest } from '../_shared/ai-guard.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const denied = await guardAIRequest(req);
  if (denied) return denied;

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await safeFetchHtml(url);

    // Extract text content from HTML (basic extraction)
    const textContent = html
      // Remove scripts and styles
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Use AI to summarize the content into a carousel topic
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      // Return raw extracted content if no AI key
      return new Response(
        JSON.stringify({ 
          title, 
          description,
          content: textContent.substring(0, 2000),
          topic: `${title}${description ? ` - ${description}` : ''}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to create a carousel-ready topic from the article
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em transformar artigos em tópicos de carrossel para Instagram.
Dado o conteúdo de um artigo/página, extraia o tema principal e crie um tópico conciso e envolvente para um carrossel educativo.
Responda APENAS com um JSON: { "topic": "...", "summary": "..." }
- topic: título do carrossel (máximo 100 caracteres, deve ser provocativo e claro)
- summary: resumo do conteúdo principal em 2-3 frases (para contexto)`
          },
          {
            role: 'user',
            content: `Título: ${title}\nDescrição: ${description}\nConteúdo: ${textContent.substring(0, 4000)}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      return new Response(
        JSON.stringify({ 
          title, 
          description,
          topic: `${title}${description ? ` - ${description}` : ''}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let parsed;
    try {
      const jsonStr = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { topic: title, summary: description };
    }

    return new Response(
      JSON.stringify({
        title,
        description,
        topic: parsed.topic || title,
        summary: parsed.summary || description,
        content: textContent.substring(0, 2000),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return errorResponse(error);
  }
});
