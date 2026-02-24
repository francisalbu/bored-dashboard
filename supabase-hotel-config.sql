-- ─────────────────────────────────────────────────────────────────────────────
-- Hotel Config Table
-- Stores white-label configuration managed from the dashboard
-- Read by the public website to render the correct branding / features
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hotel_config (
  id TEXT PRIMARY KEY,                        -- e.g. 'vila-gale', 'pestana'
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  location TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  concierge_avatar_url TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  transportation_price NUMERIC DEFAULT 20,

  -- Theme / Branding (stored as JSONB for flexibility)
  theme JSONB NOT NULL DEFAULT '{
    "primaryColor": "#0f172a",
    "primaryTextColor": "#ffffff",
    "accentColor": "#10b981",
    "backgroundColor": "#FAFAF8",
    "surfaceColor": "#ffffff",
    "fontHeading": "Inter",
    "fontBody": "Inter"
  }'::jsonb,

  -- Staff members array
  staff_members JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Activity preferences
  activity_preferences JSONB NOT NULL DEFAULT '{
    "style": "mixed"
  }'::jsonb,

  -- Feature toggles — what sections are visible on the public website
  features JSONB NOT NULL DEFAULT '{
    "showActivities": true,
    "showSpa": true,
    "showDining": true,
    "showTransfers": true,
    "showRentals": true,
    "showReviews": true,
    "showHotelPicks": true,
    "showPreArrival": true,
    "enableInstantBooking": true
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_hotel_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hotel_config_timestamp ON hotel_config;
CREATE TRIGGER update_hotel_config_timestamp
BEFORE UPDATE ON hotel_config
FOR EACH ROW
EXECUTE FUNCTION update_hotel_config_timestamp();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed with existing hotel configs (matches hotelConfig.ts in the website)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, transportation_price, concierge_avatar_url, theme, staff_members, activity_preferences, features)
VALUES (
  'vila-gale',
  'Vila Galé',
  'DISCOVER',
  'Lisbon & Surroundings',
  38.7170,
  -9.1383,
  20,
  'https://storage.googleapis.com/bored_tourist_media/images/473801429_1013077440848496_8087265659102202312_n.jpg',
  '{
    "primaryColor": "#0f172a",
    "primaryTextColor": "#ffffff",
    "accentColor": "#10b981",
    "backgroundColor": "#FAFAF8",
    "surfaceColor": "#ffffff",
    "fontHeading": "Inter",
    "fontBody": "Inter"
  }'::jsonb,
  '[
    {"name": "Clara", "role": "Concierge", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", "bio": "Lisbon local for 15 years. I love showing guests the city''s hidden gems!", "preferredCategories": ["Outdoors", "Sports"]},
    {"name": "Joel", "role": "Front Desk Manager", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop", "bio": "Born and raised in Lisbon. I know every corner of this beautiful city!", "preferredCategories": ["Culture Dive", "Time Stories"]},
    {"name": "Gale", "role": "Guest Relations", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", "bio": "Passionate about Portuguese culture and helping guests create unforgettable memories!", "preferredCategories": ["Night Explorer", "Mind & Body"]}
  ]'::jsonb,
  '{"style": "mixed"}'::jsonb,
  '{
    "showActivities": true,
    "showSpa": true,
    "showDining": true,
    "showTransfers": true,
    "showRentals": true,
    "showReviews": true,
    "showHotelPicks": true,
    "showPreArrival": true,
    "enableInstantBooking": true
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, transportation_price, theme, staff_members, activity_preferences)
VALUES (
  'pestana',
  'Pestana Palace',
  'EXPLORE',
  'Lisboa',
  38.7072,
  -9.1858,
  25,
  '{
    "primaryColor": "#1a1a2e",
    "primaryTextColor": "#ffffff",
    "accentColor": "#c9a84c",
    "backgroundColor": "#F9F7F4",
    "surfaceColor": "#ffffff",
    "fontHeading": "Playfair Display",
    "fontBody": "Lato"
  }'::jsonb,
  '[
    {"name": "Ana", "role": "Head Concierge", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop", "bio": "With 20 years in luxury hospitality, I know exactly what makes a visit unforgettable.", "preferredCategories": ["Culture Dive", "Time Stories"]},
    {"name": "Ricardo", "role": "Guest Experience", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", "bio": "A foodie and history buff — I will take you well off the beaten path.", "preferredCategories": ["Local Cooking", "Culture Dive"]}
  ]'::jsonb,
  '{"preferredCategories": ["Culture Dive", "Time Stories", "Local Cooking"], "priceRange": {"min": 50}, "style": "luxury"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotel_config (id, name, tagline, location, latitude, longitude, transportation_price, theme, staff_members, activity_preferences)
VALUES (
  'bairro-alto',
  'Bairro Alto Hotel',
  'EXPERIENCE',
  'Lisboa',
  38.7112,
  -9.1440,
  18,
  '{
    "primaryColor": "#18181b",
    "primaryTextColor": "#ffffff",
    "accentColor": "#6366f1",
    "backgroundColor": "#f4f4f5",
    "surfaceColor": "#ffffff",
    "fontHeading": "DM Serif Display",
    "fontBody": "DM Sans"
  }'::jsonb,
  '[
    {"name": "Mariana", "role": "Concierge", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", "bio": "Bairro Alto is my backyard. Let me show you its secret doors and best tables.", "preferredCategories": ["Culture Dive", "Night Explorer"]},
    {"name": "Tiago", "role": "Front of House", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", "bio": "From hidden restaurants to private art studios — I connect guests with the real Lisbon.", "preferredCategories": ["Local Cooking", "Micro Adventures"]}
  ]'::jsonb,
  '{"preferredCategories": ["Culture Dive", "Night Explorer", "Local Cooking"], "style": "cultural"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE hotel_config ENABLE ROW LEVEL SECURITY;

-- Public read access (website reads without auth)
CREATE POLICY "Public read access" ON hotel_config
  FOR SELECT USING (true);

-- Service role can do everything (dashboard uses service key)
CREATE POLICY "Service role full access" ON hotel_config
  FOR ALL USING (auth.role() = 'service_role');
