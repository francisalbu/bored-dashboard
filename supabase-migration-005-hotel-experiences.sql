-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — Hotel ↔ Experience many-to-many catalog
-- Each hotel curates its own catalog by linking to experiences.
-- Marketplace experiences can be in multiple hotel catalogs simultaneously.
-- ─────────────────────────────────────────────────────────────────────────────

-- Track which hotel created an experience (for "Own" vs "Marketplace" tab)
ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS created_by_hotel_id TEXT REFERENCES hotel_config(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- hotel_experiences — the join table
-- When a hotel adds an experience to its catalog, a row is inserted here.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotel_experiences (
  hotel_id      TEXT NOT NULL REFERENCES hotel_config(id) ON DELETE CASCADE,
  experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (hotel_id, experience_id)
);

CREATE INDEX IF NOT EXISTS hotel_experiences_hotel_idx      ON hotel_experiences (hotel_id);
CREATE INDEX IF NOT EXISTS hotel_experiences_experience_idx ON hotel_experiences (experience_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE hotel_experiences ENABLE ROW LEVEL SECURITY;

-- Hotel operators can read/write their own catalog entries
DROP POLICY IF EXISTS "hotel_experiences: operator access" ON hotel_experiences;
CREATE POLICY "hotel_experiences: operator access"
  ON hotel_experiences FOR ALL
  USING (
    hotel_id IN (
      SELECT hotel_id FROM dashboard_user_hotels WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Update experiences RLS to use created_by_hotel_id instead of operator_id
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "experiences: operator read" ON experiences;
DROP POLICY IF EXISTS "experiences: operator write" ON experiences;

-- All logged-in operators can read all experiences (marketplace is shared)
CREATE POLICY "experiences: operator read"
  ON experiences FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Operators can only write (edit/delete) experiences they created
CREATE POLICY "experiences: operator write"
  ON experiences FOR ALL
  USING (
    created_by_hotel_id IN (
      SELECT hotel_id FROM dashboard_user_hotels WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: view that returns all experiences in a hotel's catalog
-- (used by the public website widget — one query instead of a join in app code)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW hotel_catalog AS
  SELECT
    he.hotel_id,
    e.*
  FROM hotel_experiences he
  JOIN experiences e ON e.id = he.experience_id
  WHERE e.is_active = TRUE;
