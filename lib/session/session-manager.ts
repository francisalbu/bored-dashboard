// ─────────────────────────────────────────────────────────────────────────────
// Session Manager — Orquestrador principal (client-side, Vite SPA)
// Substitui o middleware de Next.js: lê URL params, cria sessão no Supabase,
// aplica boosters passivos e persiste o token no localStorage
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../supabase';
import { detectSpendingProfile }           from './device-profile';
import { detectGeo, getGeoPersonaBoost }   from './geo-intent';
import { detectReferrerIntent, referrerToBoost } from './referrer-intent';
import { emptyPersonaScore, normalizeScores, PersonaScore } from '../smartseer/personas';
import { applySessionBoosters }            from '../smartseer/scoring-engine';
import { SessionContext }                  from '../smartseer/context-filter';
import { ScoringEvent }                    from '../smartseer/scoring-engine';

const STORAGE_KEY = 'bored_session_token';
const HOTEL_KEY   = 'bored_hotel_id';
const CTX_KEY     = 'bored_ctx';

// ─── Ler contexto da URL ──────────────────────────────────────────────────────
// Pre-Arrival: ?ctx=pre&hotel=lisbon-hostel  (link de email)
// In-Stay:     ?ctx=stay&hotel=lisbon-hostel (QR Code do cartão do quarto)
export function readSessionContext(): {
  context:  SessionContext;
  hotelId:  string | null;
} {
  const params  = new URLSearchParams(window.location.search);
  const ctx     = params.get('ctx');
  const hotel   = params.get('hotel');

  // Persistir no localStorage para não perder o contexto ao navegar
  if (ctx)   localStorage.setItem(CTX_KEY,   ctx);
  if (hotel) localStorage.setItem(HOTEL_KEY, hotel);

  const savedCtx   = ctx   ?? localStorage.getItem(CTX_KEY);
  const savedHotel = hotel ?? localStorage.getItem(HOTEL_KEY);

  const context: SessionContext =
    savedCtx === 'pre' ? 'pre_arrival' : 'in_stay';

  return { context, hotelId: savedHotel };
}

// ─── Gerar ou recuperar token de sessão ───────────────────────────────────────
function getOrCreateToken(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, token);
  return token;
}

// ─── Tipo da sessão guardada ──────────────────────────────────────────────────
export type AnonymousSession = {
  id:              string;
  sessionToken:    string;
  hotelId:         string | null;
  context:         SessionContext;
  personaScores:   PersonaScore;
  topPersona:      string | null;
  spendingProfile: 'premium' | 'mid' | 'budget';
  ipCountry:       string | null;
  entryHour:       number;
  isWeekday:       boolean;
};

// ─── Inicializar sessão ───────────────────────────────────────────────────────
// Chamado UMA VEZ quando o guest abre a página
// 1. Lê contexto da URL
// 2. Recolhe sinais passivos (device, geo, referrer)
// 3. Aplica boosters de sessão
// 4. Persiste no Supabase (upsert pelo token)
export async function initSession(hotelIdOverride?: string): Promise<AnonymousSession> {
  const token                 = getOrCreateToken();
  const { context, hotelId: urlHotelId } = readSessionContext();
  const hotelId               = hotelIdOverride ?? urlHotelId;
  const now                   = new Date();
  const entryHour             = now.getHours();
  const isWeekday             = now.getDay() >= 1 && now.getDay() <= 5;
  const spendingProfile       = detectSpendingProfile();

  // Sinais passivos (assíncronos)
  const geo           = await detectGeo();
  const referrerSig   = detectReferrerIntent();

  // Construir scores iniciais
  let scores = emptyPersonaScore();

  // 1. Boosters de sessão (país, hora, device)
  const sessionBoosts = applySessionBoosters({
    accessHour:      entryHour,
    isWeekday,
    originCountry:   geo?.country_code ?? 'PT',
    spendingProfile,
  });
  Object.keys(scores).forEach(k => {
    scores[k as keyof PersonaScore] += sessionBoosts[k as keyof PersonaScore];
  });

  // 2. Boost de geo
  if (geo) {
    const geoBoost = getGeoPersonaBoost(geo.country_code);
    Object.entries(geoBoost).forEach(([k, v]) => {
      if (k in scores) scores[k as keyof PersonaScore] += v;
    });
  }

  // 3. Boost de referrer
  const refBoost = referrerToBoost(referrerSig);
  Object.entries(refBoost).forEach(([k, v]) => {
    if (k in scores) scores[k as keyof PersonaScore] += v;
  });

  scores = normalizeScores(scores);

  const topPersona = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Persistir no Supabase (upsert pelo session_token)
  const { data } = await supabase
    .from('anonymous_sessions')
    .upsert({
      session_token:    token,
      hotel_id:         hotelId,
      context,
      entry_hour:       entryHour,
      is_weekday:       isWeekday,
      spending_profile: spendingProfile,
      ip_country:       geo?.country_code ?? null,
      user_agent:       navigator.userAgent,
      persona_scores:   scores,
      top_persona:      topPersona,
      referrer_url:     document.referrer || null,
    }, { onConflict: 'session_token' })
    .select()
    .single();

  return {
    id:              data?.id ?? '',
    sessionToken:    token,
    hotelId,
    context,
    personaScores:   scores,
    topPersona,
    spendingProfile,
    ipCountry:       geo?.country_code ?? null,
    entryHour,
    isWeekday,
  };
}

// ─── Flush de eventos comportamentais ────────────────────────────────────────
// Chamado pelo hook depois de acumular eventos (batch de 3+)
export async function flushBehaviorEvents(
  token:         string,
  events:        ScoringEvent[],
  latestScores:  PersonaScore,
  topPersona:    string,
): Promise<void> {
  // Buscar eventos existentes para append
  const { data: existing } = await supabase
    .from('anonymous_sessions')
    .select('behavior_events')
    .eq('session_token', token)
    .single();

  const prevEvents = (existing?.behavior_events as ScoringEvent[]) ?? [];

  await supabase
    .from('anonymous_sessions')
    .update({
      persona_scores:  latestScores,
      top_persona:     topPersona,
      behavior_events: [...prevEvents, ...events].slice(-50), // guardar últimos 50
    })
    .eq('session_token', token);
}
