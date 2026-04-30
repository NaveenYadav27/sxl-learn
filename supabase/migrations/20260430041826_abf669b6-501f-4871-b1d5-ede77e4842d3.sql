REVOKE EXECUTE ON FUNCTION public.admin_grant_access_by_email(TEXT, program_code) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_learner_progress(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_grant_access_by_email(TEXT, program_code) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_learner_progress(UUID) TO authenticated;