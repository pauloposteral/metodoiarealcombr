
-- #44: Carousel folders for organizing by client
CREATE TABLE public.carousel_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carousel_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders" ON public.carousel_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own folders" ON public.carousel_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders" ON public.carousel_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders" ON public.carousel_folders FOR DELETE USING (auth.uid() = user_id);

-- Add folder_id to saved_carousels
ALTER TABLE public.saved_carousels ADD COLUMN folder_id UUID REFERENCES public.carousel_folders(id) ON DELETE SET NULL;

-- #38: Public share link
ALTER TABLE public.saved_carousels ADD COLUMN public_share_id TEXT UNIQUE;

-- Public read policy for shared carousels (no auth required)
CREATE POLICY "Anyone can view publicly shared carousels" ON public.saved_carousels FOR SELECT USING (public_share_id IS NOT NULL);

-- #27: Saved templates
CREATE TABLE public.carousel_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'custom',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB,
  config JSONB,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carousel_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates" ON public.carousel_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create templates" ON public.carousel_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.carousel_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.carousel_templates FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_carousel_folders_updated_at BEFORE UPDATE ON public.carousel_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carousel_templates_updated_at BEFORE UPDATE ON public.carousel_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
