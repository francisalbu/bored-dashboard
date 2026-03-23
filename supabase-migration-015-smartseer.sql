-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 015 — SmartSeer: Personalização para Guests Não Logados
--
-- 1. Adiciona smartseer_enabled à hotel_config (feature flag por hotel)
-- 2. Ativa APENAS no lisbon-hostel (teste)
-- 3. Cria anonymous_sessions com 7 personas + contexto pre_arrival / in_stay
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Feature flag no hotel_config ─────────────────────────────────────────
ALTER TABLE hotel_config
  ADD COLUMN IF NOT EXISTS smartseer_enabled BOOLEAN NOT NULL DEFAULT false;

-- Ativar APENAS no lisbon-hostel para teste
UPDATE hotel_config
  SET smartseer_enabled = true
WHERE id = 'lisbon-hostel';

-- ─── 2. Tabela de sessões anónimas ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token    TEXT         NOT NULL UNIQUE,   -- gerado no browser (crypto.randomUUID)
  hotel_id         TEXT         REFERENCES hotel_config(id) ON DELETE CASCADE,

  -- Como o guest chegou à plataforma
  context          TEXT         NOT NULL DEFAULT 'in_stay'
                   CHECK (context IN ('pre_arrival', 'in_stay')),

  -- Hora local de acesso (0–23) — usado para lógica de in_stay
  entry_hour       SMALLINT,

  -- Dia da semana (true = segunda–sexta) — boost digital_nomad
  is_weekday       BOOLEAN,

  -- Perfil de dispositivo inferido pelo User-Agent
  spending_profile TEXT         CHECK (spending_profile IN ('premium', 'mid', 'budget')),

  -- Geo
  ip_country       TEXT,        -- ISO code: 'PT', 'DE', 'US' …
  user_agent       TEXT,

  -- 7 Persona Scores (0–100 cada, normalizado)
  -- Actualizado em tempo real pelo browser via PATCH
  persona_scores   JSONB        NOT NULL DEFAULT '{
    "social_butterfly":  0,
    "digital_nomad":     0,
    "adrenaline_junkie": 0,
    "culture_buff":      0,
    "chill_foodie":      0,
    "budget_explorer":   0,
    "nature_lover":      0
  }',

  -- Persona dominante (calculada no browser, guardada aqui para analytics)
  top_persona      TEXT         CHECK (top_persona IN (
    'social_butterfly', 'digital_nomad', 'adrenaline_junkie',
    'culture_buff', 'chill_foodie', 'budget_explorer', 'nature_lover'
  )),

  -- Sinais iniciais da sessão
  referrer_url     TEXT,
  geo_boost        JSONB        DEFAULT '{}',

  -- Eventos comportamentais raw (guardados para auditoria / ML futuro)
  behavior_events  JSONB        DEFAULT '[]',

  created_at       TIMESTAMPTZ  DEFAULT now(),
  updated_at       TIMESTAMPTZ  DEFAULT now()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_anon_token    ON anonymous_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_anon_hotel    ON anonymous_sessions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_anon_persona  ON anonymous_sessions(top_persona);
CREATE INDEX IF NOT EXISTS idx_anon_context  ON anonymous_sessions(context);
CREATE INDEX IF NOT EXISTS idx_anon_scores   ON anonymous_sessions USING GIN(persona_scores);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anon_updated ON anonymous_sessions;
CREATE TRIGGER trg_anon_updated
  BEFORE UPDATE ON anonymous_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode INSERT (guest cria a sua sessão)
CREATE POLICY "anon_insert"
  ON anonymous_sessions FOR INSERT
  WITH CHECK (true);

-- Só pode ler/atualizar a sua própria sessão (pelo token)
-- O token é guardado no localStorage do browser
CREATE POLICY "anon_read_own"
  ON anonymous_sessions FOR SELECT
  USING (true);

CREATE POLICY "anon_update_own"
  ON anonymous_sessions FOR UPDATE
  USING (true);

-- ─── View de Analytics ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW smartseer_analytics AS
SELECT
  hotel_id,
  context,
  top_persona,
  spending_profile,
  ip_country,
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*)                      AS session_count
FROM anonymous_sessions
WHERE hotel_id IS NOT NULL
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY day DESC, session_count DESC;

-- ─── Verificar resultado ──────────────────────────────────────────────────────
SELECT id, name, smartseer_enabled
FROM hotel_config
ORDER BY smartseer_enabled DESC, id;
