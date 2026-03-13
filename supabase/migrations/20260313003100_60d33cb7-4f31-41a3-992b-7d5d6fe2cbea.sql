
-- Allow users to insert their own achievements (for client-side awarding)
CREATE POLICY "Users can earn achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed default achievements if table is empty
INSERT INTO public.achievements (slug, title, description, icon, points, criteria) VALUES
  ('first-lesson', 'Primeiro Passo', 'Complete sua primeira aula', 'play', 10, '{"type": "lessons_completed", "count": 1}'),
  ('five-lessons', 'Estudante Dedicado', 'Complete 5 aulas', 'book-open', 25, '{"type": "lessons_completed", "count": 5}'),
  ('ten-lessons', 'Conhecedor', 'Complete 10 aulas', 'graduation-cap', 50, '{"type": "lessons_completed", "count": 10}'),
  ('twenty-lessons', 'Expert em Formação', 'Complete 20 aulas', 'award', 100, '{"type": "lessons_completed", "count": 20}'),
  ('first-post', 'Voz Ativa', 'Crie seu primeiro post na comunidade', 'message-circle', 15, '{"type": "posts_count", "count": 1}'),
  ('five-posts', 'Influenciador', 'Crie 5 posts na comunidade', 'pen-tool', 30, '{"type": "posts_count", "count": 5}'),
  ('ten-comments', 'Colaborador', 'Faça 10 comentários', 'message-square', 20, '{"type": "comments_count", "count": 10}'),
  ('first-streak-3', 'Em Chamas', 'Alcance 3 dias seguidos de estudo', 'flame', 30, '{"type": "streak", "count": 3}'),
  ('streak-7', 'Semana Perfeita', 'Alcance 7 dias seguidos de estudo', 'flame', 75, '{"type": "streak", "count": 7}'),
  ('hundred-points', 'Centurião', 'Alcance 100 pontos', 'star', 20, '{"type": "points", "count": 100}'),
  ('five-hundred-points', 'Elite', 'Alcance 500 pontos', 'crown', 50, '{"type": "points", "count": 500}')
ON CONFLICT (slug) DO NOTHING;
