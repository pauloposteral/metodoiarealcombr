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
    const { prompt, slideType, themeColors } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build enhanced prompt for educational carousel images
    const styleGuide = `
Style requirements:
- Modern, professional, educational aesthetic
- Dark, moody background with subtle gradients
- Minimalist and clean composition
- Abstract or conceptual visualization
- High contrast for text overlay readability
- Color palette: deep blues, graphite, subtle gold accents
- Avoid: cluttered compositions, stock photo look, text in image
- Format: 4:5 aspect ratio (portrait), optimized for Instagram carousel
`;

    const contextByType: Record<string, string> = {
      cover: 'Create a dramatic, attention-grabbing hero image that evokes curiosity and professional authority. Focus on abstract patterns or a single powerful visual metaphor.',
      intro: 'Create a welcoming, context-setting image with subtle visual elements that introduce the topic. Use soft gradients and minimal abstract shapes.',
      content: 'Create an educational illustration that visually represents the concept. Use icons, diagrams, or abstract representations. Keep it clean and readable.',
      summary: 'Create a consolidating image that brings elements together. Use visual metaphors of synthesis, completion, or achievement.',
      cta: 'Create an inspiring, action-oriented image that motivates engagement. Use upward movement, light effects, or symbols of connection and sharing.',
    };

    const enhancedPrompt = `${prompt}

${contextByType[slideType] || contextByType.content}

${styleGuide}

Theme colors to incorporate subtly: ${themeColors || 'deep navy blue, gold accents'}`;

    console.log('Generating image with prompt:', enhancedPrompt.substring(0, 200));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    // Extract image from response
    const imageUrl = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(aiResponse).substring(0, 500));
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-slide-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
