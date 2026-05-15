
CREATE TABLE public.k8s_trials (
  user_id UUID PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.k8s_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "k8s_trials select own or admin"
ON public.k8s_trials FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "k8s_trials insert own"
ON public.k8s_trials FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "k8s_trials admin all"
ON public.k8s_trials FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
