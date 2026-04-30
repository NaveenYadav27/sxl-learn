-- ============================================================
-- LMS expansion: cohorts, announcements, instructor overrides,
-- auto-grant on signup, admin grant-by-email, helper RPCs
-- ============================================================

-- 1. BATCHES (cohorts) -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program     program_code NOT NULL,
  name        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,
  capacity    INTEGER NOT NULL DEFAULT 30,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_batches_program ON public.batches(program);
CREATE INDEX IF NOT EXISTS idx_batches_instructor ON public.batches(instructor_id);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batches readable by all auth"
  ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "batches admin write"
  ON public.batches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER batches_touch_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. BATCH ENROLLMENTS -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batch_enrollments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(batch_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_batch_enroll_user ON public.batch_enrollments(user_id);

ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batch_enroll select self/staff"
  ON public.batch_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "batch_enroll admin write"
  ON public.batch_enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. ANNOUNCEMENTS -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id    UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  program     program_code,            -- nullable; if set & batch_id null = program-wide
  author_id   UUID NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  pinned      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcements_batch ON public.announcements(batch_id);
CREATE INDEX IF NOT EXISTS idx_announcements_program ON public.announcements(program);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Learner can read announcements for batches they belong to or programs they have access to
CREATE POLICY "announcements read for members"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
    OR (batch_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.batch_enrollments be
        WHERE be.batch_id = announcements.batch_id AND be.user_id = auth.uid()))
    OR (program IS NOT NULL AND public.has_program_access(auth.uid(), program))
  );
CREATE POLICY "announcements instructor/admin write"
  ON public.announcements FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'instructor') AND author_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'instructor') AND author_id = auth.uid())
  );

-- 4. INSTRUCTOR LAB OVERRIDES (manual mark-complete + feedback) -------
CREATE TABLE IF NOT EXISTS public.instructor_lab_overrides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,           -- learner
  lab_id        UUID NOT NULL,
  status        TEXT NOT NULL DEFAULT 'completed',  -- completed | needs_rework
  feedback      TEXT,
  instructor_id UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id)
);
CREATE INDEX IF NOT EXISTS idx_overrides_user ON public.instructor_lab_overrides(user_id);

ALTER TABLE public.instructor_lab_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "overrides select self/staff"
  ON public.instructor_lab_overrides FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
  );
CREATE POLICY "overrides instructor write"
  ON public.instructor_lab_overrides FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'instructor') AND instructor_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'instructor') AND instructor_id = auth.uid())
  );

-- 5. AUTO-GRANT ACCESS WHEN A NEW USER SIGNS UP -----------------------
-- Match enrollments by email (status='enrolled') and grant program_access.
CREATE OR REPLACE FUNCTION public.auto_grant_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e RECORD;
BEGIN
  FOR e IN
    SELECT program FROM public.enrollments
    WHERE lower(email) = lower(NEW.email) AND status = 'enrolled'
  LOOP
    INSERT INTO public.program_access (user_id, program, granted_by)
    VALUES (NEW.id, e.program, NULL)
    ON CONFLICT DO NOTHING;
    -- mark enrollment as linked
    UPDATE public.enrollments
    SET user_id = NEW.id, status = 'active'
    WHERE lower(email) = lower(NEW.email) AND program = e.program;
  END LOOP;
  RETURN NEW;
END;
$$;

-- Add to existing handle_new_user trigger chain (attach as separate trigger)
DROP TRIGGER IF EXISTS on_auth_user_created_grant ON auth.users;
CREATE TRIGGER on_auth_user_created_grant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_on_signup();

-- 6. ADMIN ONE-CLICK GRANT BY EMAIL -----------------------------------
CREATE OR REPLACE FUNCTION public.admin_grant_access_by_email(_email TEXT, _program program_code)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admins only';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;

  -- Always update enrollments
  UPDATE public.enrollments
  SET status = 'enrolled', user_id = target_id
  WHERE lower(email) = lower(_email) AND program = _program;

  IF target_id IS NULL THEN
    -- No user yet; will be auto-granted on signup
    RETURN 'pending_signup';
  END IF;

  INSERT INTO public.program_access (user_id, program, granted_by)
  VALUES (target_id, _program, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN 'granted';
END;
$$;

-- 7. PROGRESS HELPER for instructor view ------------------------------
CREATE OR REPLACE FUNCTION public.get_learner_progress(_user_id UUID)
RETURNS TABLE(
  total_labs        INTEGER,
  completed_labs    INTEGER,
  last_active_at    TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::int FROM public.labs WHERE is_published)                              AS total_labs,
    (SELECT COUNT(*)::int FROM public.lab_attempts WHERE user_id = _user_id AND status = 'completed') AS completed_labs,
    (SELECT MAX(started_at) FROM public.lab_attempts WHERE user_id = _user_id)              AS last_active_at;
$$;

-- 8. Allow instructors to read other learners' progress + lab_attempts (already enabled via existing policy)
-- existing 'attempts select self or staff' already covers instructors
