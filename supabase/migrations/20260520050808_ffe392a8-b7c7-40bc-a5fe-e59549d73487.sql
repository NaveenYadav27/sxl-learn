-- Add SSID (admin-assigned) and email cache to profiles for the admin users console
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ssid TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_ssid_unique ON public.profiles(ssid) WHERE ssid IS NOT NULL;

-- Backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Update new-user handler to also persist email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'learner');
  PERFORM public.seed_tenant(new.id);
  RETURN new;
END;
$function$;