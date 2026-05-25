
-- 1. Fix {public} -> {authenticated} on tenant_* tables
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('tenant_classified_files','tenant_dlp_policies','tenant_sensitivity_labels')
      AND 'public' = ANY(roles)
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Revoke EXECUTE on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_get_user_email(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_grant_access_by_email(text, program_code) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_tenant() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reset_user_lab_progress(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.seed_tenant(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_learner_progress(uuid) FROM anon;

-- 3. Realtime: require authentication for any subscription
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "authenticated can receive realtime"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (true);

-- 4. lab_questions: hide correct_index/explanation from clients
DROP POLICY IF EXISTS "lab_questions read all auth" ON public.lab_questions;
CREATE POLICY "lab_questions staff read"
  ON public.lab_questions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'instructor'::app_role));

CREATE OR REPLACE VIEW public.lab_questions_safe
WITH (security_invoker = on) AS
SELECT id, lab_id, question_number, question, options, points
FROM public.lab_questions;

GRANT SELECT ON public.lab_questions_safe TO authenticated;

-- Allow learners to read questions (without answer) via the view by adding a
-- supplementary SELECT policy limited to safe columns is not possible; the view
-- bypasses the table policy because the view owner (postgres) reads it. To keep
-- the view usable for learners, switch view to SECURITY DEFINER style:
ALTER VIEW public.lab_questions_safe SET (security_invoker = off);

-- Server-side answer checker
CREATE OR REPLACE FUNCTION public.check_quiz_answer(
  _attempt_id uuid,
  _question_id uuid,
  _selected_index int
) RETURNS TABLE(is_correct boolean, correct_index int, explanation text, points int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q RECORD;
  a RECORD;
BEGIN
  SELECT * INTO a FROM public.lab_attempts WHERE id = _attempt_id;
  IF a IS NULL OR a.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  SELECT * INTO q FROM public.lab_questions WHERE id = _question_id;
  IF q IS NULL THEN
    RAISE EXCEPTION 'question not found';
  END IF;
  INSERT INTO public.question_responses(attempt_id, question_id, selected_index, is_correct)
  VALUES (_attempt_id, _question_id, _selected_index, _selected_index = q.correct_index)
  ON CONFLICT (attempt_id, question_id) DO UPDATE
    SET selected_index = EXCLUDED.selected_index,
        is_correct = EXCLUDED.is_correct,
        answered_at = now();
  RETURN QUERY SELECT (_selected_index = q.correct_index), q.correct_index, q.explanation, q.points;
END $$;

REVOKE EXECUTE ON FUNCTION public.check_quiz_answer(uuid, uuid, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, uuid, int) TO authenticated;
