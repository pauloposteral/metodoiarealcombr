
-- Carousel workflow status and scheduling
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'rascunho';
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.saved_carousels ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Slide comments table
CREATE TABLE public.slide_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carousel_id UUID NOT NULL REFERENCES public.saved_carousels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  slide_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.slide_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their carousels" ON public.slide_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.saved_carousels WHERE id = carousel_id AND (user_id = auth.uid() OR public_share_id IS NOT NULL))
);
CREATE POLICY "Users can create comments" ON public.slide_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.slide_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.slide_comments FOR DELETE USING (auth.uid() = user_id);
