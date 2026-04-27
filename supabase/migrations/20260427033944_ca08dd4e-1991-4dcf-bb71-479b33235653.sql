-- Generic timestamp trigger (created if missing)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enum for the two programs
CREATE TYPE public.program_code AS ENUM ('soc', 'itsm');

-- Leads / enrollment requests (public can submit)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  program program_code NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit enrollment"
  ON public.enrollments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins read enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER enrollments_set_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-user program access, granted by admin
CREATE TABLE public.program_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program program_code NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, program)
);

ALTER TABLE public.program_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own access"
  ON public.program_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins grant access"
  ON public.program_access FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins revoke access"
  ON public.program_access FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.has_program_access(_user_id UUID, _program program_code)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.program_access
    WHERE user_id = _user_id AND program = _program
  ) OR public.has_role(_user_id, 'admin'::app_role);
$$;

CREATE INDEX idx_enrollments_status ON public.enrollments(status, created_at DESC);
CREATE INDEX idx_program_access_user ON public.program_access(user_id);