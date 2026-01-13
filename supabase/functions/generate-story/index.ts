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
    const { prompt, storyType, style, aspectRatio = '9:16' } = await req.json();

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

    // Style presets for different story types
    const stylePresets: Record<string, string> = {
      'editorial': `
        High-fashion editorial photography style
        Dramatic cinematic lighting with deep shadows
        Rich, moody color grading
        Professional magazine-quality composition
        Sophisticated and elegant aesthetic
      `,
      'minimal': `
        Ultra-clean minimalist design
        Lots of negative space
        Soft, muted color palette
        Single focal point
        Modern Scandinavian aesthetic
      `,
      'bold': `
        Vibrant, saturated colors
        Strong geometric shapes
        High contrast and dynamic composition
        Eye-catching and energetic
        Modern graphic design style
      `,
      'dreamy': `
        Soft, ethereal lighting
        Pastel color palette with subtle gradients
        Dreamy, slightly blurred background
        Romantic and whimsical atmosphere
        Gentle light leaks and bokeh
      `,
      'luxury': `
        Opulent and sophisticated
        Rich dark tones with gold accents
        Premium textures like marble, velvet, silk
        Elegant and exclusive atmosphere
        High-end brand aesthetic
      `,
      'neon': `
        Cyberpunk neon aesthetic
        Vibrant pink, blue, purple glow effects
        Dark urban background
        Futuristic and edgy
        High contrast light trails
      `,
      'nature': `
        Natural organic elements
        Earth tones and botanical accents
        Soft natural lighting
        Fresh and calming atmosphere
        Sustainable, eco-friendly vibe
      `,
      'tech': `
        Clean futuristic technology aesthetic
        Subtle blue/purple gradients
        Abstract digital elements
        Sleek metallic surfaces
        Innovation and progress theme
      `,
    };

    const typeContext: Record<string, string> = {
      'promo': 'Create a promotional story image that highlights value and creates urgency. Include visual elements suggesting exclusivity or limited-time offer.',
      'quote': 'Create a beautiful background for an inspirational quote. Leave clean space in the center for text overlay. Focus on atmospheric, mood-setting imagery.',
      'product': 'Create an elegant product showcase setting. Use professional lighting and composition to make the product area stand out.',
      'announcement': 'Create an attention-grabbing background for an important announcement. Use dynamic elements that draw focus to the center.',
      'behind-scenes': 'Create an authentic, candid atmosphere suggesting behind-the-scenes content. Use warm, inviting lighting.',
      'tutorial': 'Create a clean, educational visual with clear composition. Include subtle tech or learning elements.',
      'engagement': 'Create an interactive-feeling image that encourages participation. Use elements suggesting questions, polls, or conversation.',
      'lifestyle': 'Create aspirational lifestyle imagery. Focus on mood, atmosphere, and emotional connection.',
    };

    const selectedStyle = stylePresets[style] || stylePresets['editorial'];
    const selectedContext = typeContext[storyType] || typeContext['lifestyle'];

    const enhancedPrompt = `Create a stunning Instagram Story image (${aspectRatio} aspect ratio, vertical format).

${prompt}

${selectedContext}

Visual Style:
${selectedStyle}

Technical requirements:
- Vertical format optimized for mobile viewing
- Resolution suitable for 1080x1920 display
- Safe zones for text overlay (avoid important elements in top/bottom 15%)
- Professional, high-quality output
- NO text, watermarks, or logos in the image
- Focus on creating visual impact and emotional response`;

    console.log('Generating story image:', prompt.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
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
      console.error('Story generation API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Story generation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const imageUrl = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(aiResponse).substring(0, 500));
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        message: aiResponse.choices?.[0]?.message?.content || 'Image generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate story';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});