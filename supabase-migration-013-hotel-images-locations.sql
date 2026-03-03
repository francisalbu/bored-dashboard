-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013 — Set hotel images (concierge_avatar_url + logo_url)
--                 and location display text per hotel
--
-- concierge_avatar_url → shown in the welcome panel and chat avatar
-- logo_url             → shown in the chat header (desktop)
-- location             → shown as "Discover X" in the top header
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Lisbon ────────────────────────────────────────────────────────────────────
UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/lv1dmvup/riverside_lifetyle-51.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/lv1dmvup/riverside_lifetyle-51.jpg',
  location             = 'Lisbon & Surroundings'
WHERE id = 'editory-riverside-lisboa';

UPDATE hotel_config SET
  location = 'Lisbon & Surroundings'
WHERE id IN ('pestana', 'bairro-alto', 'lisbon-hostel');

-- ── Porto ─────────────────────────────────────────────────────────────────────
UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/ublaj0lb/porto_palacio-122.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/ublaj0lb/porto_palacio-122.jpg',
  location             = 'Porto & Surroundings'
WHERE id = 'editory-porto-palacio';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/me4hmhyr/artist0301_1.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/me4hmhyr/artist0301_1.jpg',
  location             = 'Porto & Surroundings'
WHERE id = 'editory-artist-baixa-porto';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/wcwjqexf/647a6347.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/wcwjqexf/647a6347.jpg',
  location             = 'Porto & Surroundings'
WHERE id = 'editory-house-ribeira-porto';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/dhjmai14/boulevard0103.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/dhjmai14/boulevard0103.jpg',
  location             = 'Porto & Surroundings'
WHERE id = 'editory-boulevard-aliados-porto';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/pwoch2lx/647a5843.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/pwoch2lx/647a5843.jpg',
  location             = 'Porto & Surroundings'
WHERE id = 'editory-garden-baixa-porto';

-- ── Lagos ─────────────────────────────────────────────────────────────────────
UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/leqfmfxd/img_2804.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/leqfmfxd/img_2804.jpg',
  location             = 'Lagos & Surroundings'
WHERE id = 'editory-aqualuz-lagos';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/q11lmhh4/edbts_0008.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/q11lmhh4/edbts_0008.jpg',
  location             = 'Lagos & Surroundings'
WHERE id = 'editory-by-the-sea-lagos';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/emripvfk/7.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/emripvfk/7.jpg',
  location             = 'Lagos & Surroundings'
WHERE id = 'editory-residence-lagos';

-- ── Funchal ───────────────────────────────────────────────────────────────────
UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/xzudzlvf/editory_ocean_way_rooftop_17122025_0213.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/xzudzlvf/editory_ocean_way_rooftop_17122025_0213.jpg',
  location             = 'Funchal & Surroundings'
WHERE id = 'editory-ocean-way-funchal';

UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/ladhn3a2/teg_balcony-double-10.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/ladhn3a2/teg_balcony-double-10.jpg',
  location             = 'Funchal & Surroundings'
WHERE id = 'editory-garden-carmo-funchal';

-- ── Viana do Castelo ──────────────────────────────────────────────────────────
UPDATE hotel_config SET
  concierge_avatar_url = 'https://www.editoryhotels.com/media/mbdajquj/4i6a2821.jpg',
  logo_url             = 'https://www.editoryhotels.com/media/mbdajquj/4i6a2821.jpg',
  location             = 'Viana do Castelo'
WHERE id = 'editory-flor-de-sal-viana';

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT id, name, location, subdomain,
       left(concierge_avatar_url, 60) AS avatar_preview
FROM hotel_config
ORDER BY location, id;
