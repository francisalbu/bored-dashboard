-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006 — The Editory Collection Hotels
-- Creates hotel group + 12 hotel_config entries across 5 destinations
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  editory_group_id UUID;
BEGIN

  -- ── 1. Create hotel group ──────────────────────────────────────────────────
  INSERT INTO hotel_groups (name, slug, logo_url)
  VALUES (
    'The Editory Collection Hotels',
    'editory-hotels',
    'https://www.editoryhotels.com/media/1qbjgwab/the-editory-collection-hotels-logo.svg'
  )
  ON CONFLICT (slug) DO UPDATE
    SET name     = EXCLUDED.name,
        logo_url = EXCLUDED.logo_url
  RETURNING id INTO editory_group_id;

  -- ON CONFLICT triggers the UPDATE path but does NOT return via RETURNING in
  -- some Postgres versions — fetch explicitly if still null
  IF editory_group_id IS NULL THEN
    SELECT id INTO editory_group_id FROM hotel_groups WHERE slug = 'editory-hotels';
  END IF;

  RAISE NOTICE '🏨 Editory group ID: %', editory_group_id;

  -- ── 2. Insert all 12 hotels ────────────────────────────────────────────────
  -- On conflict, update name/tagline/location/coords/group_id (idempotent)

  INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, group_id, theme)
  VALUES

    -- ── VIANA DO CASTELO (1) ──────────────────────────────────────────────
    (
      'editory-flor-de-sal-viana',
      'Flôr de Sal by The Editory',
      'Beachside serenity on the Atlantic coast',
      'Viana do Castelo',
      41.6936,
      -8.8344,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),

    -- ── PORTO (5) ─────────────────────────────────────────────────────────
    (
      'editory-porto-palacio',
      'Porto Palácio Hotel by The Editory',
      'Five-star luxury on Avenida da Boavista',
      'Porto',
      41.1571,
      -8.6399,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-artist-baixa-porto',
      'The Editory Artist Baixa',
      'Art-inspired boutique stays in Porto''s city centre',
      'Porto',
      41.1459,
      -8.6113,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-house-ribeira-porto',
      'The Editory House Ribeira',
      'Authentic Porto living by the Douro River',
      'Porto',
      41.1399,
      -8.6143,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-boulevard-aliados-porto',
      'The Editory Boulevard Aliados',
      'Cosmopolitan stays on Avenida dos Aliados',
      'Porto',
      41.1485,
      -8.6110,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-garden-baixa-porto',
      'The Editory Garden Baixa',
      'Urban calm and a rare garden in central Porto',
      'Porto',
      41.1466,
      -8.6118,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),

    -- ── LISBOA (1) ────────────────────────────────────────────────────────
    (
      'editory-riverside-lisboa',
      'The Editory Riverside',
      'Historic elegance by the Tagus at Santa Apolónia',
      'Lisboa',
      38.7133,
      -9.1183,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),

    -- ── LAGOS (3) ─────────────────────────────────────────────────────────
    (
      'editory-aqualuz-lagos',
      'Aqualuz Lagos by The Editory',
      'Family holidays steps from the Algarve coast',
      'Lagos',
      37.1018,
      -8.6745,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-by-the-sea-lagos',
      'The Editory By The Sea Lagos',
      'Clifftop retreat at Ponta da Piedade',
      'Lagos',
      37.0822,
      -8.6947,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-residence-lagos',
      'The Editory Residence Lagos',
      'Apartment-style freedom near Praia do Camilo',
      'Lagos',
      37.0830,
      -8.6952,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),

    -- ── FUNCHAL (2) ───────────────────────────────────────────────────────
    (
      'editory-ocean-way-funchal',
      'The Editory Ocean Way Ajuda',
      'Sea views and Madeiran culture in Funchal',
      'Funchal',
      32.6469,
      -16.9132,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    ),
    (
      'editory-garden-carmo-funchal',
      'The Editory Garden Carmo',
      'Rooftop pool and urban calm in Funchal''s centre',
      'Funchal',
      32.6500,
      -16.9083,
      editory_group_id,
      '{
        "primaryColor": "#0f1923",
        "primaryTextColor": "#ffffff",
        "accentColor": "#c4a35a",
        "backgroundColor": "#FAFAF8",
        "surfaceColor": "#ffffff",
        "fontHeading": "Inter",
        "fontBody": "Inter"
      }'::jsonb
    )

  ON CONFLICT (id) DO UPDATE
    SET
      name       = EXCLUDED.name,
      tagline    = EXCLUDED.tagline,
      location   = EXCLUDED.location,
      latitude   = EXCLUDED.latitude,
      longitude  = EXCLUDED.longitude,
      group_id   = EXCLUDED.group_id,
      theme      = EXCLUDED.theme;

  RAISE NOTICE '✅  All 12 Editory Hotels inserted/updated.';

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
WHERE hg.slug = 'editory-hotels'
ORDER BY hc.location, hc.name;
*/
