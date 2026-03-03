-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011 — Seed hotel_experiences for all hotels with city defaults
--
-- Each hotel gets pre-loaded with the experiences from its city.
-- is_active = true for all seeded rows.
-- ON CONFLICT DO NOTHING preserves any rows already manually configured
-- (e.g. lisbon-hostel's existing selections are untouched).
--
-- City → hotel mapping:
--   Lisbon  → lisbon-hostel, editory-riverside-lisboa, pestana, bairro-alto
--   Porto   → editory-porto-palacio, editory-artist-baixa-porto,
--             editory-house-ribeira-porto, editory-boulevard-aliados-porto,
--             editory-garden-baixa-porto
--   Lagos   → editory-aqualuz-lagos, editory-by-the-sea-lagos, editory-residence-lagos
--   Funchal → editory-ocean-way-funchal, editory-garden-carmo-funchal
--   Viana   → editory-flor-de-sal-viana
-- ─────────────────────────────────────────────────────────────────────────────

-- We use a single CTE approach:
-- 1. Define hotel → city mapping in a VALUES table
-- 2. Join with experiences on city match
-- 3. Assign display_order per hotel via ROW_NUMBER()
-- 4. INSERT with ON CONFLICT DO NOTHING

WITH hotel_city_map(hotel_id, city_name) AS (
  VALUES
    -- Lisboa
    ('lisbon-hostel',                   'Lisbon'),
    ('editory-riverside-lisboa',        'Lisbon'),
    ('pestana',                         'Lisbon'),
    ('bairro-alto',                     'Lisbon'),
    -- Porto
    ('editory-porto-palacio',           'Porto'),
    ('editory-artist-baixa-porto',      'Porto'),
    ('editory-house-ribeira-porto',     'Porto'),
    ('editory-boulevard-aliados-porto', 'Porto'),
    ('editory-garden-baixa-porto',      'Porto'),
    -- Lagos
    ('editory-aqualuz-lagos',           'Lagos'),
    ('editory-by-the-sea-lagos',        'Lagos'),
    ('editory-residence-lagos',         'Lagos'),
    -- Funchal
    ('editory-ocean-way-funchal',       'Funchal'),
    ('editory-garden-carmo-funchal',    'Funchal'),
    -- Viana do Castelo
    ('editory-flor-de-sal-viana',       'Viana do Castelo')
),
ranked AS (
  SELECT
    hcm.hotel_id,
    e.id AS experience_id,
    true AS is_active,
    ROW_NUMBER() OVER (
      PARTITION BY hcm.hotel_id
      ORDER BY e.display_order NULLS LAST, e.id
    ) AS display_order
  FROM hotel_city_map hcm
  JOIN experiences e ON e.city = hcm.city_name
)
INSERT INTO hotel_experiences (hotel_id, experience_id, is_active, display_order)
SELECT hotel_id, experience_id, is_active, display_order
FROM ranked
ON CONFLICT (hotel_id, experience_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verify: count rows per hotel after seeding
-- ─────────────────────────────────────────────────────────────────────────────
SELECT hotel_id, count(*) AS total, sum(is_active::int) AS active
FROM hotel_experiences
GROUP BY hotel_id
ORDER BY hotel_id;
