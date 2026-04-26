ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pdi_instance_url text;