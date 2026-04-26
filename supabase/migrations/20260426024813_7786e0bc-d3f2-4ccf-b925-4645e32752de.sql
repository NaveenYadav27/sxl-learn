CREATE OR REPLACE FUNCTION public.reset_user_lab_progress(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reset lab progress';
  END IF;

  DELETE FROM public.question_responses
    WHERE attempt_id IN (SELECT id FROM public.lab_attempts WHERE user_id = _user_id);
  DELETE FROM public.step_progress
    WHERE attempt_id IN (SELECT id FROM public.lab_attempts WHERE user_id = _user_id);
  DELETE FROM public.lab_attempts WHERE user_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_user_lab_progress(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reset_user_lab_progress(uuid) TO authenticated;