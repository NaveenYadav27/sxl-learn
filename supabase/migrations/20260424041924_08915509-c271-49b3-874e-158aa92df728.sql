-- ============ ROLES ============
create type public.app_role as enum ('learner', 'instructor', 'admin');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- security definer role checker
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ AUTO PROFILE + DEFAULT LEARNER ROLE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'learner');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============ COURSE STRUCTURE ============
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  domain_code text not null,    -- e.g. SC900-D1
  exam_weight text,              -- e.g. "10-15%"
  sort_order int not null default 0,
  icon text,
  created_at timestamptz not null default now()
);
alter table public.modules enable row level security;

create table public.labs (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  scenario text,                 -- industry context
  objective text,
  difficulty text not null default 'beginner', -- beginner|intermediate|advanced
  duration_min int not null default 15,
  simulator text not null,       -- entra | defender | purview | sentinel | generic
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.labs enable row level security;

create table public.lab_steps (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  step_number int not null,
  title text not null,
  instructions text not null,
  hint text,
  expected_action jsonb,         -- validation contract for the simulator
  points int not null default 10,
  unique (lab_id, step_number)
);
alter table public.lab_steps enable row level security;

-- ============ LEARNER PROGRESS ============
create table public.lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  status text not null default 'in_progress', -- in_progress|completed|abandoned
  score int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.lab_attempts enable row level security;

create table public.step_progress (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.lab_attempts(id) on delete cascade,
  step_id uuid not null references public.lab_steps(id) on delete cascade,
  completed boolean not null default false,
  attempts int not null default 0,
  completed_at timestamptz,
  unique (attempt_id, step_id)
);
alter table public.step_progress enable row level security;

-- ============ BADGES ============
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);
alter table public.badges enable row level security;

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
alter table public.user_badges enable row level security;

-- ============ AI TUTOR MESSAGES ============
create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid references public.lab_attempts(id) on delete cascade,
  role text not null, -- user | assistant | system
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.tutor_messages enable row level security;

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles select self or staff" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'instructor') or public.has_role(auth.uid(), 'admin'));
create policy "profiles update self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- user_roles
create policy "user_roles select self or admin" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "user_roles admin manage" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- modules / labs / lab_steps: readable by all signed-in, writable by admin
create policy "modules read all auth" on public.modules for select to authenticated using (true);
create policy "modules admin write" on public.modules for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "labs read all auth" on public.labs for select to authenticated using (true);
create policy "labs admin write" on public.labs for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "lab_steps read all auth" on public.lab_steps for select to authenticated using (true);
create policy "lab_steps admin write" on public.lab_steps for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- lab_attempts
create policy "attempts select self or staff" on public.lab_attempts for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'instructor') or public.has_role(auth.uid(), 'admin'));
create policy "attempts insert self" on public.lab_attempts for insert to authenticated
  with check (user_id = auth.uid());
create policy "attempts update self" on public.lab_attempts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- step_progress
create policy "step_progress select via attempt" on public.step_progress for select to authenticated
  using (exists (select 1 from public.lab_attempts a where a.id = attempt_id
    and (a.user_id = auth.uid() or public.has_role(auth.uid(), 'instructor') or public.has_role(auth.uid(), 'admin'))));
create policy "step_progress insert via own attempt" on public.step_progress for insert to authenticated
  with check (exists (select 1 from public.lab_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "step_progress update via own attempt" on public.step_progress for update to authenticated
  using (exists (select 1 from public.lab_attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.lab_attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- badges
create policy "badges read all auth" on public.badges for select to authenticated using (true);
create policy "badges admin write" on public.badges for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "user_badges select self or staff" on public.user_badges for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'instructor') or public.has_role(auth.uid(), 'admin'));
create policy "user_badges insert self" on public.user_badges for insert to authenticated
  with check (user_id = auth.uid());

-- tutor_messages
create policy "tutor select self" on public.tutor_messages for select to authenticated
  using (user_id = auth.uid());
create policy "tutor insert self" on public.tutor_messages for insert to authenticated
  with check (user_id = auth.uid());
