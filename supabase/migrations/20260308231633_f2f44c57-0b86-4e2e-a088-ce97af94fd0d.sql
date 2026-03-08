
-- =====================================================
-- 1. NEW TABLE: courses
-- =====================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours DECIMAL(5,1),
  is_published BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT USING (is_published = true);

-- Admins can manage all courses
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 2. NEW TABLE: plans
-- =====================================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]',
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 3. NEW TABLE: subscriptions
-- =====================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_active_user ON public.subscriptions(user_id) WHERE status = 'active';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 4. NEW TABLE: quizzes
-- =====================================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quizzes"
  ON public.quizzes FOR SELECT USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 5. NEW TABLE: quiz_attempts
-- =====================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quiz attempts"
  ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. NEW TABLE: sandbox_sessions
-- =====================================================
CREATE TABLE public.sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  model_used TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sandbox_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sandbox sessions"
  ON public.sandbox_sessions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 7. NEW TABLE: achievements
-- =====================================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 8. NEW TABLE: user_achievements
-- =====================================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all achievements for leaderboard"
  ON public.user_achievements FOR SELECT USING (true);

-- =====================================================
-- 9. ALTER EXISTING: modules (add course_id, slug, is_published)
-- =====================================================
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- =====================================================
-- 10. ALTER EXISTING: lessons (add type, slug, is_free, estimated_minutes)
-- =====================================================
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'exercise', 'quiz', 'project', 'sandbox')),
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 10;

-- =====================================================
-- 11. ALTER EXISTING: lesson_progress (add status, started_at, time_spent_seconds, score)
-- =====================================================
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);

-- =====================================================
-- 12. ALTER EXISTING: profiles (add bio, onboarding_done)
-- =====================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 13. INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_user ON public.sandbox_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
