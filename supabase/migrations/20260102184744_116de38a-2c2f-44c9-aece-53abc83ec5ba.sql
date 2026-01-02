-- Create certificates table
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  certificate_code text NOT NULL UNIQUE,
  student_name text NOT NULL,
  course_name text NOT NULL DEFAULT 'Método IA Real',
  total_hours integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own certificate (when they complete the course)
CREATE POLICY "Users can insert their own certificate"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Public can view certificates for validation (by code)
CREATE POLICY "Anyone can validate certificates by code"
ON public.certificates
FOR SELECT
USING (true);