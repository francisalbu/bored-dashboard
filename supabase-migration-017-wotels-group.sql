-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 017 — Wotels Group
-- Creates hotel group "Wotels" + 9 hotel_config entries
--
-- Hotels:
--   1. WOT Porto Soul          – Rua da Conceição 80, Porto
--   2. WOT Pateira Soul        – R. Pateira 84, Fermentelos
--   3. WOT Ericeira Soul       – Ericeira, Mafra
--   4. WOT Lodge Soul          – Rua Mendes Leal 8, Ericeira
--   5. WOT Sarrazola Soul      – Caminho da Bica, Sintra
--   6. WOT Ocean Soul          – Praia das Maçãs, Colares
--   7. WOT Costa da Caparica Soul – Av. Dr. Aresta Branco 22, Costa da Caparica
--   8. WOT Lagos Montemar Soul – R. da Torraltinha 33-34, Lagos
--   9. WOT Algarve Soul        – R. Manuel Teixeira Gomes 75A, Loulé
--
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  wotels_group_id UUID;
BEGIN

  -- ── 1. Create hotel group ─────────────────────────────────────────────────
  INSERT INTO hotel_groups (name, slug, logo_url)
  VALUES (
    'Wotels',
    'wotels',
    NULL
  )
  ON CONFLICT (slug) DO UPDATE
    SET name     = EXCLUDED.name,
        logo_url = COALESCE(EXCLUDED.logo_url, hotel_groups.logo_url)
  RETURNING id INTO wotels_group_id;

  IF wotels_group_id IS NULL THEN
    SELECT id INTO wotels_group_id FROM hotel_groups WHERE slug = 'wotels';
  END IF;

  RAISE NOTICE '🏨 Wotels group ID: %', wotels_group_id;

  -- ── 2. Insert all 9 hotels ────────────────────────────────────────────────
  INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, group_id, theme, subdomain)
  VALUES

    -- ── PORTO ────────────────────────────────────────────────────────────────
    (
      'wot-porto-soul',
      'WOT Porto Soul',
      'The soul of Porto, right in the city',
      'Rua da Conceição 80, 4050-214 Porto',
      41.1456,
      -8.6149,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-porto-soul'
    ),

    -- ── PATEIRA / FERMENTELOS ────────────────────────────────────────────────
    (
      'wot-pateira-soul',
      'WOT Pateira Soul',
      'Lakeside serenity in the heart of Beira Litoral',
      'R. Pateira 84, 3750-439 Fermentelos',
      40.5631,
      -8.4942,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-pateira-soul'
    ),

    -- ── ERICEIRA ─────────────────────────────────────────────────────────────
    (
      'wot-ericeira-soul',
      'WOT Ericeira Soul',
      'World Surfing Reserve on your doorstep',
      'Ericeira, 2655-000 Mafra',
      38.9626,
      -9.4173,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-ericeira-soul'
    ),

    -- ── ERICEIRA LODGE ───────────────────────────────────────────────────────
    (
      'wot-lodge-soul',
      'WOT Lodge Soul',
      'Your base camp for surf and soul in Ericeira',
      'Rua Mendes Leal 8, 2655-305 Ericeira',
      38.9621,
      -9.4168,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-lodge-soul'
    ),

    -- ── SINTRA / SARRAZOLA ───────────────────────────────────────────────────
    (
      'wot-sarrazola-soul',
      'WOT Sarrazola Soul',
      'Hidden in the hills of Sintra',
      'Caminho da Bica, 2710-066 Sintra',
      38.7938,
      -9.3904,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-sarrazola-soul'
    ),

    -- ── PRAIA DAS MAÇÃS / COLARES ────────────────────────────────────────────
    (
      'wot-ocean-soul',
      'WOT Ocean Soul',
      'Atlantic waves and golden sunsets at Praia das Maçãs',
      'Avenida Eugene Levy 52, Praia das Maçãs, 2705-304 Colares',
      38.8443,
      -9.4721,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-ocean-soul'
    ),

    -- ── COSTA DA CAPARICA ────────────────────────────────────────────────────
    (
      'wot-costa-da-caparica-soul',
      'WOT Costa da Caparica Soul',
      'Surf, sun and soulful stays on the Atlantic',
      'Avenida Dr. Aresta Branco 22, 2825-322 Costa da Caparica',
      38.6411,
      -9.2353,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-costa-da-caparica-soul'
    ),

    -- ── LAGOS ────────────────────────────────────────────────────────────────
    (
      'wot-lagos-montemar-soul',
      'WOT Lagos Montemar Soul',
      'The Algarve coast, lived your way',
      'R. da Torraltinha 33-34, 8600-549 Lagos',
      37.1090,
      -8.6598,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-lagos-montemar-soul'
    ),

    -- ── LOULÉ / ALGARVE ──────────────────────────────────────────────────────
    (
      'wot-algarve-soul',
      'WOT Algarve Soul',
      'Sun-soaked soul in the heart of the Algarve',
      'R. Manuel Teixeira Gomes 75A, 8135-016 Loulé',
      37.1394,
      -8.0243,
      wotels_group_id,
      '{
        "primaryColor": "#1a1a1a",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c8873a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb,
      'wot-algarve-soul'
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

  RAISE NOTICE '✅  All 9 Wotels hotels inserted/updated.';

END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────────
/*
SELECT hc.id, hc.name, hc.location
FROM hotel_config hc
JOIN hotel_groups hg ON hg.id = hc.group_id
WHERE hg.slug = 'wotels'
ORDER BY hc.name;
*/
