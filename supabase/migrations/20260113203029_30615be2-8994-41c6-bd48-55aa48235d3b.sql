-- Create table for saved hooks (banco de hooks)
CREATE TABLE public.saved_hooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  hook_type TEXT NOT NULL DEFAULT 'curiosidade',
  category TEXT,
  score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_hooks
ALTER TABLE public.saved_hooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_hooks
CREATE POLICY "Users can view own hooks"
ON public.saved_hooks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hooks"
ON public.saved_hooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hooks"
ON public.saved_hooks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hooks"
ON public.saved_hooks FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_hooks_updated_at
BEFORE UPDATE ON public.saved_hooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();