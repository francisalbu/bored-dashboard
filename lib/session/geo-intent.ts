// ─────────────────────────────────────────────────────────────────────────────
// Session — Geo Intent
// Infere intenção de persona com base no país de origem do guest
// Usa ipapi.co (gratuito até 1000 req/dia) diretamente do browser
// ─────────────────────────────────────────────────────────────────────────────

export type GeoData = {
  country_code: string;   // 'PT', 'DE', 'US'…
  country_name: string;
  city:         string;
};

// Cache em memória para evitar múltiplas chamadas por sessão
let geoCache: GeoData | null = null;

export async function detectGeo(): Promise<GeoData | null> {
  if (geoCache) return geoCache;

  try {
    const res  = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();

    if (data.error) return null;

    geoCache = {
      country_code: data.country_code ?? 'PT',
      country_name: data.country_name ?? '',
      city:         data.city         ?? '',
    };

    return geoCache;
  } catch {
    // Timeout ou erro de rede → não bloquear o resto
    return null;
  }
}

// Mapping de país → boost de persona (mesma lógica do scoring-engine)
export function getGeoPersonaBoost(countryCode: string): Record<string, number> {
  // País de longa distância → quer ver tudo (cultura + natureza)
  const LONG_HAUL = ['US', 'CA', 'JP', 'AU', 'CN', 'KR', 'BR', 'MX', 'IN', 'SG', 'ZA', 'AR'];
  if (LONG_HAUL.includes(countryCode)) {
    return { culture_buff: 20, nature_lover: 10, adrenaline_junkie: 10 };
  }

  // Escandinávia → sol, natureza, aventura
  if (['NO', 'SE', 'FI', 'DK', 'IS'].includes(countryCode)) {
    return { nature_lover: 25, adrenaline_junkie: 15, chill_foodie: 10 };
  }

  // Europa jovem → social + budget
  if (['DE', 'NL', 'BE', 'PL', 'CZ', 'AT', 'HU', 'RO'].includes(countryCode)) {
    return { social_butterfly: 15, budget_explorer: 15 };
  }

  // UK & Irlanda → social + aventura
  if (['GB', 'IE'].includes(countryCode)) {
    return { social_butterfly: 20, adrenaline_junkie: 10 };
  }

  // Sul da Europa → foodie + cultura
  if (['ES', 'FR', 'IT'].includes(countryCode)) {
    return { chill_foodie: 20, culture_buff: 15 };
  }

  // Portugal → já conhece, provavelmente quer experiências únicas
  if (countryCode === 'PT') {
    return { chill_foodie: 10, budget_explorer: 15 };
  }

  return {};
}
