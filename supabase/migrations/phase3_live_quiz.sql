-- Phase 3: Live quiz sync, answers, scoring, leaderboard
-- Run AFTER schema.sql and phase2_participants.sql

-- ---------------------------------------------------------------------------
-- Session live state
-- ---------------------------------------------------------------------------
alter table public.quiz_sessions
  add column if not exists current_question_index integer not null default -1,
  add column if not exists current_question_id uuid references public.questions (id) on delete set null,
  add column if not exists question_started_at timestamptz,
  add column if not exists live_phase text not null default 'lobby'
    check (live_phase in ('lobby', 'question', 'reveal', 'leaderboard', 'podium'));

-- ---------------------------------------------------------------------------
-- Answers: scoring fields
-- ---------------------------------------------------------------------------
alter table public.answers
  add column if not exists points_earned integer not null default 0,
  add column if not exists response_time_ms integer;

-- ---------------------------------------------------------------------------
-- Submit answer (validated server-side)
-- ---------------------------------------------------------------------------
create or replace function public.submit_answer(
  p_participant_id uuid,
  p_question_id uuid,
  p_selected_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
  v_session public.quiz_sessions%rowtype;
  v_question public.questions%rowtype;
  v_correct boolean;
  v_elapsed_ms integer;
  v_points integer;
  v_base constant integer := 10;
  v_max_bonus constant integer := 5;
  v_duration_ms integer;
  v_ratio numeric;
begin
  select * into v_participant from public.participants where id = p_participant_id;
  if not found then
    raise exception 'Participant not found';
  end if;

  select * into v_session from public.quiz_sessions where id = v_participant.session_id;
  if not found then
    raise exception 'Session not found';
  end if;

  if v_session.status <> 'active' or v_session.live_phase <> 'question' then
    raise exception 'Answers are closed for this question';
  end if;

  if v_session.current_question_id is distinct from p_question_id then
    raise exception 'This is not the active question';
  end if;

  if v_session.question_started_at is null then
    raise exception 'Question timer not started';
  end if;

  select * into v_question from public.questions where id = p_question_id;
  if not found then
    raise exception 'Question not found';
  end if;

  if exists (
    select 1 from public.answers
    where participant_id = p_participant_id and question_id = p_question_id
  ) then
    raise exception 'Answer already submitted';
  end if;

  v_duration_ms := coalesce(v_question.time_limit_seconds, 30) * 1000;
  v_elapsed_ms := floor(extract(epoch from (now() - v_session.question_started_at)) * 1000)::integer;

  if v_elapsed_ms > v_duration_ms then
    raise exception 'Time is up for this question';
  end if;

  v_correct := trim(p_selected_answer) = trim(v_question.correct_answer);

  if v_correct then
    v_ratio := greatest(0, 1 - (v_elapsed_ms::numeric / v_duration_ms::numeric));
    v_points := v_base + round(v_max_bonus * v_ratio)::integer;
  else
    v_points := 0;
  end if;

  insert into public.answers (
    participant_id,
    question_id,
    selected_answer,
    is_correct,
    points_earned,
    response_time_ms,
    answered_at
  ) values (
    p_participant_id,
    p_question_id,
    trim(p_selected_answer),
    v_correct,
    v_points,
    v_elapsed_ms,
    now()
  );

  update public.participants
  set score = score + v_points
  where id = p_participant_id;

  perform public.refresh_session_leaderboard(v_participant.session_id);

  return jsonb_build_object(
    'is_correct', v_correct,
    'points_earned', v_points,
    'response_time_ms', v_elapsed_ms
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Leaderboard refresh
-- ---------------------------------------------------------------------------
create or replace function public.refresh_session_leaderboard(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.leaderboard where session_id = p_session_id;

  insert into public.leaderboard (session_id, participant_id, rank, score, updated_at)
  select
    p_session_id,
    p.id,
    row_number() over (order by p.score desc, p.joined_at asc)::integer,
    p.score,
    now()
  from public.participants p
  where p.session_id = p_session_id
  order by p.score desc, p.joined_at asc;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public question (no correct answer)
-- ---------------------------------------------------------------------------
create or replace function public.get_current_question(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.quiz_sessions%rowtype;
  v_question public.questions%rowtype;
begin
  select * into v_session from public.quiz_sessions where id = p_session_id;
  if not found then
    return null;
  end if;

  if v_session.current_question_id is null then
    return null;
  end if;

  select * into v_question from public.questions where id = v_session.current_question_id;
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_question.id,
    'question_text', v_question.question_text,
    'options', v_question.options,
    'order_index', v_question.order_index,
    'time_limit_seconds', v_question.time_limit_seconds,
    'correct_answer', case
      when v_session.live_phase in ('reveal', 'leaderboard', 'podium') then v_question.correct_answer
      else null
    end,
    'question_index', v_session.current_question_index,
    'question_started_at', v_session.question_started_at,
    'live_phase', v_session.live_phase
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: answers + leaderboard for live quiz
-- ---------------------------------------------------------------------------
drop policy if exists "Participants can submit answers during active question" on public.answers;
create policy "Participants can submit answers during active question"
  on public.answers for insert
  with check (
    exists (
      select 1
      from public.participants p
      join public.quiz_sessions qs on qs.id = p.session_id
      where p.id = participant_id
        and qs.status = 'active'
        and qs.live_phase = 'question'
        and qs.current_question_id = question_id
    )
  );

drop policy if exists "Anyone can view answers in joinable sessions" on public.answers;
create policy "Anyone can view answers in live sessions"
  on public.answers for select
  using (
    exists (
      select 1
      from public.participants p
      join public.quiz_sessions qs on qs.id = p.session_id
      where p.id = answers.participant_id
        and qs.status in ('active', 'ended')
    )
  );

drop policy if exists "Anyone can view leaderboard in joinable sessions" on public.leaderboard;
create policy "Public can view leaderboard for live sessions"
  on public.leaderboard for select
  using (
    exists (
      select 1 from public.quiz_sessions qs
      where qs.id = leaderboard.session_id
        and qs.status in ('active', 'ended')
    )
  );

drop policy if exists "Admins can view leaderboard for own sessions" on public.leaderboard;
create policy "Admins can view leaderboard for own sessions"
  on public.leaderboard for select
  using (public.is_admin() and public.owns_session(session_id));

-- Participants can read questions metadata during active session (via RPC preferred)
drop policy if exists "Public can read questions for active quizzes" on public.questions;
create policy "Public can read questions for active quizzes"
  on public.questions for select
  using (
    exists (
      select 1 from public.quiz_sessions qs
      where qs.quiz_id = questions.quiz_id
        and qs.status in ('active', 'ended')
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.answers;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.leaderboard;
exception when duplicate_object then null;
end $$;

grant execute on function public.submit_answer(uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_current_question(uuid) to anon, authenticated;
grant execute on function public.refresh_session_leaderboard(uuid) to anon, authenticated;
