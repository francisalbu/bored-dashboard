-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add welcome content + experience ordering
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add welcome/content fields to hotel_config
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS welcome_title TEXT DEFAULT 'Welcome to';
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS welcome_subtitle TEXT DEFAULT '';
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS welcome_description TEXT DEFAULT 'I''m your digital concierge. Ask me anything about the city, or let me find your next adventure.';
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS quick_suggestions JSONB DEFAULT '[
  {"emoji": "🗓️", "label": "2 Day Itinerary", "prompt": "What do you recommend for a 2 day stay?"},
  {"emoji": "👨‍👩‍👧‍👦", "label": "Family Activities", "prompt": "What can I do as a family of 4?"},
  {"emoji": "🤿", "label": "Diving Spots", "prompt": "We want to do dive, where can we go?"}
]'::jsonb;

-- 2. Seed welcome fields for Vila Galé
UPDATE hotel_config SET
  welcome_title = 'Welcome to',
  welcome_subtitle = 'Vila Gale Opera',
  welcome_description = 'I''m your digital concierge. Ask me anything about the city, or let me find your next adventure.',
  quick_suggestions = '[
    {"emoji": "🗓️", "label": "2 Day Itinerary", "prompt": "What do you recommend for a 2 day stay?"},
    {"emoji": "👨‍👩‍👧‍👦", "label": "Family Activities", "prompt": "What can I do as a family of 4?"},
    {"emoji": "🤿", "label": "Diving Spots", "prompt": "We want to do dive, where can we go?"}
  ]'::jsonb
WHERE id = 'vila-gale';

-- 3. Add display_order to experiences table
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 4. Set initial display_order based on current id (preserves current order)
UPDATE experiences SET display_order = id WHERE display_order = 0;
