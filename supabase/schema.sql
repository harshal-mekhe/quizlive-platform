-- QuizLive — Phase 1 database schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Custom types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'participant');
create type public.quiz_status as enum ('draft', 'published', 'archived');
create type public.session_status as enum ('waiting', 'active', 'ended');

-- ---------------------------------------------------------------------------
-- Profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role public.user_role not null default 'participant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Quizzes
-- ---------------------------------------------------------------------------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  status public.quiz_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quizzes_admin_id_idx on public.quizzes (admin_id);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  order_index integer not null default 0,
  time_limit_seconds integer,
  created_at timestamptz not null default now()
);

create index questions_quiz_id_idx on public.questions (quiz_id);

-- ---------------------------------------------------------------------------
-- Quiz sessions (live runs)
-- ---------------------------------------------------------------------------
create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  session_code text not null unique,
  status public.session_status not null default 'waiting',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index quiz_sessions_quiz_id_idx on public.quiz_sessions (quiz_id);
create index quiz_sessions_code_idx on public.quiz_sessions (session_code);

-- ---------------------------------------------------------------------------
-- Participants
-- ---------------------------------------------------------------------------
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  nickname text not null,
  score integer not null default 0,
  joined_at timestamptz not null default now()
);

create index participants_session_id_idx on public.participants (session_id);

-- ---------------------------------------------------------------------------
-- Answers
-- ---------------------------------------------------------------------------
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null default false,
  answered_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

create index answers_participant_id_idx on public.answers (participant_id);
create index answers_question_id_idx on public.answers (question_id);

-- ---------------------------------------------------------------------------
-- Leaderboard (materialized ranking per session — logic in later phase)
-- ---------------------------------------------------------------------------
create table public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  rank integer not null,
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (session_id, participant_id)
);

create index leaderboard_session_id_idx on public.leaderboard (session_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.owns_quiz(quiz_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quizzes
    where id = quiz_uuid
      and admin_id = auth.uid()
  );
$$;

create or replace function public.owns_session(session_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quiz_sessions qs
    join public.quizzes q on q.id = qs.quiz_id
    where qs.id = session_uuid
      and q.admin_id = auth.uid()
  );
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.user_role;
begin
  user_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'participant'
  );

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    user_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for profiles and quizzes
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.participants enable row level security;
alter table public.answers enable row level security;
alter table public.leaderboard enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Quizzes (admin only)
create policy "Admins can view own quizzes"
  on public.quizzes for select
  using (public.is_admin() and admin_id = auth.uid());

create policy "Admins can create quizzes"
  on public.quizzes for insert
  with check (public.is_admin() and admin_id = auth.uid());

create policy "Admins can update own quizzes"
  on public.quizzes for update
  using (public.is_admin() and admin_id = auth.uid())
  with check (public.is_admin() and admin_id = auth.uid());

create policy "Admins can delete own quizzes"
  on public.quizzes for delete
  using (public.is_admin() and admin_id = auth.uid());

-- Questions
create policy "Admins can manage questions for own quizzes"
  on public.questions for all
  using (public.is_admin() and public.owns_quiz(quiz_id))
  with check (public.is_admin() and public.owns_quiz(quiz_id));

-- Quiz sessions
create policy "Admins can manage sessions for own quizzes"
  on public.quiz_sessions for all
  using (public.is_admin() and public.owns_quiz(quiz_id))
  with check (public.is_admin() and public.owns_quiz(quiz_id));

-- Participants (admin read for now; insert opened in later phase for join flow)
create policy "Admins can view participants in own sessions"
  on public.participants for select
  using (public.is_admin() and public.owns_session(session_id));

-- Answers
create policy "Admins can view answers in own sessions"
  on public.answers for select
  using (
    public.is_admin()
    and exists (
      select 1
      from public.participants p
      where p.id = answers.participant_id
        and public.owns_session(p.session_id)
    )
  );

-- Leaderboard
create policy "Admins can view leaderboard for own sessions"
  on public.leaderboard for select
  using (public.is_admin() and public.owns_session(session_id));

create policy "Admins can manage leaderboard for own sessions"
  on public.leaderboard for all
  using (public.is_admin() and public.owns_session(session_id))
  with check (public.is_admin() and public.owns_session(session_id));

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
-- Phase 2 waiting rooms: run supabase/migrations/phase2_participants.sql
-- Phase 3 question sync: add answers + leaderboard to publication
