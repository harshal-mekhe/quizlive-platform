-- Phase 2: Participant join flow + waiting room Realtime
-- Run in Supabase SQL Editor AFTER schema.sql (safe to re-run)

-- Unique nickname per session (case-insensitive)
create unique index if not exists participants_session_nickname_idx
  on public.participants (session_id, lower(nickname));

-- ---------------------------------------------------------------------------
-- Additional RLS for public join flow
-- ---------------------------------------------------------------------------

drop policy if exists "Public can view joinable sessions" on public.quiz_sessions;
create policy "Public can view joinable sessions"
  on public.quiz_sessions for select
  using (status in ('waiting', 'active'));

drop policy if exists "Anyone can join waiting sessions" on public.participants;
create policy "Anyone can join waiting sessions"
  on public.participants for insert
  with check (
    exists (
      select 1
      from public.quiz_sessions qs
      where qs.id = session_id
        and qs.status = 'waiting'
    )
  );

drop policy if exists "Anyone can view participants in joinable sessions" on public.participants;
create policy "Anyone can view participants in joinable sessions"
  on public.participants for select
  using (
    exists (
      select 1
      from public.quiz_sessions qs
      where qs.id = participants.session_id
        and qs.status in ('waiting', 'active')
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime (waiting room live lists — not question sync)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.participants;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.quiz_sessions;
exception
  when duplicate_object then null;
end $$;
