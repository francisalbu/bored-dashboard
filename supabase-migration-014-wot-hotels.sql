-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 014 — WOT Hotels Group
-- Creates hotel group + 5 hotel_config entries across 4 destinations
--
-- Hotels:
--   1. WOT Soul Costa da Caparica  (Costa da Caparica, Lisboa area)
--   2. WOT Soul Lagos Montemar     (Lagos, Algarve)
--   3. WOT Soul Porto              (Porto)
--   4. Aldeia da Pedralva          (Vila do Bispo, Algarve)
--   5. Horta da Moura              (Monsaraz, Alentejo)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  wot_group_id UUID;
BEGIN

  -- ── 1. Create hotel group ─────────────────────────────────────────────────
  INSERT INTO hotel_groups (name, slug, logo_url)
  VALUES (
    'WOT Hotels',
    'wot-hotels',
    NULL   -- logo can be added later via Dashboard once URL is confirmed
  )
  ON CONFLICT (slug) DO UPDATE
    SET name     = EXCLUDED.name,
        logo_url = COALESCE(EXCLUDED.logo_url, hotel_groups.logo_url)
  RETURNING id INTO wot_group_id;

  -- RETURNING doesn't fire on the UPDATE path in all PG versions — fetch explicitly
  IF wot_group_id IS NULL THEN
    SELECT id INTO wot_group_id FROM hotel_groups WHERE slug = 'wot-hotels';
  END IF;

  RAISE NOTICE '🏨 WOT Hotels group ID: %', wot_group_id;

  -- ── 2. Insert all 5 hotels ────────────────────────────────────────────────
  INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, group_id, theme, subdomain)
  VALUES

    -- ── COSTA DA CAPARICA ────────────────────────────────────────────────────
    (
      'wot-soul-costa-da-caparica',
      'WOT Soul Costa da Caparica',
      'Surf, sun and soulful stays on the Atlantic',
      'Costa da Caparica',
      38.6411,
      -9.2353,
      wot_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-soul-costa-da-caparica'
    ),

    -- ── LAGOS MONTEMAR ───────────────────────────────────────────────────────
    (
      'wot-soul-lagos-montemar',
      'WOT Soul Lagos Montemar',
      'The Algarve coast, lived your way',
      'Lagos',
      37.1090,
      -8.6598,
      wot_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-soul-lagos-montemar'
    ),

    -- ── PORTO ────────────────────────────────────────────────────────────────
    (
      'wot-soul-porto',
      'WOT Soul Porto',
      'The soul of Porto, right in the city',
      'Porto',
      41.1579,
      -8.6291,
      wot_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-soul-porto'
    ),

    -- ── ALDEIA DA PEDRALVA ───────────────────────────────────────────────────
    (
      'aldeiadapedralva',
      'Aldeia da Pedralva',
      'The other Algarve — rural, wild and genuinely free',
      'Vila do Bispo, Algarve',
      37.0583,
      -8.8097,
      wot_group_id,
      '{
        "primaryColor": "#2d2417",
        "primaryTextColor": "#ffffff",
        "accentColor": "#a0784a",
        "backgroundColor": "#FAF8F5",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'aldeiadapedralva'
    ),

    -- ── HORTA DA MOURA ───────────────────────────────────────────────────────
    (
      'hortadamoura',
      'Horta da Moura',
      'Silence, olive groves and the magic of Alqueva',
      'Monsaraz, Alentejo',
      38.4422,
      -7.3758,
      wot_group_id,
      '{
        "primaryColor": "#2d2417",
        "primaryTextColor": "#ffffff",
        "accentColor": "#a0784a",
        "backgroundColor": "#FAF8F5",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'hortadamoura'
    )

  ON CONFLICT (id) DO UPDATE
    SET
      name      = EXCLUDED.name,
      tagline   = EXCLUDED.tagline,
      location  = EXCLUDED.location,
      latitude  = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      group_id  = EXCLUDED.group_id,
      theme     = EXCLUDED.theme,
      subdomain = EXCLUDED.subdomain;

  RAISE NOTICE '✅  All 5 WOT Hotels inserted/updated.';

END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification query (run after migration to confirm)
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT
  hg.name  AS group_name,
  hc.location,
  hc.id,
  hc.name
FROM hotel_config hc
JOIN hotel_groups hg ON hg.id = hc.group_id
WHERE hg.slug = 'wot-hotels'
ORDER BY hc.location, hc.name;
*/
