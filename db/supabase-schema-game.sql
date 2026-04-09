-- ══════════════════════════════════════════════════════════
-- QuizFlow Live Game — Supabase Schema Addendum
-- Run this AFTER the existing supabase-schema.sql
-- Do NOT drop existing quizzes / submissions tables.
-- ══════════════════════════════════════════════════════════

-- ─── 1. game_rooms ───────────────────────────────────────
create table if not exists public.game_rooms (
  id                    uuid primary key default gen_random_uuid(),
  quiz_id               uuid not null references public.quizzes(id) on delete cascade,
  host_id               uuid not null references auth.users(id),
  pin                   text not null,
  status                text not null default 'waiting'
                          check (status in ('waiting','playing','results','finished')),
  current_question_index integer not null default 0,
  question_end_at       timestamptz,
  created_at            timestamptz not null default now()
);

-- Unique PIN per active game
create unique index if not exists idx_game_rooms_pin
  on public.game_rooms (pin)
  where status <> 'finished';

create index if not exists idx_game_rooms_host_id
  on public.game_rooms (host_id);

-- ─── 2. players ──────────────────────────────────────────
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.game_rooms(id) on delete cascade,
  nickname    text not null,
  avatar_idx  integer not null default 0,
  total_score integer not null default 0,
  joined_at   timestamptz not null default now()
);

create index if not exists idx_players_room_id on public.players (room_id);

-- ─── 3. player_answers ───────────────────────────────────
create table if not exists public.player_answers (
  id               uuid primary key default gen_random_uuid(),
  room_id          uuid not null references public.game_rooms(id) on delete cascade,
  player_id        uuid not null references public.players(id) on delete cascade,
  question_index   integer not null,
  answer_index     integer,          -- 0-3, NULL = no answer
  is_correct       boolean not null default false,
  points_earned    integer not null default 0,
  answered_at      timestamptz not null default now()
);

create index if not exists idx_player_answers_room_question
  on public.player_answers (room_id, question_index);

create unique index if not exists idx_player_answers_unique
  on public.player_answers (player_id, question_index);

-- ─── 4. RLS ──────────────────────────────────────────────
alter table public.game_rooms    enable row level security;
alter table public.players       enable row level security;
alter table public.player_answers enable row level security;

-- Grant usage to anon & authenticated
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.game_rooms     to anon, authenticated;
grant select, insert, update on table public.players        to anon, authenticated;
grant select, insert        on table public.player_answers  to anon, authenticated;

-- game_rooms policies
do $$ begin
  -- Anyone can read a room (needed to join by PIN)
  if not exists (select 1 from pg_policies where policyname='gr_select_public' and tablename='game_rooms') then
    create policy gr_select_public on public.game_rooms for select using (true);
  end if;

  -- Only authenticated host can insert their own room
  if not exists (select 1 from pg_policies where policyname='gr_insert_host' and tablename='game_rooms') then
    create policy gr_insert_host on public.game_rooms for insert to authenticated
      with check (auth.uid() = host_id);
  end if;

  -- Only the host can update room status / question index
  if not exists (select 1 from pg_policies where policyname='gr_update_host' and tablename='game_rooms') then
    create policy gr_update_host on public.game_rooms for update to authenticated
      using (auth.uid() = host_id);
  end if;
end $$;

-- players policies
do $$ begin
  -- Anyone can read players in a room
  if not exists (select 1 from pg_policies where policyname='pl_select_public' and tablename='players') then
    create policy pl_select_public on public.players for select using (true);
  end if;

  -- Anyone (anon) can insert a player (join a game)
  if not exists (select 1 from pg_policies where policyname='pl_insert_public' and tablename='players') then
    create policy pl_insert_public on public.players for insert with check (true);
  end if;

  -- Score update: anyone can update their own row (we use player id stored client-side)
  if not exists (select 1 from pg_policies where policyname='pl_update_score' and tablename='players') then
    create policy pl_update_score on public.players for update using (true);
  end if;
end $$;

-- player_answers policies
do $$ begin
  if not exists (select 1 from pg_policies where policyname='pa_select_public' and tablename='player_answers') then
    create policy pa_select_public on public.player_answers for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname='pa_insert_public' and tablename='player_answers') then
    create policy pa_insert_public on public.player_answers for insert with check (true);
  end if;
end $$;

-- ─── 5. Enable Supabase Realtime ─────────────────────────
-- Run in Supabase SQL editor — this adds the tables to
-- the realtime publication so clients get live updates.
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.player_answers;

-- ─── 6. Helper: generate 6-char numeric PIN ──────────────
create or replace function public.generate_game_pin()
returns text
language sql
security definer
set search_path = public
as $$
  select lpad(
    (floor(random() * 900000) + 100000)::text,
    6, '0'
  );
$$;

grant execute on function public.generate_game_pin() to anon, authenticated;

-- ─── 7. Grading function (called from host after question) ─────────────────
-- Computes correct answers from quizzes.questions JSONB and updates
-- player_answers.is_correct + points, then refreshes players.total_score
create or replace function public.grade_question(
  p_room_id        uuid,
  p_question_index integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz_id    uuid;
  v_question   jsonb;
  v_correct    integer;
  v_end_at     timestamptz;
  rec          record;
  v_seconds    numeric;
  v_points     integer;
begin
  -- Get room info
  select quiz_id, question_end_at into v_quiz_id, v_end_at
  from public.game_rooms where id = p_room_id;

  -- Get the question
  select questions->p_question_index into v_question
  from public.quizzes where id = v_quiz_id;

  -- Correct option index (stored as 0-based in config)
  v_correct := (v_question->>'correct')::integer;

  -- Grade each answer
  for rec in
    select * from public.player_answers
    where room_id = p_room_id and question_index = p_question_index
  loop
    if rec.answer_index = v_correct then
      -- Speed bonus: max 1000 pts, scales down with time taken
      v_seconds := greatest(0, extract(epoch from (v_end_at - rec.answered_at)));
      -- question timer default 20s → earlier = more points (max 1000)
      v_points := greatest(200, round(1000 * (v_seconds / 20.0))::integer);
      update public.player_answers
        set is_correct = true, points_earned = v_points
        where id = rec.id;
    else
      update public.player_answers
        set is_correct = false, points_earned = 0
        where id = rec.id;
    end if;
  end loop;

  -- Refresh player totals
  update public.players p
  set total_score = (
    select coalesce(sum(pa.points_earned), 0)
    from public.player_answers pa
    where pa.player_id = p.id and pa.room_id = p_room_id
  )
  where p.room_id = p_room_id;
end;
$$;

grant execute on function public.grade_question(uuid, integer) to authenticated;
