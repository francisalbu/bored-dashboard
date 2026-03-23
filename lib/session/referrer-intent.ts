// ─────────────────────────────────────────────────────────────────────────────
// Session — Referrer Intent
// Infere intenção de persona com base no URL de origem (document.referrer)
// ─────────────────────────────────────────────────────────────────────────────

import { PersonaKey } from '../smartseer/personas';

type ReferrerSignal = {
  persona:    PersonaKey;
  confidence: number; // 0–100
};

// Mapeamento de keywords no referrer → persona
const REFERRER_PATTERNS: Array<{ keywords: string[]; signal: ReferrerSignal }> = [
  {
    keywords: ['surf', 'surfing', 'wave', 'bodyboard'],
    signal:   { persona: 'adrenaline_junkie', confidence: 85 },
  },
  {
    keywords: ['hiking', 'trekking', 'trail', 'caminhada'],
    signal:   { persona: 'adrenaline_junkie', confidence: 80 },
  },
  {
    keywords: ['party', 'nightlife', 'pubcrawl', 'pub-crawl', 'nightout'],
    signal:   { persona: 'social_butterfly', confidence: 90 },
  },
  {
    keywords: ['fado', 'museu', 'museum', 'historia', 'history', 'cultura', 'culture'],
    signal:   { persona: 'culture_buff', confidence: 85 },
  },
  {
    keywords: ['wine', 'vinho', 'gastro', 'food', 'brunch', 'tasting'],
    signal:   { persona: 'chill_foodie', confidence: 85 },
  },
  {
    keywords: ['dolphin', 'wildlife', 'nature', 'natureza', 'birds', 'ocean'],
    signal:   { persona: 'nature_lover', confidence: 88 },
  },
  {
    keywords: ['free tour', 'freetour', 'budget', 'cheap', 'low cost', 'mochila'],
    signal:   { persona: 'budget_explorer', confidence: 80 },
  },
  {
    keywords: ['nomad', 'remote work', 'coworking', 'digital nomad'],
    signal:   { persona: 'digital_nomad', confidence: 88 },
  },
];

export function detectReferrerIntent(referrer: string = document.referrer): ReferrerSignal | null {
  if (!referrer) return null;

  const lower = referrer.toLowerCase();

  for (const { keywords, signal } of REFERRER_PATTERNS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return signal;
    }
  }

  return null;
}

// Converte o sinal do referrer para um boost de persona score
export function referrerToBoost(signal: ReferrerSignal | null): Record<string, number> {
  if (!signal) return {};
  return { [signal.persona]: signal.confidence };
}
