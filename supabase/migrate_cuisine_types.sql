-- Migration: Add new cuisine categories
-- Run this in Supabase SQL Editor after the initial schema.sql

ALTER TYPE cuisine_category ADD VALUE IF NOT EXISTS 'indonesian';
ALTER TYPE cuisine_category ADD VALUE IF NOT EXISTS 'vietnamese';
ALTER TYPE cuisine_category ADD VALUE IF NOT EXISTS 'italian';
ALTER TYPE cuisine_category ADD VALUE IF NOT EXISTS 'mexican';
ALTER TYPE cuisine_category ADD VALUE IF NOT EXISTS 'dessert';
