-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 003: AI Bot Configuration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Add bot_config JSONB column to hotel_config
ALTER TABLE hotel_config
ADD COLUMN IF NOT EXISTS bot_config JSONB DEFAULT '{
  "botName": "Concierge",
  "personality": "friendly",
  "language": "auto",
  "toneDescription": "",
  "customInstructions": "",
  "restrictions": [],
  "knowledgeEntries": [],
  "salesAggressiveness": "balanced",
  "maxResponseLength": "medium"
}'::jsonb;

-- Seed Vila Galé with a starting bot config
UPDATE hotel_config
SET bot_config = '{
  "botName": "Concierge",
  "personality": "premium",
  "language": "auto",
  "toneDescription": "Warm, knowledgeable, and passionate about Lisbon. Speaks like a trusted local friend who happens to work at a 5-star hotel.",
  "customInstructions": "Always ask about the guest interests before recommending. Prioritize paid experiences but offer free alternatives when asked. Use visual cards (EXPERIENCE_IDS) instead of text descriptions.",
  "restrictions": [],
  "knowledgeEntries": [],
  "salesAggressiveness": "balanced",
  "maxResponseLength": "medium"
}'::jsonb
WHERE id = 'vila-gale';

-- Done!
SELECT id, bot_config FROM hotel_config;
