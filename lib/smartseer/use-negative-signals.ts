// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — Negative Signals Hooks
// Deteta fast_scroll (passou rápido), card_dismiss (X) e scroll_skip (categoria)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback, useEffect } from 'react';
import { ScoringEvent, ScoringEventType } from './scoring-engine';
import { ExperienceRow }                  from '../experienceService';
import { parseDurationHours }             from './personas';

type TrackFn = (event: Omit<ScoringEvent, 'timestamp'>) => void;

// ─── 1. Fast Scroll Detection ─────────────────────────────────────────────────
// Se o guest passa por um card em menos de FAST_THRESHOLD_MS → fast_scroll
export function useFastScrollDetector(
  experience: ExperienceRow,
  trackEvent: TrackFn,
) {
  const FAST_THRESHOLD_MS = 400;
  const enterTime = useRef<number | null>(null);

  const onEnter = useCallback(() => {
    enterTime.current = Date.now();
  }, []);

  const onLeave = useCallback(() => {
    if (!enterTime.current) return;
    const elapsed = Date.now() - enterTime.current;

    if (elapsed < FAST_THRESHOLD_MS) {
      trackEvent({
        type:         'fast_scroll',
        experienceId: String(experience.id),
        tags:         experience.tags ?? [],
        category:     experience.category,
        price:        experience.price,
        durationH:    parseDurationHours(experience.duration),
      });
    }

    enterTime.current = null;
  }, [experience, trackEvent]);

  return { onEnter, onLeave };
}

// ─── 2. Card Dismiss ──────────────────────────────────────────────────────────
// Retorna um onClick para o botão ✕ do card
export function useCardDismiss(
  experience: ExperienceRow,
  trackEvent: TrackFn,
) {
  const onDismiss = useCallback(() => {
    trackEvent({
      type:         'card_dismiss',
      experienceId: String(experience.id),
      tags:         experience.tags ?? [],
      category:     experience.category,
      price:        experience.price,
      durationH:    parseDurationHours(experience.duration),
    });
  }, [experience, trackEvent]);

  return { onDismiss };
}

// ─── 3. Scroll Pause Detection ────────────────────────────────────────────────
// Se o guest fica parado num card mais de PAUSE_THRESHOLD_MS → scroll_pause (positivo)
export function useScrollPauseDetector(
  experience: ExperienceRow,
  trackEvent: TrackFn,
) {
  const PAUSE_THRESHOLD_MS = 1500;
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef  = useRef(false);

  const onEnter = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        trackEvent({
          type:         'scroll_pause',
          experienceId: String(experience.id),
          tags:         experience.tags ?? [],
          category:     experience.category,
          price:        experience.price,
          durationH:    parseDurationHours(experience.duration),
        });
      }
    }, PAUSE_THRESHOLD_MS);
  }, [experience, trackEvent]);

  const onLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { onEnter, onLeave };
}

// ─── 4. Category Skip Detection ──────────────────────────────────────────────
// Se uma secção de categoria fica visível > 2s sem interação → scroll_skip
export function useCategorySkipDetector(
  category:   string,
  trackEvent: TrackFn,
) {
  const SKIP_THRESHOLD_MS  = 2000;
  const hasInteracted      = useRef(false);
  const timerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef         = useRef<HTMLElement | null>(null);

  const onInteraction = useCallback(() => {
    hasInteracted.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Chama quando a secção entra no viewport (IntersectionObserver)
  const onVisible = useCallback(() => {
    hasInteracted.current = false;
    timerRef.current = setTimeout(() => {
      if (!hasInteracted.current) {
        trackEvent({
          type:         'scroll_skip',
          experienceId: `category-${category}`,
          tags:         [],
          category,
          price:        0,
          durationH:    0,
        });
      }
    }, SKIP_THRESHOLD_MS);
  }, [category, trackEvent]);

  const onHidden = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Configura o IntersectionObserver automaticamente
  const setSectionRef = useCallback((el: HTMLElement | null) => {
    sectionRef.current = el;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible();
        else                       onHidden();
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    // Cleanup ao desmontar
    return () => observer.disconnect();
  }, [onVisible, onHidden]);

  return { setSectionRef, onInteraction };
}

// ─── 5. Combined Card Tracker ─────────────────────────────────────────────────
// Combina fast_scroll + scroll_pause num único hook para usar no card
export function useCardTracker(
  experience: ExperienceRow,
  trackEvent: TrackFn,
) {
  const fastScroll  = useFastScrollDetector(experience, trackEvent);
  const pauseDetect = useScrollPauseDetector(experience, trackEvent);
  const dismiss     = useCardDismiss(experience, trackEvent);

  const onEnter = useCallback(() => {
    fastScroll.onEnter();
    pauseDetect.onEnter();
  }, [fastScroll, pauseDetect]);

  const onLeave = useCallback(() => {
    fastScroll.onLeave();
    pauseDetect.onLeave();
  }, [fastScroll, pauseDetect]);

  return {
    onEnter,
    onLeave,
    onDismiss: dismiss.onDismiss,
  };
}
