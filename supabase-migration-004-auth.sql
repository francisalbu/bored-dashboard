-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — Multi-tenant Auth
-- Operators, Hotel Groups, and Operator ↔ Hotel access control
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable Supabase Auth (already enabled by default, but ensure uuid-ossp is available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- Hotel Groups — e.g. "Vila Galé Group", "Selina"
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotel_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,  -- e.g. "vila-gale"
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Link hotel_config to a group (optional)
ALTER TABLE hotel_config
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES hotel_groups(id) ON DELETE SET NULL;

-- Link hotel_config to the numeric operator_id used in the experiences table
-- Each hotel must have this set so the backoffice shows the correct experiences
ALTER TABLE hotel_config
  ADD COLUMN IF NOT EXISTS operator_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS hotel_config_operator_id_idx ON hotel_config (operator_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Dashboard Users — auth profile table, linked to Supabase auth.users (UUID)
-- NOTE: the existing `operators` table (bigint IDs) is kept as-is for experiences.
--       This table is exclusively for dashboard login/access control.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'hotel_admin',
  -- 'super_admin' → sees all hotels
  -- 'hotel_admin' → sees only their assigned hotels
  -- 'staff'       → read-only access
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Dashboard User ↔ Hotel — many-to-many access table
-- One dashboard user can manage multiple hotels (e.g. hotel group admin)
-- One hotel can have multiple dashboard users (e.g. staff)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_user_hotels (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id     TEXT NOT NULL REFERENCES hotel_config(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'admin',
  -- 'owner'  → full access + can manage staff
  -- 'admin'  → full read/write
  -- 'staff'  → read only
  PRIMARY KEY (user_id, hotel_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: auto-create dashboard_users row and assign invited hotels on sign up
-- (defined in the Invites section below — do not duplicate here)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE dashboard_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_user_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_groups          ENABLE ROW LEVEL SECURITY;

-- Dashboard users: each user sees/edits only their own row
DROP POLICY IF EXISTS "dashboard_users: self access" ON dashboard_users;
CREATE POLICY "dashboard_users: self access"
  ON dashboard_users FOR ALL
  USING (id = auth.uid());

-- dashboard_user_hotels: user sees their own hotel links
DROP POLICY IF EXISTS "dashboard_user_hotels: self access" ON dashboard_user_hotels;
CREATE POLICY "dashboard_user_hotels: self access"
  ON dashboard_user_hotels FOR ALL
  USING (user_id = auth.uid());

-- hotel_config: operator can read/update hotels they have access to
DROP POLICY IF EXISTS "hotel_config: operator read" ON hotel_config;
DROP POLICY IF EXISTS "hotel_config: operator write" ON hotel_config;

CREATE POLICY "hotel_config: operator read"
  ON hotel_config FOR SELECT
  USING (
    id IN (
      SELECT hotel_id FROM dashboard_user_hotels WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "hotel_config: operator write"
  ON hotel_config FOR UPDATE
  USING (
    id IN (
      SELECT hotel_id FROM dashboard_user_hotels
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- experiences: operator manages experiences for their hotels
DROP POLICY IF EXISTS "experiences: operator read" ON experiences;
DROP POLICY IF EXISTS "experiences: operator write" ON experiences;

CREATE POLICY "experiences: operator read"
  ON experiences FOR SELECT
  USING (
    operator_id::text IN (
      SELECT hotel_id FROM dashboard_user_hotels WHERE user_id = auth.uid()
    )
    OR operator_id < 90000  -- bored. marketplace experiences (read-only for all)
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "experiences: operator write"
  ON experiences FOR ALL
  USING (
    operator_id::text IN (
      SELECT hotel_id FROM dashboard_user_hotels
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- hotel_groups: readable by all operators, writable by super_admin only
DROP POLICY IF EXISTS "hotel_groups: all operators can read" ON hotel_groups;
CREATE POLICY "hotel_groups: all operators can read"
  ON hotel_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "hotel_groups: super_admin write" ON hotel_groups;
CREATE POLICY "hotel_groups: super_admin write"
  ON hotel_groups FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper view: hotels accessible by the current operator (used in frontend)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW my_hotels AS
  SELECT
    hc.id,
    hc.name,
    hc.location,
    hc.logo_url,
    hc.group_id,
    hg.name AS group_name,
    duh.role AS operator_role
  FROM hotel_config hc
  JOIN dashboard_user_hotels duh ON duh.hotel_id = hc.id AND duh.user_id = auth.uid()
  LEFT JOIN hotel_groups hg ON hg.id = hc.group_id
  ORDER BY hg.name NULLS LAST, hc.name;

-- ─────────────────────────────────────────────────────────────────────────────
-- Invites — pending email invitations to the dashboard
-- When a user signs up, the trigger checks this table and auto-assigns hotel
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  hotel_id    TEXT NOT NULL REFERENCES hotel_config(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'admin',
  accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email, hotel_id)
);

ALTER TABLE dashboard_invites ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all invites
DROP POLICY IF EXISTS "dashboard_invites: super_admin full access" ON dashboard_invites;
CREATE POLICY "dashboard_invites: super_admin full access"
  ON dashboard_invites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- Hotel owners/admins can create invites for their own hotels
DROP POLICY IF EXISTS "dashboard_invites: hotel admin create" ON dashboard_invites;
CREATE POLICY "dashboard_invites: hotel admin create"
  ON dashboard_invites FOR INSERT
  WITH CHECK (
    hotel_id IN (
      SELECT hotel_id FROM dashboard_user_hotels
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update the new-user trigger to auto-accept pending invites
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Create dashboard_users row
  INSERT INTO public.dashboard_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-assign hotels from pending invites
  INSERT INTO public.dashboard_user_hotels (user_id, hotel_id, role)
  SELECT NEW.id, hotel_id, role
  FROM public.dashboard_invites
  WHERE email = NEW.email AND accepted = FALSE
  ON CONFLICT (user_id, hotel_id) DO NOTHING;

  -- Mark invites as accepted
  UPDATE public.dashboard_invites
  SET accepted = TRUE
  WHERE email = NEW.email AND accepted = FALSE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: first super admin (replace with real email)
-- Run this manually in Supabase SQL editor after creating the first Auth user
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE dashboard_users SET role = 'super_admin' WHERE email = 'admin@boredtourist.com';

-- ─────────────────────────────────────────────────────────────────────────────
-- ⚠️  SUPABASE DASHBOARD SETTINGS — do these manually after running this SQL:
--
--  1. Authentication → URL Configuration:
--     Site URL:               https://bored-tourist-hotel-edition.vercel.app
--     Redirect URLs (add):    https://bored-tourist-hotel-edition.vercel.app/**
--                             http://localhost:5173/**   (for local dev)
--
--  2. Authentication → Email → Confirm email: OFF (optional, for dev)
--     (or leave ON if you want new users to verify their email)
--
--  3. Create the first super admin:
--     Run:  npm run create-admin   (from the dashboard project root)
-- ─────────────────────────────────────────────────────────────────────────────
