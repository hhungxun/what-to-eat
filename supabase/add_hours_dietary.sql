-- Run in Supabase SQL Editor (after add_price_min_max.sql)
alter table restaurants
  add column if not exists opens_at  time,
  add column if not exists closes_at time,
  add column if not exists is_halal      boolean not null default false,
  add column if not exists is_vegetarian boolean not null default false,
  add column if not exists is_vegan      boolean not null default false;
