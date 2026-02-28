
-- Create table for saved carousels
CREATE TABLE public.saved_carousels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  config JSONB,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  first_comment TEXT,
  alternative_title TEXT,
  quality_score JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_carousels ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own carousels"
  ON public.saved_carousels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own carousels"
  ON public.saved_carousels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carousels"
  ON public.saved_carousels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carousels"
  ON public.saved_carousels FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_saved_carousels_updated_at
  BEFORE UPDATE ON public.saved_carousels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for user queries
CREATE INDEX idx_saved_carousels_user_id ON public.saved_carousels(user_id);
CREATE INDEX idx_saved_carousels_updated_at ON public.saved_carousels(updated_at DESC);
