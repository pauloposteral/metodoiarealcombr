-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  color TEXT NOT NULL DEFAULT 'gold',
  category TEXT NOT NULL DEFAULT 'engagement',
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_points table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  posts_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  likes_received INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- User points policies
CREATE POLICY "Users can view all points (for leaderboard)"
  ON public.user_points FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own points"
  ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view all badges earned"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can earn badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on user_points
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, category, points_required) VALUES
  ('Primeiro Passo', 'Completou sua primeira aula', 'play', 'blue', 'progress', 10),
  ('Estudante Dedicado', 'Completou 10 aulas', 'book-open', 'green', 'progress', 100),
  ('Mestre do Conhecimento', 'Completou todas as aulas', 'graduation-cap', 'gold', 'progress', 500),
  ('Voz Ativa', 'Fez sua primeira publicação', 'message-circle', 'purple', 'engagement', 20),
  ('Contribuidor', 'Fez 5 publicações', 'pen-tool', 'orange', 'engagement', 100),
  ('Influenciador', 'Recebeu 10 curtidas', 'heart', 'red', 'social', 50),
  ('Popular', 'Recebeu 50 curtidas', 'star', 'gold', 'social', 200),
  ('Comentarista', 'Fez 10 comentários', 'message-square', 'teal', 'engagement', 50),
  ('Participativo', 'Fez 25 comentários', 'messages-square', 'indigo', 'engagement', 125),
  ('Lenda da Comunidade', 'Alcançou 1000 pontos', 'crown', 'gold', 'milestone', 1000);

-- Create function to update user points on various actions
CREATE OR REPLACE FUNCTION public.update_user_points_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, points, posts_count)
  VALUES (NEW.user_id, 15, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = user_points.points + 15,
    posts_count = user_points.posts_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_points_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, points, comments_count)
  VALUES (NEW.user_id, 5, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = user_points.points + 5,
    comments_count = user_points.comments_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_points_on_like_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.community_posts WHERE id = NEW.post_id;
  
  IF post_owner_id IS NOT NULL THEN
    INSERT INTO public.user_points (user_id, points, likes_received)
    VALUES (post_owner_id, 3, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = user_points.points + 3,
      likes_received = user_points.likes_received + 1,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_points_on_lesson_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
    INSERT INTO public.user_points (user_id, points, lessons_completed)
    VALUES (NEW.user_id, 10, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = user_points.points + 10,
      lessons_completed = user_points.lessons_completed + 1,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for automatic point updates
CREATE TRIGGER on_community_post_created
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_on_post();

CREATE TRIGGER on_community_comment_created
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_on_comment();

CREATE TRIGGER on_post_like_created
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_on_like_received();

CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_on_lesson_complete();