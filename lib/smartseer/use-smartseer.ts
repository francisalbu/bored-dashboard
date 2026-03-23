// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — Hook Principal
// Orquestra toda a lógica: init sessão → scoring → rank → mensagem
// Usar na página de experiências do lisbon-hostel
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExperienceRow }                        from '../experienceService';
import { PersonaScore, getTopPersona, normalizeScores, PERSONAS } from './personas';
import { scoreEvent, ScoringEvent }             from './scoring-engine';
import { rankExperiences, SessionContext }       from './context-filter';
import { getSmartMessage, SmartMessage }        from './smart-messages';
import { initSession, flushBehaviorEvents, AnonymousSession } from '../session/session-manager';

// ─── Opções do hook ───────────────────────────────────────────────────────────
type UseSmartSeerOptions = {
  hotelId:     string;
  experiences: ExperienceRow[];
  enabled?:    boolean;   // false → desativa SmartSeer (outros hotéis)
};

// ─── Return type ──────────────────────────────────────────────────────────────
export type SmartSeerState = {
  // Experiências reordenadas em tempo real
  ranked:          ExperienceRow[];

  // Estado da sessão
  session:         AnonymousSession | null;
  context:         SessionContext;
  personaScores:   PersonaScore;
  topPersona:      string;
  topPersonaMeta:  typeof PERSONAS[keyof typeof PERSONAS] | null;

  // Mensagem contextual
  smartMessage:    SmartMessage | null;

  // Loading inicial
  loading:         boolean;

  // Função para registar um evento (clique, pause, dismiss, etc.)
  trackEvent:      (event: Omit<ScoringEvent, 'timestamp'>) => void;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSmartSeer({
  hotelId,
  experiences,
  enabled = true,
}: UseSmartSeerOptions): SmartSeerState {

  const [session, setSession]       = useState<AnonymousSession | null>(null);
  const [scores,  setScores]        = useState<PersonaScore>(getEmptyScores());
  const [ranked,  setRanked]        = useState<ExperienceRow[]>(experiences);
  const [loading, setLoading]       = useState(true);

  const pendingEvents = useRef<ScoringEvent[]>([]);
  const sessionRef    = useRef<AnonymousSession | null>(null);

  // ── 1. Inicializar sessão no mount ─────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setRanked(experiences);
      setLoading(false);
      return;
    }

    initSession(hotelId).then(sess => {
      sessionRef.current = sess;
      setSession(sess);
      setScores(sess.personaScores);

      // Rank inicial com os boosters passivos
      const initialRanked = rankExperiences(experiences, {
        context:         sess.context,
        currentHour:     sess.entryHour,
        personaScores:   sess.personaScores,
        spendingProfile: sess.spendingProfile,
      });
      setRanked(initialRanked);
      setLoading(false);
    });
  }, [hotelId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Re-rank quando experiences mudam (ex: filtro de categoria) ──────────
  useEffect(() => {
    if (!session || !enabled) {
      setRanked(experiences);
      return;
    }
    const reranked = rankExperiences(experiences, {
      context:         session.context,
      currentHour:     new Date().getHours(),
      personaScores:   scores,
      spendingProfile: session.spendingProfile,
    });
    setRanked(reranked);
  }, [experiences]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Registar evento ─────────────────────────────────────────────────────
  const trackEvent = useCallback((event: Omit<ScoringEvent, 'timestamp'>) => {
    if (!enabled) return;

    const fullEvent: ScoringEvent = { ...event, timestamp: Date.now() };

    // Atualizar scores localmente (instantâneo — sem esperar Supabase)
    setScores(prev => {
      const updated    = scoreEvent(prev, fullEvent);
      const normalized = normalizeScores(updated);
      const sess       = sessionRef.current;

      if (sess) {
        // Re-rank em tempo real
        const reranked = rankExperiences(experiences, {
          context:         sess.context,
          currentHour:     new Date().getHours(),
          personaScores:   normalized,
          spendingProfile: sess.spendingProfile,
        });
        setRanked(reranked);
      }

      return normalized;
    });

    // Acumular para flush em batch
    pendingEvents.current.push(fullEvent);

    // Flush ao Supabase de 3 em 3 eventos
    if (pendingEvents.current.length >= 3) {
      const toFlush = [...pendingEvents.current];
      pendingEvents.current = [];

      setScores(latest => {
        const top = getTopPersona(latest);
        const tok = sessionRef.current?.sessionToken;
        if (tok) flushBehaviorEvents(tok, toFlush, latest, top);
        return latest;
      });
    }
  }, [enabled, experiences]);

  // ── 4. Flush ao sair da página ─────────────────────────────────────────────
  useEffect(() => {
    const handleUnload = () => {
      if (pendingEvents.current.length === 0) return;
      const tok = sessionRef.current?.sessionToken;
      if (!tok) return;
      // sendBeacon para garantir envio mesmo ao fechar o tab
      const payload = JSON.stringify({
        token:  tok,
        events: pendingEvents.current,
      });
      navigator.sendBeacon('/api/smartseer/flush', payload);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // ── 5. Calcular persona e mensagem ────────────────────────────────────────
  const topPersona     = getTopPersona(scores);
  const topPersonaMeta = PERSONAS[topPersona] ?? null;
  const context        = session?.context ?? 'in_stay';
  const smartMessage   = (!loading && enabled)
    ? getSmartMessage(topPersona, context, new Date().getHours())
    : null;

  return {
    ranked,
    session,
    context,
    personaScores:  scores,
    topPersona,
    topPersonaMeta,
    smartMessage,
    loading,
    trackEvent,
  };
}

// Helper local (evita import circular)
function getEmptyScores() {
  return {
    social_butterfly:  0,
    digital_nomad:     0,
    adrenaline_junkie: 0,
    culture_buff:      0,
    chill_foodie:      0,
    budget_explorer:   0,
    nature_lover:      0,
  };
}
