-- QuizFlow Realtime Multiplayer Schema (Kahoot-style)
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Remove legacy async exam table from previous SecureQuiz architecture
drop table if exists public.submissions cascade;

-- Core quiz bank
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Live room lifecycle: waiting -> question_active -> leaderboard -> finished
create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  pin text not null,
  host_id text not null,
  status text not null default 'waiting'
    check (status in ('waiting', 'question_active', 'leaderboard', 'finished')),
  current_question_index integer not null default -1,
  question_started_at timestamptz,
  question_duration_ms integer not null default 20000,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_game_rooms_pin_active
  on public.game_rooms(pin)
  where status <> 'finished';

create index if not exists idx_game_rooms_status on public.game_rooms(status);

-- Players inside a room
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  nickname text not null,
  total_score integer not null default 0,
  joined_at timestamptz not null default now()
);

create index if not exists idx_players_room_id on public.players(room_id);
create unique index if not exists idx_players_room_nickname_unique
  on public.players(room_id, lower(nickname));

-- Per-question answer submissions
create table if not exists public.player_answers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  question_index integer not null,
  answer_index integer,
  is_correct boolean not null default false,
  reaction_time_ms integer not null default 0,
  points_earned integer not null default 0,
  answered_at timestamptz not null default now()
);

create unique index if not exists idx_player_answers_unique_turn
  on public.player_answers(player_id, question_index);

create index if not exists idx_player_answers_room_q
  on public.player_answers(room_id, question_index);

-- Helper: generate unique 6-digit room pin
create or replace function public.generate_game_pin()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pin text;
  v_exists boolean;
begin
  loop
    v_pin := lpad((floor(random() * 900000) + 100000)::text, 6, '0');

    select exists (
      select 1
      from public.game_rooms
      where pin = v_pin and status <> 'finished'
    ) into v_exists;

    exit when not v_exists;
  end loop;

  return v_pin;
end;
$$;

-- Speed + correctness scoring similar to Kahoot behavior
create or replace function public.score_answer(
  p_is_correct boolean,
  p_reaction_time_ms integer,
  p_question_duration_ms integer default 20000
)
returns integer
language sql
immutable
as $$
  select case
    when not p_is_correct then 0
    else greatest(
      200,
      round(1000 * (1 - least(greatest(p_reaction_time_ms, 0), p_question_duration_ms)::numeric / greatest(p_question_duration_ms, 1)))::integer
    )
  end;
$$;

-- Grade all answers for current question and refresh totals
create or replace function public.grade_current_question(
  p_room_id uuid,
  p_question_index integer,
  p_correct_answer_index integer,
  p_question_duration_ms integer default 20000
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.player_answers
  set
    is_correct = (answer_index = p_correct_answer_index),
    points_earned = public.score_answer(
      (answer_index = p_correct_answer_index),
      reaction_time_ms,
      p_question_duration_ms
    )
  where room_id = p_room_id
    and question_index = p_question_index;

  update public.players p
  set total_score = coalesce((
    select sum(pa.points_earned)
    from public.player_answers pa
    where pa.player_id = p.id
  ), 0)
  where p.room_id = p_room_id;
end;
$$;

grant execute on function public.generate_game_pin() to anon, authenticated;
grant execute on function public.score_answer(boolean, integer, integer) to anon, authenticated;
grant execute on function public.grade_current_question(uuid, integer, integer, integer) to anon, authenticated;

-- RLS
alter table public.quizzes enable row level security;
alter table public.game_rooms enable row level security;
alter table public.players enable row level security;
alter table public.player_answers enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert on public.quizzes to anon, authenticated;
grant select, insert, update on public.game_rooms to anon, authenticated;
grant select, insert, update on public.players to anon, authenticated;
grant select, insert, update on public.player_answers to anon, authenticated;

-- Public policies for anonymous realtime gameplay
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'quizzes_select_public') then
    create policy quizzes_select_public on public.quizzes for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'quizzes_insert_public') then
    create policy quizzes_insert_public on public.quizzes for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'game_rooms' and policyname = 'game_rooms_select_public') then
    create policy game_rooms_select_public on public.game_rooms for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'game_rooms' and policyname = 'game_rooms_insert_public') then
    create policy game_rooms_insert_public on public.game_rooms for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'game_rooms' and policyname = 'game_rooms_update_public') then
    create policy game_rooms_update_public on public.game_rooms for update using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'players_select_public') then
    create policy players_select_public on public.players for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'players_insert_public') then
    create policy players_insert_public on public.players for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'players_update_public') then
    create policy players_update_public on public.players for update using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'player_answers' and policyname = 'answers_select_public') then
    create policy answers_select_public on public.player_answers for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'player_answers' and policyname = 'answers_insert_public') then
    create policy answers_insert_public on public.player_answers for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'player_answers' and policyname = 'answers_update_public') then
    create policy answers_update_public on public.player_answers for update using (true) with check (true);
  end if;
end $$;

-- Supabase realtime publication (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_rooms'
  ) then
    alter publication supabase_realtime add table public.game_rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players'
  ) then
    alter publication supabase_realtime add table public.players;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'player_answers'
  ) then
    alter publication supabase_realtime add table public.player_answers;
  end if;
end $$;
