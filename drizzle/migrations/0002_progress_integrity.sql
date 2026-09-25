BEGIN;
-- Recalculate from records rather than awarding points again on every toggle/retry.
CREATE FUNCTION private.refresh_points(target uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE posts integer; comments integer; likes integer; lessons integer; total integer;
BEGIN
  IF target IS NULL THEN RETURN; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('points:' || target::text));
  SELECT count(*) INTO posts FROM public.community_posts WHERE user_id = target;
  SELECT count(*) INTO comments FROM public.community_comments WHERE user_id = target;
  SELECT count(*) INTO likes FROM public.post_likes l JOIN public.community_posts p ON p.id = l.post_id
    WHERE p.user_id = target AND l.user_id <> target;
  SELECT count(*) INTO lessons FROM public.lesson_progress WHERE user_id = target AND completed = true;
  total := posts * 15 + comments * 5 + likes * 3 + lessons * 10;
  INSERT INTO public.user_points(user_id,points,posts_count,comments_count,likes_received,lessons_completed,level)
    VALUES(target,total,posts,comments,likes,lessons,1 + (SELECT count(*) FROM unnest(ARRAY[50,150,300,500,800,1200,1800,2500,3500]) n WHERE total >= n))
    ON CONFLICT(user_id) DO UPDATE SET points = EXCLUDED.points, posts_count = EXCLUDED.posts_count,
      comments_count = EXCLUDED.comments_count, likes_received = EXCLUDED.likes_received,
      lessons_completed = EXCLUDED.lessons_completed, level = EXCLUDED.level, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION private.refresh_points(uuid) FROM PUBLIC;
CREATE FUNCTION private.refresh_points_trigger() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target uuid; post uuid;
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'DELETE' THEN post := OLD.post_id; ELSE post := NEW.post_id; END IF;
    SELECT user_id INTO target FROM public.community_posts WHERE id = post;
  ELSE
    IF TG_OP = 'DELETE' THEN target := OLD.user_id; ELSE target := NEW.user_id; END IF;
  END IF;
  PERFORM private.refresh_points(target);
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
DROP TRIGGER on_community_post_created ON public.community_posts;
DROP TRIGGER on_community_comment_created ON public.community_comments;
DROP TRIGGER on_post_like_created ON public.post_likes;
DROP TRIGGER on_lesson_completed ON public.lesson_progress;
CREATE TRIGGER refresh_post_points AFTER INSERT OR DELETE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION private.refresh_points_trigger();
CREATE TRIGGER refresh_comment_points AFTER INSERT OR DELETE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION private.refresh_points_trigger();
CREATE TRIGGER refresh_like_points AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION private.refresh_points_trigger();
CREATE TRIGGER refresh_lesson_points AFTER INSERT OR UPDATE OR DELETE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION private.refresh_points_trigger();

DROP POLICY "Users can upsert own streak" ON public.user_streaks;
DROP POLICY "Users can update own streak" ON public.user_streaks;
CREATE FUNCTION public.record_study_day() RETURNS SETOF public.user_streaks
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE student uuid := auth.uid(); today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF student IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  RETURN QUERY INSERT INTO public.user_streaks AS s(user_id,current_streak,longest_streak,last_activity_date)
    VALUES(student,1,1,today)
    ON CONFLICT(user_id) DO UPDATE SET
      current_streak = CASE WHEN s.last_activity_date = today THEN s.current_streak WHEN s.last_activity_date = today - 1 THEN s.current_streak + 1 ELSE 1 END,
      longest_streak = greatest(s.longest_streak, CASE WHEN s.last_activity_date = today THEN s.current_streak WHEN s.last_activity_date = today - 1 THEN s.current_streak + 1 ELSE 1 END),
      last_activity_date = today, updated_at = now()
    RETURNING *;
END;
$$;
REVOKE ALL ON FUNCTION public.record_study_day() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_study_day() TO authenticated;

CREATE FUNCTION private.badge_eligible(badge uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS(SELECT 1 FROM public.badges b CROSS JOIN public.user_points p
 WHERE b.id = badge AND p.user_id = auth.uid() AND CASE b.icon
 WHEN 'play' THEN p.lessons_completed >= 1 WHEN 'book-open' THEN p.lessons_completed >= 10
 WHEN 'graduation-cap' THEN p.lessons_completed >= 30 WHEN 'message-circle' THEN p.posts_count >= 1
 WHEN 'pen-tool' THEN p.posts_count >= 5 WHEN 'heart' THEN p.likes_received >= 10
 WHEN 'star' THEN p.likes_received >= 50 WHEN 'message-square' THEN p.comments_count >= 10
 WHEN 'messages-square' THEN p.comments_count >= 25 WHEN 'crown' THEN p.points >= 1000
 ELSE p.points >= b.points_required END)
$$;
CREATE FUNCTION private.achievement_eligible(achievement uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS(SELECT 1 FROM public.achievements a
 LEFT JOIN public.user_points p ON p.user_id = auth.uid()
 LEFT JOIN public.user_streaks s ON s.user_id = auth.uid()
 WHERE a.id = achievement AND CASE a.criteria->>'type'
 WHEN 'lessons_completed' THEN coalesce(p.lessons_completed,0) WHEN 'posts_count' THEN coalesce(p.posts_count,0)
 WHEN 'comments_count' THEN coalesce(p.comments_count,0) WHEN 'points' THEN coalesce(p.points,0)
 WHEN 'streak' THEN coalesce(s.longest_streak,0) ELSE -1 END >= (a.criteria->>'count')::integer)
$$;
REVOKE ALL ON FUNCTION private.badge_eligible(uuid), private.achievement_eligible(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.badge_eligible(uuid), private.achievement_eligible(uuid) TO authenticated;
DROP POLICY "Users can earn badges" ON public.user_badges;
CREATE POLICY "Users can earn eligible badges" ON public.user_badges FOR INSERT TO authenticated
WITH CHECK(user_id = auth.uid() AND private.badge_eligible(badge_id));
DROP POLICY "Users can earn achievements" ON public.user_achievements;
CREATE POLICY "Users can earn eligible achievements" ON public.user_achievements FOR INSERT TO authenticated
WITH CHECK(user_id = auth.uid() AND private.achievement_eligible(achievement_id));

DROP POLICY "Users can manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can read own quiz attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING(user_id = auth.uid());
CREATE FUNCTION public.submit_quiz_attempt(quiz_identifier uuid, submitted_answers jsonb, attempt_key uuid, seconds_spent integer DEFAULT NULL)
RETURNS SETOF public.quiz_attempts LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE student uuid := auth.uid(); q public.quizzes; correct integer; total integer; grade numeric;
BEGIN
 IF student IS NULL OR NOT private.paid_access() THEN RAISE EXCEPTION 'Paid access required' USING ERRCODE = '42501'; END IF;
 IF attempt_key IS NULL OR jsonb_typeof(submitted_answers) <> 'object' THEN RAISE EXCEPTION 'Invalid attempt'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('quiz:' || student::text || quiz_identifier::text));
 IF EXISTS(SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_key AND a.user_id = student AND a.quiz_id = quiz_identifier) THEN
   RETURN QUERY SELECT * FROM public.quiz_attempts a WHERE a.id = attempt_key; RETURN;
 END IF;
 SELECT * INTO q FROM public.quizzes WHERE id = quiz_identifier;
 IF q.id IS NULL OR jsonb_array_length(q.questions) = 0 THEN RAISE EXCEPTION 'Quiz unavailable'; END IF;
 IF (SELECT count(*) FROM public.quiz_attempts a WHERE a.user_id = student AND a.quiz_id = q.id) >= coalesce(q.max_attempts,3) THEN
   RAISE EXCEPTION 'Maximum attempts reached' USING ERRCODE = '42501';
 END IF;
 total := jsonb_array_length(q.questions);
 SELECT count(*) INTO correct FROM jsonb_array_elements(q.questions) WITH ORDINALITY AS e(question, idx)
   WHERE submitted_answers->>((idx-1)::text) = question->>'correct';
 grade := round(correct * 100.0 / total);
 RETURN QUERY INSERT INTO public.quiz_attempts(id,user_id,quiz_id,answers,score,passed,time_spent_seconds)
 VALUES(attempt_key,student,q.id,submitted_answers,grade,grade >= coalesce(q.passing_score,70),least(greatest(seconds_spent,0),86400)) RETURNING *;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid,jsonb,uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid,jsonb,uuid,integer) TO authenticated;
COMMIT;