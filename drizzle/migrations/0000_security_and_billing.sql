-- Apply in staging first. No production records are deleted by this migration.
BEGIN;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- A policy name does not restrict its target role. The old policy applied to PUBLIC.
DROP POLICY IF EXISTS "Service role can manage purchases" ON public.purchases;
REVOKE ALL ON public.purchases FROM anon;

-- New accounts receive free access; existing paid/manual grants remain intact.
ALTER TABLE public.profiles ALTER COLUMN access_status SET DEFAULT 'pending';
CREATE OR REPLACE FUNCTION public.guard_profile_access()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role')
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF (TG_OP = 'INSERT' AND NEW.access_status IS DISTINCT FROM 'pending')
       OR (TG_OP = 'UPDATE' AND NEW.access_status IS DISTINCT FROM OLD.access_status) THEN
      RAISE EXCEPTION 'Access status may only be changed by an administrator' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_profile_access BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_access();
CREATE POLICY "Admins can read profiles" ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Avoid recursive self-queries in company_users RLS and bind administration to the target company.
CREATE FUNCTION private.company_member(target uuid, require_admin boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_users cu
    WHERE cu.company_id = target AND cu.user_id = auth.uid()
      AND (NOT require_admin OR cu.role = 'admin'))
$$;
REVOKE ALL ON FUNCTION private.company_member(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.company_member(uuid, boolean) TO authenticated;
DROP POLICY "Company members can view their team" ON public.company_users;
DROP POLICY "Company admins can manage team members" ON public.company_users;
DROP POLICY "Company admins can update team members" ON public.company_users;
DROP POLICY "Company admins can remove team members" ON public.company_users;
CREATE POLICY "Company members can view their team" ON public.company_users FOR SELECT TO authenticated
USING (private.company_member(company_id));
CREATE POLICY "Company admins can manage team members" ON public.company_users FOR INSERT TO authenticated
WITH CHECK (private.company_member(company_id, true));
CREATE POLICY "Company admins can update team members" ON public.company_users FOR UPDATE TO authenticated
USING (private.company_member(company_id, true)) WITH CHECK (private.company_member(company_id, true));
CREATE POLICY "Company admins can remove team members" ON public.company_users FOR DELETE TO authenticated
USING (private.company_member(company_id, true));
CREATE FUNCTION public.guard_company_billing()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role')
    AND NOT public.has_role(auth.uid(), 'admin')
    AND (NEW.plan, NEW.status, NEW.max_users, NEW.admin_user_id) IS DISTINCT FROM
        (OLD.plan, OLD.status, OLD.max_users, OLD.admin_user_id) THEN
    RAISE EXCEPTION 'Company billing fields require platform administrator' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_company_billing BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.guard_company_billing();

-- One-time course payments are distinct from recurring subscriptions.
CREATE TABLE public.course_payments (
  stripe_checkout_session_id text PRIMARY KEY,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_charge_id text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('paid', 'refunded', 'disputed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX course_payments_user_idx ON public.course_payments(user_id, status);
CREATE INDEX course_payments_charge_idx ON public.course_payments(stripe_charge_id);
ALTER TABLE public.course_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own course payments" ON public.course_payments FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.course_payments TO authenticated;
GRANT ALL ON public.course_payments TO service_role;
REVOKE ALL ON public.course_payments FROM anon;

CREATE FUNCTION private.paid_access()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()
      AND p.access_status IS DISTINCT FROM 'revoked'
      AND (p.access_status = 'active'
        OR EXISTS (SELECT 1 FROM public.course_payments cp WHERE cp.user_id = p.id AND cp.status = 'paid')
        OR EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
          AND s.status IN ('active', 'trialing') AND s.current_period_end > now())))
$$;
REVOKE ALL ON FUNCTION private.paid_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.paid_access() TO authenticated;

-- Enforce protected course access at the database, including unpublished modules.
DROP POLICY "Authenticated users can view modules" ON public.modules;
CREATE POLICY "Published modules for members" ON public.modules FOR SELECT TO authenticated
USING (is_published = true AND (course_id IS NULL OR EXISTS (
  SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published = true)));
DROP POLICY "Authenticated users can view lessons" ON public.lessons;
CREATE POLICY "Accessible published lessons" ON public.lessons FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.modules m LEFT JOIN public.courses c ON c.id = m.course_id
  WHERE m.id = module_id AND m.is_published = true
    AND (m.course_id IS NULL OR c.is_published = true)
    AND (private.paid_access() OR is_free = true OR c.is_free = true
      OR m.order_index IN (0, 1))));
DROP POLICY "Authenticated users can view materials" ON public.materials;
CREATE POLICY "Materials for paid members" ON public.materials FOR SELECT TO authenticated
USING (private.paid_access());
DROP POLICY "Authenticated users can view quizzes" ON public.quizzes;
CREATE POLICY "Quizzes for paid members" ON public.quizzes FOR SELECT TO authenticated
USING (private.paid_access() AND EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id));

-- Shared links expose only public fields and require an exact share identifier.
DROP POLICY "Anyone can view publicly shared carousels" ON public.saved_carousels;
CREATE FUNCTION public.get_shared_carousel(share_id text)
RETURNS TABLE(slides jsonb, theme jsonb, topic text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT c.slides, c.theme, c.topic FROM public.saved_carousels c
  WHERE c.public_share_id = share_id AND length(share_id) BETWEEN 12 AND 128 LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_shared_carousel(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_carousel(text) TO anon, authenticated;
DROP POLICY "Users can view comments on their carousels" ON public.slide_comments;
CREATE POLICY "Owners can view carousel comments" ON public.slide_comments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.saved_carousels c WHERE c.id = carousel_id AND c.user_id = auth.uid()));
DROP POLICY "Users can create comments" ON public.slide_comments;
CREATE POLICY "Owners can create carousel comments" ON public.slide_comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.saved_carousels c WHERE c.id = carousel_id AND c.user_id = auth.uid()));
DROP POLICY "Users can update own comments" ON public.slide_comments;
CREATE POLICY "Owners can update carousel comments" ON public.slide_comments FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.saved_carousels c WHERE c.id = carousel_id AND c.user_id = auth.uid()));

-- Prevent uploads into another customer's namespace.
DROP POLICY "Users can upload carousel images" ON storage.objects;
CREATE POLICY "Users can upload carousel images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'carousel-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Sandbox plan checks cannot depend on browser feature flags.
CREATE FUNCTION public.ai_sandbox_daily_limit()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE WHEN NOT private.paid_access() THEN 0
    WHEN EXISTS (SELECT 1 FROM public.subscriptions s JOIN public.plans p ON p.id = s.plan_id
      WHERE s.user_id = auth.uid() AND s.status IN ('active', 'trialing')
        AND s.current_period_end > now() AND p.slug = 'premium') THEN -1
    ELSE 50 END
$$;
REVOKE ALL ON FUNCTION public.ai_sandbox_daily_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_sandbox_daily_limit() TO authenticated;

-- Atomic quotas; no client can reset the counter or supply their own limit.
CREATE TABLE private.ai_quotas (
  key text PRIMARY KEY, hits integer NOT NULL, resets_at timestamptz NOT NULL
);
CREATE INDEX ai_quotas_reset_idx ON private.ai_quotas(resets_at);
CREATE FUNCTION public.consume_ai_quota(quota_key text, quota_limit integer, window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE accepted boolean := false;
BEGIN
  IF quota_key IS NULL OR length(quota_key) > 200 OR quota_limit NOT BETWEEN 1 AND 10000
     OR window_seconds NOT BETWEEN 1 AND 86400 THEN RAISE EXCEPTION 'Invalid quota'; END IF;
  INSERT INTO private.ai_quotas AS q(key, hits, resets_at)
  VALUES (quota_key, 1, now() + make_interval(secs => window_seconds))
  ON CONFLICT(key) DO UPDATE SET
    hits = CASE WHEN q.resets_at <= now() THEN 1 ELSE q.hits + 1 END,
    resets_at = CASE WHEN q.resets_at <= now() THEN now() + make_interval(secs => window_seconds) ELSE q.resets_at END
  WHERE q.resets_at <= now() OR q.hits < quota_limit
  RETURNING true INTO accepted;
  RETURN coalesce(accepted, false);
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_quota(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text, integer, integer) TO service_role;

-- Sandbox clients cannot erase request history to evade a rate limit.
DROP POLICY "Users can manage own sandbox sessions" ON public.sandbox_sessions;
CREATE POLICY "Users can read sandbox sessions" ON public.sandbox_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can save sandbox sessions" ON public.sandbox_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Points are awarded by database triggers, not arbitrary client updates.
DROP POLICY "Users can insert their own points" ON public.user_points;
DROP POLICY "Users can update their own points" ON public.user_points;

-- Issuance checks completion server-side and computes the immutable certificate fields.
DROP POLICY "Users can insert their own certificate" ON public.certificates;
CREATE FUNCTION public.issue_certificate()
RETURNS SETOF public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE student uuid := auth.uid(); lesson_count integer; completed_count integer; hours integer; student_name text;
BEGIN
  IF student IS NULL OR NOT private.paid_access() THEN RAISE EXCEPTION 'Paid access required' USING ERRCODE = '42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(student::text));
  IF EXISTS (SELECT 1 FROM public.certificates c WHERE c.user_id = student) THEN
    RETURN QUERY SELECT * FROM public.certificates c WHERE c.user_id = student ORDER BY c.created_at LIMIT 1;
    RETURN;
  END IF;
  SELECT count(*), greatest(1, round(coalesce(sum(l.duration_minutes), 0) / 60.0))
    INTO lesson_count, hours FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
    LEFT JOIN public.courses c ON c.id = m.course_id
    WHERE m.is_published = true AND (m.course_id IS NULL OR c.is_published = true);
  SELECT count(*) INTO completed_count FROM public.lesson_progress p
    JOIN public.lessons l ON l.id = p.lesson_id JOIN public.modules m ON m.id = l.module_id
    LEFT JOIN public.courses c ON c.id = m.course_id
    WHERE p.user_id = student AND p.completed = true AND m.is_published = true
      AND (m.course_id IS NULL OR c.is_published = true);
  IF lesson_count = 0 OR completed_count < lesson_count THEN RAISE EXCEPTION 'Course incomplete' USING ERRCODE = '42501'; END IF;
  SELECT coalesce(nullif(trim(p.full_name), ''), 'Aluno') INTO student_name FROM public.profiles p WHERE p.id = student;
  RETURN QUERY INSERT INTO public.certificates(user_id, certificate_code, student_name, course_name, total_hours)
    VALUES (student, 'IAR-' || upper(replace(gen_random_uuid()::text, '-', '')), student_name, 'Método IA Real', hours)
    RETURNING *;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_certificate() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.issue_certificate() TO authenticated;

-- Public profile cards must not require exposing full private profiles.
CREATE FUNCTION public.get_profile_cards(user_ids uuid[])
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.id, p.full_name, p.avatar_url FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id = ANY(user_ids[1:1000])
$$;
REVOKE ALL ON FUNCTION public.get_profile_cards(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_cards(uuid[]) TO authenticated;
COMMIT;