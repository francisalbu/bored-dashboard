-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007 — Subdomain routing per hotel
-- Adds a unique `subdomain` column to hotel_config so that each hotel's
-- public website (e.g. lisb-onhostel.boredtourist.com) maps to exactly
-- one hotel_config row.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the column (nullable so existing rows aren't broken)
ALTER TABLE hotel_config
  ADD COLUMN IF NOT EXISTS subdomain TEXT;

-- 2. Enforce uniqueness — one subdomain → one hotel
CREATE UNIQUE INDEX IF NOT EXISTS hotel_config_subdomain_idx
  ON hotel_config (subdomain)
  WHERE subdomain IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Assign subdomains
-- ─────────────────────────────────────────────────────────────────────────────

-- Lisb-on Hostel  →  lisb-onhostel.boredtourist.com
UPDATE hotel_config
SET subdomain = 'lisb-onhostel'
WHERE id = 'lisb-on-hostel';

-- Flôr de Sal by The Editory  →  flordesal.boredtourist.com
UPDATE hotel_config
SET subdomain = 'flordesal'
WHERE id = 'editory-flor-de-sal-viana';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Verification
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT id, name, subdomain
FROM hotel_config
WHERE subdomain IS NOT NULL
ORDER BY subdomain;
*/
