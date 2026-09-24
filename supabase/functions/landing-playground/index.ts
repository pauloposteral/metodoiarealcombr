import { consumeQuota } from '../_shared/ai-guard.ts';
import { errorResponse, HttpError, readJson } from '../_shared/http.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRESETS: Record<string, { system: string; user: (input: string) => string; label: string }> = {
  email: {
    label: "E-mail executivo",
    system:
      "Você é um redator profissional. Escreva e-mails claros, curtos e objetivos, em português brasileiro. Máximo 5 linhas. Tom executivo, sem clichês, sem emojis.",
    user: (input) =>
      `Escreva um e-mail executivo curto sobre este assunto: "${input}". Máximo 5 linhas, tom direto.`,
  },
  post: {
    label: "Post de LinkedIn",
    system:
      "Você é um escritor de conteúdo profissional em português brasileiro. Escreva posts de LinkedIn autênticos, com abertura forte, corpo com números ou exemplos concretos e uma pergunta no final. Sem hashtags floridas, no máximo 3 emojis.",
    user: (input) =>
      `Escreva um post de LinkedIn autêntico sobre: "${input}". Abertura forte, 1 dado concreto, encerre com uma pergunta.`,
  },
  planilha: {
    label: "Fórmula de planilha",
    system:
      "Você é um especialista em Google Sheets e Excel. Responda apenas com a fórmula pronta seguida de UMA linha curta explicando o que ela faz. Português brasileiro.",
    user: (input) =>
      `Preciso de uma fórmula de planilha para: "${input}". Devolva a fórmula pronta + explicação em 1 linha.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    // The global daily budget also limits distributed/spoofed-IP abuse.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip)))).map(b => b.toString(16).padStart(2, '0')).join('');
    await consumeQuota(`demo:ip:${hash}`, 5, 60);
    await consumeQuota('demo:global:day', 100, 86400);

    const { preset, input } = await readJson(req);
    const cfg = typeof preset === 'string' && Object.hasOwn(PRESETS, preset) ? PRESETS[preset] : undefined;
    if (!cfg) {
      return new Response(JSON.stringify({ error: "Preset inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanInput = String(input || "").slice(0, 200);
    if (!cleanInput.trim()) {
      return new Response(JSON.stringify({ error: "Escreva algo primeiro" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "IA não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: cfg.system },
          { role: "user", content: cfg.user(cleanInput) },
        ],
        max_tokens: 400,
        temperature: 0.75,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", errText);
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 502;
      return new Response(
        JSON.stringify({
          error:
            aiResponse.status === 402
              ? "Créditos de IA esgotados. Tente novamente mais tarde."
              : aiResponse.status === 429
              ? "IA sobrecarregada. Tente em alguns segundos."
              : "Erro ao consultar IA",
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices?.[0]?.message?.content || "Sem resposta.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return errorResponse(e);
  }
});
