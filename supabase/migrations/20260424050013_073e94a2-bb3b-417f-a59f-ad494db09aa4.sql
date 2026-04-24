
-- 1. lab_questions
create table public.lab_questions (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  question_number integer not null,
  question text not null,
  options jsonb not null,           -- array of strings
  correct_index integer not null,
  explanation text,
  points integer not null default 5,
  unique (lab_id, question_number)
);

alter table public.lab_questions enable row level security;

create policy "lab_questions read all auth"
  on public.lab_questions for select to authenticated using (true);

create policy "lab_questions admin write"
  on public.lab_questions for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2. question_responses
create table public.question_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.lab_attempts(id) on delete cascade,
  question_id uuid not null references public.lab_questions(id) on delete cascade,
  selected_index integer not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

alter table public.question_responses enable row level security;

create policy "responses select via attempt"
  on public.question_responses for select to authenticated
  using (exists (
    select 1 from public.lab_attempts a
    where a.id = question_responses.attempt_id
      and (a.user_id = auth.uid()
           or public.has_role(auth.uid(),'instructor')
           or public.has_role(auth.uid(),'admin'))
  ));

create policy "responses insert via own attempt"
  on public.question_responses for insert to authenticated
  with check (exists (
    select 1 from public.lab_attempts a
    where a.id = question_responses.attempt_id
      and a.user_id = auth.uid()
  ));

create policy "responses update via own attempt"
  on public.question_responses for update to authenticated
  using (exists (
    select 1 from public.lab_attempts a
    where a.id = question_responses.attempt_id
      and a.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.lab_attempts a
    where a.id = question_responses.attempt_id
      and a.user_id = auth.uid()
  ));

create index idx_lab_questions_lab on public.lab_questions(lab_id, question_number);
create index idx_question_responses_attempt on public.question_responses(attempt_id);
