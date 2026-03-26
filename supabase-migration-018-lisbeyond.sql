-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 018 — Lisbeyond (hotel único, Lisboa)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO hotel_config (
  id,
  name,
  tagline,
  location,
  latitude,
  longitude,
  group_id,
  theme,
  subdomain
)
VALUES (
  'lisbeyond',
  'Lisbeyond',
  'The soul of Lisbon, beyond the ordinary',
  'Lisboa',
  38.7169,
  -9.1399,
  NULL,
  '{
    "primaryColor": "#1a1a1a",
    "primaryTextColor": "#ffffff",
    "accentColor": "#c8873a",
    "backgroundColor": "#FAFAF8",
    "surfaceColor": "#ffffff",
    "fontHeading": "Inter",
    "fontBody": "Inter"
  }'::jsonb,
  'lisbeyond'
)
ON CONFLICT (id) DO UPDATE
  SET name     = EXCLUDED.name,
      tagline  = EXCLUDED.tagline,
      location = EXCLUDED.location,
      latitude = EXCLUDED.latitude,
      longitude= EXCLUDED.longitude,
      subdomain= EXCLUDED.subdomain;
