// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — Context Filter + Experience Ranker
// Pre-Arrival vs In-Stay: filtra e ordena as experiências por relevância
// ─────────────────────────────────────────────────────────────────────────────

import { PersonaScore, getTopTwoPersonas, parseDurationHours } from './personas';
import { ExperienceRow } from '../experienceService';

export type SessionContext = 'pre_arrival' | 'in_stay';

export type RankOptions = {
  context:         SessionContext;
  currentHour:     number;        // 0–23 hora local do guest
  personaScores:   PersonaScore;
  spendingProfile: 'premium' | 'mid' | 'budget';
};

// ─── Tags relevantes por persona ──────────────────────────────────────────────
const PERSONA_TAGS: Record<string, string[]> = {
  social_butterfly:  ['Party', 'Pub Crawl', 'Live Music', 'Beer', 'Group', 'Nightlife', 'Bar', 'Social', 'Dinner', 'Fado', 'Cruise', 'Rooftop'],
  digital_nomad:     ['After-work', 'E-Bike', 'Sunset', 'Scenic', 'Photography', 'Panoramic', 'Relaxing', 'Viewpoints', 'Self-Drive'],
  adrenaline_junkie: ['Surf', 'Kayak', 'Coasteering', 'Cliff Jumping', 'Paragliding', '4x4', 'Off-Road', 'Adrenaline', 'Extreme', 'Rock Climbing', 'Scuba Diving', 'Cycling'],
  culture_buff:      ['History', 'UNESCO', 'Architecture', 'Art', 'Museum', 'Guided Tour', 'Walking Tour', 'Heritage', 'Alfama', 'Fado', 'Azulejo', 'Dark History', 'Storytelling'],
  chill_foodie:      ['Wine', 'Tasting', 'Brunch', 'Sunset', 'Cooking Class', 'Food Tour', 'Petiscos', 'Gastronomy', 'Gourmet', 'Romantic', 'Sailing', 'Rooftop'],
  budget_explorer:   ['Free Tour', 'Free', 'Pay What You Wish', 'Walking Tour', 'E-Bike', 'Street Art', 'Self-Guided', 'Tip-Based', 'Budget'],
  nature_lover:      ['Dolphins', 'Wildlife', 'Cork Forest', 'Ocean', 'Birdwatching', 'Nature', 'Safari', 'Hiking', 'Coastal', 'Sintra', 'Alentejo', 'Conservation'],
};

// ─── Filtro Pre-Arrival ───────────────────────────────────────────────────────
// Destaca experiências que valem a pena PLANEAR ANTES DE CHEGAR:
// → duração longa (logística), preço alto (garantir lugar), tours icónicos
function filterPreArrival(experiences: ExperienceRow[]): ExperienceRow[] {
  return experiences.filter(exp => {
    const hours = parseDurationHours(exp.duration);
    const tags  = exp.tags ?? [];
    return (
      hours >= 3 ||                          // meio dia ou mais
      exp.price >= 40 ||                     // alto valor = vale reservar cedo
      tags.includes('Full Day') ||
      tags.includes('UNESCO') ||
      tags.includes('Must Do') ||
      tags.includes('Dolphins') ||           // wildlife = esgota rápido
      tags.includes('Surf') ||               // grupos limitados
      tags.includes('Cork Forest') ||
      tags.includes('Cooking Class')
    );
  });
}

// ─── Filtro In-Stay ───────────────────────────────────────────────────────────
// Mostra apenas o que o guest AINDA PODE FAZER HOJE, com base na hora atual
function filterInStay(experiences: ExperienceRow[], currentHour: number): ExperienceRow[] {
  const hoursLeft = 23 - currentHour;

  return experiences.filter(exp => {
    const hours = parseDurationHours(exp.duration);
    const tags  = exp.tags ?? [];

    // Não é possível acabar hoje → fora
    if (hours > hoursLeft) return false;

    // Depois das 20h → só nightlife e jantar
    if (currentHour >= 20) {
      return (
        exp.category === 'Night Explorer' ||
        tags.some(t => ['Party', 'Nightlife', 'Dinner', 'Fado', 'Live Music', 'Bar'].includes(t))
      );
    }

    // Golden hour (17h–19h30) → sunset + coisas rápidas
    if (currentHour >= 17 && currentHour < 20) {
      return tags.includes('Sunset') || tags.includes('Cruise') || hours <= 3;
    }

    // Manhã/tarde → tudo que cabe no tempo disponível
    return true;
  });
}

// ─── Score de match de persona ────────────────────────────────────────────────
function getPersonaMatchScore(exp: ExperienceRow, persona: string): number {
  const relevantTags = PERSONA_TAGS[persona] ?? [];
  const expTags      = exp.tags ?? [];
  return expTags.filter(t => relevantTags.includes(t)).length * 15;
}

// ─── Ranker Principal ─────────────────────────────────────────────────────────
export function rankExperiences(
  experiences: ExperienceRow[],
  opts: RankOptions,
): ExperienceRow[] {
  const { context, currentHour, personaScores, spendingProfile } = opts;

  // 1. Filtrar por contexto
  const filtered = context === 'pre_arrival'
    ? filterPreArrival(experiences)
    : filterInStay(experiences, currentHour);

  // 2. Calcular score de relevância para cada experiência
  const [top, second] = getTopTwoPersonas(personaScores);

  const scored = filtered.map(exp => {
    let score = 0;
    const tags  = exp.tags ?? [];
    const hours = parseDurationHours(exp.duration);

    // ── Persona match ──────────────────────────────────────────────────────
    score += getPersonaMatchScore(exp, top)    * 2.0; // persona principal vale 2x
    score += getPersonaMatchScore(exp, second) * 1.0;

    // ── Spending profile ───────────────────────────────────────────────────
    if (spendingProfile === 'premium' && exp.price >= 50) score += 20;
    if (spendingProfile === 'mid'     && exp.price >= 20 && exp.price < 50) score += 15;
    if (spendingProfile === 'budget'  && exp.price < 20)  score += 25;
    if (spendingProfile === 'budget'  && tags.some(t => ['Free', 'Free Tour', 'Tip-Based'].includes(t))) score += 30;

    // ── Boosts Pre-Arrival ─────────────────────────────────────────────────
    if (context === 'pre_arrival') {
      if (hours >= 6)                  score += 15; // dia completo = planear antecipado
      if (tags.includes('UNESCO'))     score += 15;
      if (tags.includes('Must Do'))    score += 20;
      if (tags.includes('Dolphins'))   score += 15; // esgota rápido
      if (exp.price >= 40)             score += 10; // alto valor = vale garantir
    }

    // ── Boosts In-Stay ─────────────────────────────────────────────────────
    if (context === 'in_stay') {
      // Golden hour: sunset ao fim do dia
      if (currentHour >= 17 && currentHour < 20 && tags.includes('Sunset')) score += 35;
      if (currentHour >= 17 && currentHour < 20 && tags.includes('Cruise')) score += 25;

      // Noite: nightlife sobe
      if (currentHour >= 20 && tags.some(t => ['Nightlife', 'Party', 'Pub Crawl'].includes(t))) score += 30;

      // Urgência: experiências curtas são mais fáceis de decidir in-stay
      if (hours <= 2) score += 10;

      // available_today flag da BD
      if (exp.available_today) score += 20;
    }

    return { exp, score };
  });

  // 3. Ordenar por score descendente
  return scored
    .sort((a, b) => b.score - a.score)
    .map(s => s.exp);
}
