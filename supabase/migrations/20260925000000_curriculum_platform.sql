-- Curriculum platform: 13 coded modules (MOD-00..MOD-12), learning tracks, dated lesson seals,
-- project submissions, track-based certificates and the admin import of the curriculum pack.
-- Paid lesson content never lives in the repository: it arrives through the admin RPCs below.
-- Production safety: additive DDL only; no lesson, progress or certificate row is deleted.
-- Existing modules are not given a code here, so certificates keep the legacy rule until the
-- admin imports the new curriculum.
BEGIN;

-- 1. Columns -----------------------------------------------------------------------------
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS intro text,
  ADD COLUMN IF NOT EXISTS hours_label text,
  ADD COLUMN IF NOT EXISTS trails text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_title text,
  ADD COLUMN IF NOT EXISTS is_star boolean NOT NULL DEFAULT false;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS reviewed_at date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_track text;

-- Named constraints added separately so a re-run (or a column created by hand) still gets them.
DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint
      WHERE conrelid = 'public.modules'::regclass AND conname = 'modules_code_format') THEN
    ALTER TABLE public.modules ADD CONSTRAINT modules_code_format
      CHECK (code IS NULL OR code ~ '^MOD-[0-9]{2}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint
      WHERE conrelid = 'public.modules'::regclass AND conname = 'modules_trails_known') THEN
    ALTER TABLE public.modules ADD CONSTRAINT modules_trails_known
      CHECK (trails <@ ARRAY['carreira', 'empreendedor', 'criador', 'construtor']::text[]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint
      WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_learning_track_known') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_learning_track_known
      CHECK (learning_track IS NULL
        OR learning_track IN ('carreira', 'empreendedor', 'criador', 'construtor', 'completa'));
  END IF;
END
$constraints$;
CREATE UNIQUE INDEX IF NOT EXISTS modules_course_code_key
  ON public.modules(course_id, code) WHERE code IS NOT NULL;
-- profiles.learning_track: students update it through the existing own-profile policy;
-- guard_profile_access only protects access_status, so no trigger change is needed.

-- 2. Lesson access -------------------------------------------------------------------------
-- The previous policy wrote an unqualified `is_free` inside a subquery over modules/courses,
-- which resolved to courses.is_free: a lesson marked free was still locked. Qualifying it
-- makes lesson-level free samples work and keeps get_course_outline.accessible identical.
ALTER POLICY "Accessible published lessons" ON public.lessons
USING (EXISTS (
  SELECT 1 FROM public.modules m LEFT JOIN public.courses c ON c.id = m.course_id
  WHERE m.id = lessons.module_id AND m.is_published = true
    AND (m.course_id IS NULL OR c.is_published = true)
    AND (private.paid_access() OR lessons.is_free = true OR c.is_free = true
      OR m.order_index IN (0, 1))));

-- 3. Project submissions -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  url text NOT NULL CONSTRAINT project_submissions_url_https
    CHECK (url ~ '^https://[^[:space:]]+$' AND length(url) <= 500),
  notes text CONSTRAINT project_submissions_notes_length
    CHECK (notes IS NULL OR length(notes) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS project_submissions_lesson_idx ON public.project_submissions(lesson_id);
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own project submissions" ON public.project_submissions;
CREATE POLICY "Students read own project submissions" ON public.project_submissions
FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read all project submissions" ON public.project_submissions;
CREATE POLICY "Admins read all project submissions" ON public.project_submissions
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- lessons RLS applies inside the EXISTS: only project lessons the student can open qualify.
DROP POLICY IF EXISTS "Students submit visible projects" ON public.project_submissions;
CREATE POLICY "Students submit visible projects" ON public.project_submissions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.lessons l
  WHERE l.id = project_submissions.lesson_id AND l.type = 'project'));
DROP POLICY IF EXISTS "Students update own project submissions" ON public.project_submissions;
CREATE POLICY "Students update own project submissions" ON public.project_submissions
FOR UPDATE TO authenticated USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.lessons l
  WHERE l.id = project_submissions.lesson_id AND l.type = 'project'));
DROP POLICY IF EXISTS "Students delete own project submissions" ON public.project_submissions;
CREATE POLICY "Students delete own project submissions" ON public.project_submissions
FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_project_submissions_updated_at ON public.project_submissions;
CREATE TRIGGER update_project_submissions_updated_at BEFORE UPDATE ON public.project_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON public.project_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_submissions TO authenticated;
GRANT ALL ON public.project_submissions TO service_role;

-- 4. Course outline ------------------------------------------------------------------------
-- Syllabus for members: every lesson title of the published course (never content or prompts)
-- plus whether the lesson opens. `accessible` mirrors "Accessible published lessons".
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
      OR m.order_index IN (0, 1), false) END
  FROM public.courses c
  JOIN public.modules m ON m.course_id = c.id AND m.is_published = true
  LEFT JOIN public.lessons l ON l.module_id = m.id
  WHERE c.slug = course_slug AND c.is_published = true
  ORDER BY m.order_index, m.created_at, m.id, l.order_index, l.created_at, l.id;
END;
$$;

-- 5. Certificates --------------------------------------------------------------------------
-- Single source of the certificate rule. Not granted to anyone: only the SECURITY DEFINER
-- RPCs below call it, always with auth.uid().
CREATE OR REPLACE FUNCTION private.certificate_status(student uuid)
RETURNS TABLE(track text, required_lessons integer, completed_lessons integer,
  threshold_percent integer, final_project_lesson_id uuid, final_project_done boolean,
  eligible boolean, total_minutes integer, course_name text)
LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE
  track_key text;
  lesson_total integer;
  lesson_done integer;
  minute_total integer;
  final_lesson uuid;
  final_done boolean;
BEGIN
  SELECT p.learning_track INTO track_key FROM public.profiles p WHERE p.id = student;
  track_key := coalesce(track_key, 'completa');

  IF NOT EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
      WHERE m.code IS NOT NULL AND m.is_published = true AND c.is_published = true) THEN
    -- Legacy rule until the new curriculum is imported: every published lesson, 100%.
    SELECT count(*)::integer,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.lesson_progress p
        WHERE p.user_id = student AND p.lesson_id = l.id AND p.completed = true))::integer,
      coalesce(sum(coalesce(l.duration_minutes, 0)), 0)::integer
    INTO lesson_total, lesson_done, minute_total
    FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
    LEFT JOIN public.courses c ON c.id = m.course_id
    WHERE m.is_published = true AND (m.course_id IS NULL OR c.is_published = true);
    RETURN QUERY SELECT track_key, lesson_total, lesson_done, 100, NULL::uuid, true,
      lesson_total > 0 AND lesson_done >= lesson_total, minute_total, 'Método IA Real'::text;
    RETURN;
  END IF;

  -- Track lessons: coded, published modules of published courses in the student's track.
  SELECT count(*)::integer,
    count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.lesson_progress p
      WHERE p.user_id = student AND p.lesson_id = l.id AND p.completed = true))::integer,
    coalesce(sum(coalesce(l.estimated_minutes, l.duration_minutes, 0)), 0)::integer
  INTO lesson_total, lesson_done, minute_total
  FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE m.code IS NOT NULL AND m.is_published = true AND c.is_published = true
    AND (track_key = 'completa' OR track_key = ANY(m.trails));

  -- Final project: the last project lesson of the published MOD-12, completed and submitted.
  SELECT l.id INTO final_lesson
  FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE m.code = 'MOD-12' AND m.is_published = true AND c.is_published = true AND l.type = 'project'
  ORDER BY l.order_index DESC, l.created_at DESC NULLS LAST, l.id DESC
  LIMIT 1;
  final_done := final_lesson IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.lesson_progress p
      WHERE p.user_id = student AND p.lesson_id = final_lesson AND p.completed = true)
    AND EXISTS (SELECT 1 FROM public.project_submissions s
      WHERE s.user_id = student AND s.lesson_id = final_lesson);

  RETURN QUERY SELECT track_key, lesson_total, lesson_done, 75, final_lesson, final_done,
    lesson_total > 0 AND lesson_done >= ceil(lesson_total * 0.75) AND final_done, minute_total,
    'Método IA Real — ' || CASE track_key
      WHEN 'carreira' THEN 'Trilha Carreira / CLT'
      WHEN 'empreendedor' THEN 'Trilha Empreendedor'
      WHEN 'criador' THEN 'Trilha Criador de conteúdo'
      WHEN 'construtor' THEN 'Trilha Construtor de apps'
      ELSE 'Formação completa' END;
END;
$$;

-- Progress screen: works for free accounts too; issuing still requires paid access.
CREATE OR REPLACE FUNCTION public.get_certificate_status()
RETURNS TABLE(track text, required_lessons integer, completed_lessons integer,
  threshold_percent integer, final_project_lesson_id uuid, final_project_done boolean,
  eligible boolean, total_minutes integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT s.track, s.required_lessons, s.completed_lessons, s.threshold_percent,
    s.final_project_lesson_id, s.final_project_done, s.eligible, s.total_minutes
  FROM private.certificate_status(auth.uid()) s;
END;
$$;

-- Same guarantees as before (paid access, per-student lock, idempotent, server-computed
-- fields); only the completion rule and the track-aware course name changed.
CREATE OR REPLACE FUNCTION public.issue_certificate()
RETURNS SETOF public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  student uuid := auth.uid();
  progress record;
  holder text;
BEGIN
  IF student IS NULL OR NOT private.paid_access() THEN
    RAISE EXCEPTION 'Paid access required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(student::text));
  IF EXISTS (SELECT 1 FROM public.certificates c WHERE c.user_id = student) THEN
    RETURN QUERY SELECT * FROM public.certificates c WHERE c.user_id = student
      ORDER BY c.created_at LIMIT 1;
    RETURN;
  END IF;
  SELECT * INTO progress FROM private.certificate_status(student);
  IF NOT progress.eligible THEN
    IF progress.required_lessons > 0 AND NOT progress.final_project_done
       AND progress.completed_lessons >= ceil(progress.required_lessons * progress.threshold_percent / 100.0) THEN
      RAISE EXCEPTION 'Course incomplete: final project not completed and submitted'
        USING ERRCODE = '42501';
    END IF;
    RAISE EXCEPTION 'Course incomplete' USING ERRCODE = '42501',
      DETAIL = format('%s of %s lessons completed; %s%% required.', progress.completed_lessons,
        progress.required_lessons, progress.threshold_percent);
  END IF;
  SELECT coalesce(nullif(trim(p.full_name), ''), 'Aluno') INTO holder
  FROM public.profiles p WHERE p.id = student;
  RETURN QUERY INSERT INTO public.certificates(user_id, certificate_code, student_name, course_name, total_hours)
    VALUES (student, 'IAR-' || upper(replace(gen_random_uuid()::text, '-', '')),
      coalesce(holder, 'Aluno'), progress.course_name,
      greatest(1, round(progress.total_minutes / 60.0))::integer)
    RETURNING *;
END;
$$;

-- 6. Curriculum pack validation helpers ----------------------------------------------------
-- Private, not granted: called only by the admin import RPCs. Errors name the offending field.
CREATE OR REPLACE FUNCTION private.pack_text(input jsonb, label text, allow_blank boolean DEFAULT false)
RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a string', label USING ERRCODE = '22023';
  END IF;
  IF NOT allow_blank AND (input #>> '{}') !~ '[^[:space:]]' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must not be empty', label USING ERRCODE = '22023';
  END IF;
  RETURN input #>> '{}';
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_integer(input jsonb, label text, min_value integer, max_value integer)
RETURNS integer LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  -- jsonb keeps 12.0 as "12.0", so the text form rejects fractional values.
  IF jsonb_typeof(input) IS DISTINCT FROM 'number' OR (input #>> '{}') !~ '^-?[0-9]{1,9}$' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be an integer', label USING ERRCODE = '22023';
  END IF;
  IF (input #>> '{}')::integer NOT BETWEEN min_value AND max_value THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be between % and %', label, min_value, max_value
      USING ERRCODE = '22023';
  END IF;
  RETURN (input #>> '{}')::integer;
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_number(input jsonb, label text, min_value numeric, max_value numeric)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'number' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a number', label USING ERRCODE = '22023';
  END IF;
  IF (input #>> '{}')::numeric NOT BETWEEN min_value AND max_value THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be between % and %', label, min_value, max_value
      USING ERRCODE = '22023';
  END IF;
  RETURN (input #>> '{}')::numeric;
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_boolean(input jsonb, label text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'boolean' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be true or false', label USING ERRCODE = '22023';
  END IF;
  RETURN (input #>> '{}')::boolean;
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_uuid(input jsonb, label text)
RETURNS uuid LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'string'
     OR (input #>> '{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a UUID', label USING ERRCODE = '22023';
  END IF;
  RETURN (input #>> '{}')::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_date(input jsonb, label text)
RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF input IS NULL OR jsonb_typeof(input) = 'null' THEN
    RETURN NULL;
  END IF;
  IF jsonb_typeof(input) <> 'string' OR (input #>> '{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a date (YYYY-MM-DD)', label USING ERRCODE = '22023';
  END IF;
  BEGIN
    RETURN (input #>> '{}')::date;
  EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % is not a valid date', label USING ERRCODE = '22023';
  END;
END;
$$;

CREATE OR REPLACE FUNCTION private.pack_text_array(input jsonb, label text)
RETURNS text[] LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a list', label USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(input) AS e(item) WHERE jsonb_typeof(e.item) <> 'string') THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must contain only strings', label USING ERRCODE = '22023';
  END IF;
  RETURN ARRAY(SELECT e.item FROM jsonb_array_elements_text(input) WITH ORDINALITY AS e(item, idx)
    ORDER BY e.idx);
END;
$$;

-- Quiz questions as graded by submit_quiz_attempt: { question, options[], correct, explanation }.
CREATE OR REPLACE FUNCTION private.pack_questions(input jsonb, label text)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
  question jsonb;
  question_number bigint;
  question_label text;
  option_count integer;
BEGIN
  IF jsonb_typeof(input) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must be a list', label USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(input) = 0 THEN
    RAISE EXCEPTION 'Invalid curriculum pack: % must not be empty', label USING ERRCODE = '22023';
  END IF;
  FOR question, question_number IN
    SELECT e.item, e.idx FROM jsonb_array_elements(input) WITH ORDINALITY AS e(item, idx)
  LOOP
    question_label := format('%s %s', label, question_number);
    IF jsonb_typeof(question) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % must be an object', question_label USING ERRCODE = '22023';
    END IF;
    PERFORM private.pack_text(question->'question', question_label || ' question');
    IF jsonb_typeof(question->'options') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % options must be a list', question_label USING ERRCODE = '22023';
    END IF;
    option_count := jsonb_array_length(question->'options');
    IF option_count < 2 OR EXISTS (SELECT 1 FROM jsonb_array_elements(question->'options') AS o(item)
        WHERE jsonb_typeof(o.item) <> 'string' OR (o.item #>> '{}') !~ '[^[:space:]]') THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % needs at least two non-empty options', question_label
        USING ERRCODE = '22023';
    END IF;
    PERFORM private.pack_integer(question->'correct', question_label || ' correct', 0, option_count - 1);
    IF question ? 'explanation' THEN
      PERFORM private.pack_text(question->'explanation', question_label || ' explanation', true);
    END IF;
  END LOOP;
  RETURN input;
END;
$$;

-- 7. Admin import: one module per call ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_import_curriculum_module(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  pack_course jsonb := payload->'course';
  pack_module jsonb := payload->'module';
  course_key uuid;
  course_slug text;
  course_difficulty text;
  other_course uuid;
  module_key uuid;
  module_code text;
  module_slug text;
  module_trails text[];
  target uuid;
  lesson jsonb;
  lesson_number bigint;
  lesson_label text;
  lesson_key uuid;
  lesson_kind text;
  lesson_minutes integer;
  seen_lessons uuid[] := '{}';
  quiz jsonb;
  lesson_total integer := 0;
  quiz_total integer := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator required' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(payload) IS DISTINCT FROM 'object'
     OR payload->>'format' IS DISTINCT FROM 'metodo-ia-real/curriculum@1' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: format must be metodo-ia-real/curriculum@1'
      USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(pack_course) IS DISTINCT FROM 'object' OR jsonb_typeof(pack_module) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: course and module must be objects' USING ERRCODE = '22023';
  END IF;

  course_key := private.pack_uuid(pack_course->'id', 'course.id');
  course_slug := private.pack_text(pack_course->'slug', 'course.slug');
  IF course_slug !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: course.slug must use lowercase letters, digits and hyphens'
      USING ERRCODE = '22023';
  END IF;
  course_difficulty := private.pack_text(pack_course->'difficulty', 'course.difficulty');
  IF course_difficulty NOT IN ('beginner', 'intermediate', 'advanced') THEN
    RAISE EXCEPTION 'Invalid curriculum pack: course.difficulty must be beginner, intermediate or advanced'
      USING ERRCODE = '22023';
  END IF;
  module_key := private.pack_uuid(pack_module->'id', 'module.id');
  module_code := private.pack_text(pack_module->'code', 'module.code');
  IF module_code !~ '^MOD-[0-9]{2}$' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: module.code must look like MOD-00' USING ERRCODE = '22023';
  END IF;
  module_slug := private.pack_text(pack_module->'slug', 'module.slug');
  module_trails := private.pack_text_array(pack_module->'trails', 'module.trails');
  IF NOT module_trails <@ ARRAY['carreira', 'empreendedor', 'criador', 'construtor'] THEN
    RAISE EXCEPTION 'Invalid curriculum pack: module.trails accepts carreira, empreendedor, criador, construtor'
      USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(pack_module->'lessons') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: module.lessons must be a list' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(pack_module->'lessons') = 0 THEN
    RAISE EXCEPTION 'Invalid curriculum pack: module.lessons must not be empty' USING ERRCODE = '22023';
  END IF;

  -- Serialises concurrent imports/finalisations of the same course.
  PERFORM pg_advisory_xact_lock(hashtext('curriculum-import:' || course_key::text));

  -- Course: upsert by id; an existing slug is kept (links depend on it).
  SELECT c.id INTO other_course FROM public.courses c
  WHERE c.slug = course_slug AND c.id <> course_key LIMIT 1;
  IF other_course IS NOT NULL THEN
    RAISE EXCEPTION 'Course slug "%" already belongs to another course (%)', course_slug, other_course
      USING ERRCODE = '23505',
        HINT = 'Fix the slug in curso.json or rename the other course before importing.';
  END IF;
  INSERT INTO public.courses AS c (id, slug, title, description, difficulty, estimated_hours, tags)
  VALUES (course_key, course_slug,
    private.pack_text(pack_course->'title', 'course.title'),
    nullif(private.pack_text(pack_course->'description', 'course.description', true), ''),
    course_difficulty,
    private.pack_number(pack_course->'estimated_hours', 'course.estimated_hours', 0, 9999),
    private.pack_text_array(pack_course->'tags', 'course.tags'))
  ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
    difficulty = EXCLUDED.difficulty, estimated_hours = EXCLUDED.estimated_hours,
    tags = EXCLUDED.tags, updated_at = now();

  -- Module: same id, else a module of this course with the same code, slug or a title that
  -- starts with the code (legacy "MOD-03 ..." rows). A row already carrying another code is
  -- never taken over. Code matches win, then the oldest row.
  SELECT m.id INTO target FROM public.modules m WHERE m.id = module_key;
  IF target IS NULL THEN
    SELECT m.id INTO target FROM public.modules m
    WHERE m.course_id = course_key
      AND (m.code IS NULL OR m.code = module_code)
      AND (m.code = module_code OR m.slug = module_slug OR m.title ~ ('^' || module_code || '\M'))
    ORDER BY (m.code IS NOT DISTINCT FROM module_code) DESC, m.created_at NULLS LAST, m.id
    LIMIT 1;
  END IF;
  target := coalesce(target, module_key);
  IF EXISTS (SELECT 1 FROM public.modules m
      WHERE m.course_id = course_key AND m.code = module_code AND m.id <> target) THEN
    RAISE EXCEPTION 'Module code % is already used by another module of this course', module_code
      USING ERRCODE = '23505';
  END IF;
  INSERT INTO public.modules AS m (id, course_id, code, slug, title, description, intro, hours_label,
    trails, project_title, is_star, order_index, is_published)
  VALUES (target, course_key, module_code, module_slug,
    private.pack_text(pack_module->'title', 'module.title'),
    nullif(private.pack_text(pack_module->'description', 'module.description', true), ''),
    nullif(private.pack_text(pack_module->'intro', 'module.intro', true), ''),
    nullif(private.pack_text(pack_module->'hours_label', 'module.hours_label', true), ''),
    module_trails,
    nullif(private.pack_text(pack_module->'project_title', 'module.project_title', true), ''),
    private.pack_boolean(pack_module->'is_star', 'module.is_star'),
    private.pack_integer(pack_module->'order_index', 'module.order_index', 0, 998),
    true)
  ON CONFLICT (id) DO UPDATE SET course_id = EXCLUDED.course_id, code = EXCLUDED.code,
    slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description,
    intro = EXCLUDED.intro, hours_label = EXCLUDED.hours_label, trails = EXCLUDED.trails,
    project_title = EXCLUDED.project_title, is_star = EXCLUDED.is_star,
    order_index = EXCLUDED.order_index, is_published = true;

  -- Lessons and quizzes: deterministic ids from the pack; video_url is never touched.
  FOR lesson, lesson_number IN
    SELECT e.item, e.idx FROM jsonb_array_elements(pack_module->'lessons') WITH ORDINALITY AS e(item, idx)
  LOOP
    lesson_label := format('%s lesson %s', module_code, lesson_number);
    IF jsonb_typeof(lesson) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % must be an object', lesson_label USING ERRCODE = '22023';
    END IF;
    lesson_key := private.pack_uuid(lesson->'id', lesson_label || ' id');
    IF lesson_key = ANY(seen_lessons) THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % repeats lesson id %', lesson_label, lesson_key
        USING ERRCODE = '22023';
    END IF;
    seen_lessons := seen_lessons || lesson_key;
    lesson_kind := private.pack_text(lesson->'type', lesson_label || ' type');
    IF lesson_kind NOT IN ('text', 'project') THEN
      RAISE EXCEPTION 'Invalid curriculum pack: % type must be text or project', lesson_label
        USING ERRCODE = '22023';
    END IF;
    lesson_minutes := private.pack_integer(lesson->'estimated_minutes', lesson_label || ' estimated_minutes', 1, 600);
    INSERT INTO public.lessons AS l (id, module_id, slug, title, description, content, prompts,
      order_index, type, estimated_minutes, duration_minutes, is_free, reviewed_at)
    VALUES (lesson_key, target,
      private.pack_text(lesson->'slug', lesson_label || ' slug'),
      private.pack_text(lesson->'title', lesson_label || ' title'),
      nullif(private.pack_text(lesson->'description', lesson_label || ' description', true), ''),
      private.pack_text(lesson->'content', lesson_label || ' content'),
      private.pack_text_array(lesson->'prompts', lesson_label || ' prompts'),
      private.pack_integer(lesson->'order_index', lesson_label || ' order_index', 0, 999),
      lesson_kind, lesson_minutes, lesson_minutes,
      private.pack_boolean(lesson->'is_free', lesson_label || ' is_free'),
      private.pack_date(lesson->'reviewed_at', lesson_label || ' reviewed_at'))
    ON CONFLICT (id) DO UPDATE SET module_id = EXCLUDED.module_id, slug = EXCLUDED.slug,
      title = EXCLUDED.title, description = EXCLUDED.description, content = EXCLUDED.content,
      prompts = EXCLUDED.prompts, order_index = EXCLUDED.order_index, type = EXCLUDED.type,
      estimated_minutes = EXCLUDED.estimated_minutes, duration_minutes = EXCLUDED.duration_minutes,
      is_free = EXCLUDED.is_free, reviewed_at = EXCLUDED.reviewed_at;
    lesson_total := lesson_total + 1;

    quiz := lesson->'quiz';
    IF quiz IS NOT NULL AND jsonb_typeof(quiz) <> 'null' THEN
      IF jsonb_typeof(quiz) <> 'object' THEN
        RAISE EXCEPTION 'Invalid curriculum pack: % quiz must be an object or null', lesson_label
          USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.quizzes AS q (id, lesson_id, title, questions, passing_score, max_attempts, order_index)
      VALUES (private.pack_uuid(quiz->'id', lesson_label || ' quiz id'), lesson_key,
        private.pack_text(quiz->'title', lesson_label || ' quiz title'),
        private.pack_questions(quiz->'questions', lesson_label || ' quiz question'),
        private.pack_number(quiz->'passing_score', lesson_label || ' quiz passing_score', 0, 100),
        private.pack_integer(quiz->'max_attempts', lesson_label || ' quiz max_attempts', 1, 10),
        0)
      ON CONFLICT (id) DO UPDATE SET lesson_id = EXCLUDED.lesson_id, title = EXCLUDED.title,
        questions = EXCLUDED.questions, passing_score = EXCLUDED.passing_score,
        max_attempts = EXCLUDED.max_attempts, order_index = 0;
      quiz_total := quiz_total + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('module_id', target, 'code', module_code,
    'lessons', lesson_total, 'quizzes', quiz_total);
END;
$$;

-- 8. Admin finalisation: archive what the pack no longer contains ---------------------------
-- Lessons are moved, never deleted, so lesson_progress, notes, comments and quiz attempts
-- keep pointing at them.
CREATE OR REPLACE FUNCTION public.admin_finalize_curriculum_import(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  course_key uuid;
  pack_codes text[];
  pack_lessons uuid[];
  missing_modules text;
  missing_lessons integer;
  archive_key uuid;
  archived integer := 0;
  hidden integer := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator required' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(payload) IS DISTINCT FROM 'object'
     OR payload->>'format' IS DISTINCT FROM 'metodo-ia-real/curriculum@1' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: format must be metodo-ia-real/curriculum@1'
      USING ERRCODE = '22023';
  END IF;
  course_key := private.pack_uuid(payload->'course_id', 'course_id');
  pack_codes := private.pack_text_array(payload->'module_codes', 'module_codes');
  IF cardinality(pack_codes) = 0
     OR EXISTS (SELECT 1 FROM unnest(pack_codes) AS k(code) WHERE k.code !~ '^MOD-[0-9]{2}$') THEN
    RAISE EXCEPTION 'Invalid curriculum pack: module_codes must list codes like MOD-00'
      USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(payload->'lesson_ids') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid curriculum pack: lesson_ids must be a list' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(payload->'lesson_ids') = 0 THEN
    RAISE EXCEPTION 'Invalid curriculum pack: lesson_ids must not be empty' USING ERRCODE = '22023';
  END IF;
  pack_lessons := ARRAY(SELECT private.pack_uuid(e.item, format('lesson_ids %s', e.idx))
    FROM jsonb_array_elements(payload->'lesson_ids') WITH ORDINALITY AS e(item, idx));

  PERFORM pg_advisory_xact_lock(hashtext('curriculum-import:' || course_key::text));

  IF NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_key) THEN
    RAISE EXCEPTION 'Import incomplete: course % was not imported', course_key USING ERRCODE = '55000';
  END IF;
  SELECT string_agg(DISTINCT k.code, ', ' ORDER BY k.code) INTO missing_modules
  FROM unnest(pack_codes) AS k(code)
  WHERE NOT EXISTS (SELECT 1 FROM public.modules m WHERE m.course_id = course_key AND m.code = k.code);
  IF missing_modules IS NOT NULL THEN
    RAISE EXCEPTION 'Import incomplete: modules % were not imported', missing_modules USING ERRCODE = '55000';
  END IF;
  -- Every pack lesson must sit in one of the pack modules of this course.
  SELECT count(*) INTO missing_lessons FROM unnest(pack_lessons) AS k(id)
  WHERE NOT EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
    WHERE l.id = k.id AND m.course_id = course_key AND m.code = ANY(pack_codes));
  IF missing_lessons > 0 THEN
    RAISE EXCEPTION 'Import incomplete: % lesson(s) of the pack are missing', missing_lessons
      USING ERRCODE = '55000';
  END IF;

  SELECT m.id INTO archive_key FROM public.modules m
  WHERE m.course_id = course_key AND m.slug = 'arquivo-versao-anterior'
  ORDER BY m.created_at NULLS LAST, m.id LIMIT 1;
  IF archive_key IS NULL THEN
    INSERT INTO public.modules(course_id, slug, title, description, order_index, is_published, code)
    VALUES (course_key, 'arquivo-versao-anterior', 'Arquivo — aulas da versão anterior',
      'Aulas da versão anterior do curso, guardadas com o progresso dos alunos.', 999, false, NULL)
    RETURNING id INTO archive_key;
  ELSE
    UPDATE public.modules m SET is_published = false, code = NULL
    WHERE m.id = archive_key AND (m.is_published IS DISTINCT FROM false OR m.code IS NOT NULL);
  END IF;

  UPDATE public.lessons l SET module_id = archive_key
  FROM public.modules m
  WHERE m.id = l.module_id AND m.course_id = course_key AND m.id <> archive_key
    AND l.id <> ALL(pack_lessons);
  GET DIAGNOSTICS archived = ROW_COUNT;

  UPDATE public.modules m SET is_published = false
  WHERE m.course_id = course_key AND m.id <> archive_key
    AND (m.code IS NULL OR m.code <> ALL(pack_codes))
    AND m.is_published IS DISTINCT FROM false;
  GET DIAGNOSTICS hidden = ROW_COUNT;

  UPDATE public.modules m SET is_published = true
  WHERE m.course_id = course_key AND m.code = ANY(pack_codes) AND m.is_published IS DISTINCT FROM true;
  UPDATE public.courses c SET is_published = true, updated_at = now()
  WHERE c.id = course_key AND c.is_published IS DISTINCT FROM true;

  RETURN jsonb_build_object('archived_lessons', archived, 'hidden_modules', hidden,
    'archive_module_id', archive_key);
END;
$$;

-- 9. Privileges ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_course_outline(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_certificate_status() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.issue_certificate() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_import_curriculum_module(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_finalize_curriculum_import(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_outline(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_certificate_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_certificate() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_import_curriculum_module(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_finalize_curriculum_import(jsonb) TO authenticated;
REVOKE ALL ON FUNCTION private.certificate_status(uuid),
  private.pack_text(jsonb, text, boolean), private.pack_integer(jsonb, text, integer, integer),
  private.pack_number(jsonb, text, numeric, numeric), private.pack_boolean(jsonb, text),
  private.pack_uuid(jsonb, text), private.pack_date(jsonb, text),
  private.pack_text_array(jsonb, text), private.pack_questions(jsonb, text)
FROM PUBLIC, anon, authenticated;
COMMIT;
