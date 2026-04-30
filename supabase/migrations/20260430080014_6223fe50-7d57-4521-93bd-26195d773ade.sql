-- Helper: add admin-all policy if missing
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles','lab_attempts','step_progress','question_responses','tutor_messages',
    'user_badges','batch_enrollments','instructor_lab_overrides',
    'tenant_users','tenant_groups','tenant_group_members','tenant_role_assignments',
    'tenant_ca_policies','tenant_devices','tenant_sign_in_logs','tenant_incidents',
    'tenant_alerts','tenant_audit_logs','tenant_sensitivity_labels',
    'tenant_dlp_policies','tenant_classified_files'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "%s admin all" ON public.%I',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY "%s admin all" ON public.%I AS PERMISSIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))',
      t, t
    );
  END LOOP;
END $$;

-- Allow admins to delete lab_attempts / step_progress / question_responses / tutor_messages / user_badges
-- (the ALL policy above already covers this, but ensure no conflicting restrictive policy exists)

-- Profiles: allow admins to insert/delete profiles too (handled by ALL policy above)

-- Announcements already permits admin write; ensure admin can also delete (covered).

-- Make sure admins can read profiles for any user (already covered by existing select policy via has_role)
