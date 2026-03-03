-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010 — Public read access for the hotel website (anon key)
--
-- The public-facing website (lisb-onhostel.boredtourist.com etc.) uses the
-- Supabase anon key and is NOT authenticated. Without these policies the
-- website cannot read hotel_experiences or experiences, falls back to 0 rows,
-- and then shows the global 211 experiences.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Allow anyone to read hotel_experiences rows ───────────────────────────
--    (is_active filter is applied at query time in useExperiences.ts)
DROP POLICY IF EXISTS "hotel_experiences: public read" ON hotel_experiences;
CREATE POLICY "hotel_experiences: public read"
  ON hotel_experiences FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── 2. Allow anyone to read experiences ──────────────────────────────────────
--    The existing "experiences: operator read" policy requires auth.uid() != null.
--    Replace it with a fully public read policy so the website can fetch them.
DROP POLICY IF EXISTS "experiences: operator read" ON experiences;
CREATE POLICY "experiences: public read"
  ON experiences FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── 3. Allow anyone to read hotel_config (needed for theme/branding on website)
DROP POLICY IF EXISTS "hotel_config: public read" ON hotel_config;
CREATE POLICY "hotel_config: public read"
  ON hotel_config FOR SELECT
  TO anon, authenticated
  USING (true);
