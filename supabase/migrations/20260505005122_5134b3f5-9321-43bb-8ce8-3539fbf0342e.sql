CREATE OR REPLACE FUNCTION public.admin_get_user_email(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor')) THEN
    RAISE EXCEPTION 'admins/instructors only';
  END IF;
  SELECT email INTO result FROM auth.users WHERE id = _user_id;
  RETURN result;
END;
$$;