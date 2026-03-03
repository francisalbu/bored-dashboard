-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009 — Per-hotel experience visibility
-- Adds is_active to hotel_experiences so each hotel can show/hide any
-- experience in its catalog without affecting other hotels or the global
-- experiences table (which has RLS that blocks marketplace writes).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE hotel_experiences
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
