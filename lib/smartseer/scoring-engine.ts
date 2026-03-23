// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — Scoring Engine
// Aprende com o que o guest faz (positivo) e com o que rejeita (negativo)
// ─────────────────────────────────────────────────────────────────────────────

import {
  TAG_WEIGHTS,
  CATEGORY_WEIGHTS,
  PersonaScore,
  PersonaKey,
  emptyPersonaScore,
} from './personas';

// ─── Tipos de Evento ──────────────────────────────────────────────────────────
export type ScoringEventType =
  | 'click'           // abriu o card               → +1.5x
  | 'scroll_pause'    // parou no card (>1.5s)       → +1.0x
  | 'hover'           // mouse ficou em cima         → +0.5x
  | 'booking_start'   // clicou em Book / Reserve    → +3.0x
  | 'card_dismiss'    // fechou o card (X)           → -2.0x  ❌
  | 'fast_scroll'     // passou em <400ms            → -0.5x  ❌
  | 'scroll_skip';    // saltou categoria inteira    → -1.0x  ❌

export type ScoringEvent = {
  type:         ScoringEventType;
  experienceId: string;
  tags:         string[];
  category:     string;
  price:        number;
  durationH:    number;
  timestamp:    number;
};

// ─── Multiplicadores por tipo ─────────────────────────────────────────────────
const EVENT_MULTIPLIER: Record<ScoringEventType, number> = {
  booking_start: 3.0,   // ✅ intenção máxima
  click:         1.5,   // ✅ interesse claro
  scroll_pause:  1.0,   // ✅ interesse passivo
  hover:         0.5,   // ✅ curiosidade leve
  card_dismiss: -2.0,   // ❌ "não quero isto"
  fast_scroll:  -0.5,   // ❌ passou a correr
  scroll_skip:  -1.0,   // ❌ saltou categoria inteira
};

export const NEGATIVE_EVENTS = new Set<ScoringEventType>([
  'card_dismiss', 'fast_scroll', 'scroll_skip',
]);

export function isNegativeEvent(type: ScoringEventType): boolean {
  return NEGATIVE_EVENTS.has(type);
}

// ─── Scorer principal ─────────────────────────────────────────────────────────
// Atualiza os scores de persona com base num evento.
// Scores NUNCA descem abaixo de 0.
export function scoreEvent(
  current: PersonaScore,
  event:   ScoringEvent,
): PersonaScore {
  const updated    = { ...current };
  const multiplier = EVENT_MULTIPLIER[event.type];

  // Score por tags da experiência
  for (const tag of event.tags) {
    const weights = TAG_WEIGHTS[tag];
    if (!weights) continue;

    for (const [persona, pts] of Object.entries(weights) as [PersonaKey, number][]) {
      const delta = pts * multiplier;
      updated[persona] = Math.max(0, (updated[persona] ?? 0) + delta);
    }
  }

  // Score por categoria
  const catWeights = CATEGORY_WEIGHTS[event.category];
  if (catWeights) {
    for (const [persona, pts] of Object.entries(catWeights) as [PersonaKey, number][]) {
      const delta = pts * multiplier;
      updated[persona] = Math.max(0, (updated[persona] ?? 0) + delta);
    }
  }

  return updated;
}

// ─── Boosters de sessão (aplicados UMA VEZ no início) ────────────────────────
// Sinais passivos: país de origem, hora de acesso, device
export type SessionSignals = {
  accessHour:      number;   // 0–23
  isWeekday:       boolean;  // segunda–sexta
  originCountry:   string;   // ISO: 'US', 'DE', 'JP'…
  spendingProfile: 'premium' | 'mid' | 'budget';
};

export function applySessionBoosters(signals: SessionSignals): PersonaScore {
  const scores = emptyPersonaScore();

  // 💻 Digital Nomad: acessa entre 9h–17h em dia útil
  if (signals.isWeekday && signals.accessHour >= 9 && signals.accessHour <= 17) {
    scores.digital_nomad += 25;
  }

  // 🏛️ Culture Buff + 🌿 Nature: país de longa distância = veio ver tudo
  const LONG_HAUL = ['US', 'CA', 'JP', 'AU', 'CN', 'KR', 'BR', 'MX', 'IN', 'SG', 'ZA', 'AR'];
  if (LONG_HAUL.includes(signals.originCountry)) {
    scores.culture_buff      += 20;
    scores.nature_lover      += 10;
    scores.adrenaline_junkie += 10;
  }

  // 🌿 Nature + 🏄 Adrenalina: Escandinávia — querem sol, natureza e aventura
  const SCANDINAVIA = ['NO', 'SE', 'FI', 'DK', 'IS'];
  if (SCANDINAVIA.includes(signals.originCountry)) {
    scores.nature_lover      += 25;
    scores.adrenaline_junkie += 15;
    scores.chill_foodie      += 10;
  }

  // 🎉 Social + 🎒 Budget: Europa jovem
  const YOUNG_EUROPE = ['DE', 'NL', 'BE', 'PL', 'CZ', 'AT', 'HU', 'RO'];
  if (YOUNG_EUROPE.includes(signals.originCountry)) {
    scores.social_butterfly += 15;
    scores.budget_explorer  += 15;
  }

  // 🎉 Social: UK & Irlanda — pub culture
  if (['GB', 'IE'].includes(signals.originCountry)) {
    scores.social_butterfly  += 20;
    scores.adrenaline_junkie += 10;
  }

  // 🍷 Foodie + 🏛️ Culture: Sul da Europa
  if (['ES', 'FR', 'IT'].includes(signals.originCountry)) {
    scores.chill_foodie  += 20;
    scores.culture_buff  += 15;
  }

  // 🎒 Budget Explorer: device low-end
  if (signals.spendingProfile === 'budget') {
    scores.budget_explorer += 30;
  }

  // 🍷 Chill Foodie + 🏄 Adrenalina: device premium
  if (signals.spendingProfile === 'premium') {
    scores.chill_foodie      += 15;
    scores.adrenaline_junkie += 10;
  }

  return scores;
}
