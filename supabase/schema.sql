-- ============================================================
-- What To Eat — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database.
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────────────────────────
create type cuisine_category as enum (
  'chinese', 'malay', 'indian', 'western',
  'japanese', 'korean', 'thai', 'fast_food', 'cafe', 'other'
);

-- ────────────────────────────────────────────────────────────
-- restaurants
-- ────────────────────────────────────────────────────────────
create table restaurants (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  cuisine_category cuisine_category not null,
  description      text,
  location_label   text,        -- on-campus: block/stall code; off-campus: address
  distance_km      numeric(4,2), -- null = on-campus
  is_on_campus     boolean not null default true,
  image_url        text,
  price_range      smallint not null check (price_range between 1 and 3),
  tags             text[] not null default '{}',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger restaurants_updated_at
  before update on restaurants
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- sessions
-- ────────────────────────────────────────────────────────────
create table sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  started_at         timestamptz not null default now(),
  ended_at           timestamptz,
  total_shown        smallint not null default 0,
  total_yes          smallint not null default 0,
  top_cuisine        cuisine_category,
  top_restaurant_id  uuid references restaurants(id) on delete set null,
  t_yes_avg          numeric(8,2), -- mean ms for YES swipes
  t_yes_sd           numeric(8,2)  -- std dev ms for YES swipes
);

create index sessions_user_id_idx on sessions(user_id);

-- ────────────────────────────────────────────────────────────
-- swipe_events
-- ────────────────────────────────────────────────────────────
create table swipe_events (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references sessions(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  restaurant_id    uuid not null references restaurants(id) on delete cascade,
  cuisine_category cuisine_category not null,
  decision         boolean not null,       -- true=YES, false=NO
  time_to_decide   integer not null check (time_to_decide between 0 and 30000),
  swipe_order      smallint not null,
  session_score    numeric(4,3) not null,  -- 0.000–1.000
  time_enthusiasm  numeric(4,3),           -- null for NO swipes
  swiped_at        timestamptz not null default now()
);

create index swipe_events_session_id_idx on swipe_events(session_id);
create index swipe_events_user_id_idx   on swipe_events(user_id);
create index swipe_events_restaurant_id_idx on swipe_events(restaurant_id);

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────

-- restaurants: anyone can read active ones; only service role can write
alter table restaurants enable row level security;
create policy "restaurants_select" on restaurants
  for select using (is_active = true);

-- sessions: users can only see/write their own; anon sessions are open
alter table sessions enable row level security;
create policy "sessions_select_own" on sessions
  for select using (user_id = auth.uid() or user_id is null);
create policy "sessions_insert" on sessions
  for insert with check (user_id = auth.uid() or user_id is null);
create policy "sessions_update_own" on sessions
  for update using (user_id = auth.uid() or user_id is null);

-- swipe_events: same rules as sessions
alter table swipe_events enable row level security;
create policy "swipe_events_select_own" on swipe_events
  for select using (user_id = auth.uid() or user_id is null);
create policy "swipe_events_insert" on swipe_events
  for insert with check (user_id = auth.uid() or user_id is null);
