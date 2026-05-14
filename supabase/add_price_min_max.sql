-- Run in Supabase SQL Editor
alter table restaurants
  add column if not exists price_min smallint,
  add column if not exists price_max smallint;
