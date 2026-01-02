-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can validate certificates by code" ON public.certificates;

-- Create a secure validation function that only exposes necessary fields
CREATE OR REPLACE FUNCTION public.validate_certificate(cert_code TEXT)
RETURNS TABLE (
  student_name TEXT,
  course_name TEXT,
  total_hours INTEGER,
  completed_at TIMESTAMPTZ,
  certificate_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input: check for null, empty, or excessively long input
  IF cert_code IS NULL OR LENGTH(TRIM(cert_code)) = 0 OR LENGTH(cert_code) > 50 THEN
    RETURN;
  END IF;
  
  -- Return only public-safe fields, excluding user_id and internal id
  RETURN QUERY
  SELECT 
    c.student_name,
    c.course_name,
    c.total_hours,
    c.completed_at,
    c.certificate_code
  FROM public.certificates c
  WHERE c.certificate_code = UPPER(TRIM(cert_code))
  LIMIT 1;
END;
$$;

-- Grant execute permissions to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_certificate(TEXT) TO anon, authenticated;