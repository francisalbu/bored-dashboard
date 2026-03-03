-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 — Per-hotel experience display order
-- Adds display_order to hotel_experiences so each hotel can reorder its catalog
-- independently, without touching the shared `experiences` table (RLS issue).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE hotel_experiences
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 999;

CREATE INDEX IF NOT EXISTS hotel_experiences_order_idx
  ON hotel_experiences (hotel_id, display_order);
