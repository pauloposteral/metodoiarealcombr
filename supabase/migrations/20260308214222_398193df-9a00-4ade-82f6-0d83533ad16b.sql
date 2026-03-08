
-- Brand Kits table
CREATE TABLE public.brand_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Meu Brand Kit',
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#f59e0b',
  accent_color TEXT DEFAULT '#10b981',
  background_color TEXT DEFAULT '#0f172a',
  text_color TEXT DEFAULT '#ffffff',
  font_title TEXT DEFAULT 'Plus Jakarta Sans',
  font_body TEXT DEFAULT 'Inter',
  logo_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand kits" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brand kits" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand kits" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand kits" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);

-- Add is_public and description to carousel_templates for community sharing
ALTER TABLE public.carousel_templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.carousel_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.carousel_templates ADD COLUMN IF NOT EXISTS preview_colors JSONB DEFAULT '[]'::jsonb;

-- Allow anyone to view public templates
CREATE POLICY "Anyone can view public templates" ON public.carousel_templates FOR SELECT USING (is_public = true);
