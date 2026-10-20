BEGIN;
-- Only the principal formation promises its first two modules as free previews.
-- Explicitly free courses/lessons and all paid entitlements remain unchanged.
ALTER POLICY "Accessible published lessons" ON public.lessons USING (EXISTS (
  SELECT 1 FROM public.modules m LEFT JOIN public.courses c ON c.id=m.course_id
  WHERE m.id=lessons.module_id AND m.is_published=true
    AND (m.course_id IS NULL OR c.is_published=true)
    AND (private.paid_access() OR lessons.is_free=true OR c.is_free=true OR (c.id = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7'::uuid AND m.order_index IN (0, 1)))
));
CREATE OR REPLACE FUNCTION public.get_course_outline(course_slug text)
RETURNS TABLE(course_id uuid, module_id uuid, module_code text, module_title text,
  module_description text, module_order integer, module_hours_label text, module_trails text[],
  module_project_title text, module_is_star boolean, lesson_id uuid, lesson_title text,
  lesson_description text, lesson_order integer, lesson_type text, estimated_minutes integer,
  is_free boolean, accessible boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE paid boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  paid := private.paid_access();
  RETURN QUERY
  SELECT c.id, m.id, m.code, m.title, m.description, m.order_index, m.hours_label, m.trails,
    m.project_title, m.is_star, l.id, l.title, l.description, l.order_index, l.type,
    coalesce(l.estimated_minutes, l.duration_minutes), l.is_free,
    CASE WHEN l.id IS NOT NULL THEN coalesce(paid OR l.is_free = true OR c.is_free = true
      OR (c.id = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7'::uuid AND m.order_index IN (0, 1)), false) END
  FROM public.courses c
  JOIN public.modules m ON m.course_id = c.id AND m.is_published = true
  LEFT JOIN public.lessons l ON l.module_id = m.id
  WHERE c.slug = course_slug AND c.is_published = true
  ORDER BY m.order_index, m.created_at, m.id, l.order_index, l.created_at, l.id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_course_outline(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_outline(text) TO authenticated;
COMMIT;
