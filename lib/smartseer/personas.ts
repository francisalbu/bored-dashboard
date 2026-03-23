// ─────────────────────────────────────────────────────────────────────────────
// SmartSeer — 7 Personas para Hostels
// Tags baseadas nos dados reais do CSV de experiências
// ─────────────────────────────────────────────────────────────────────────────

export type PersonaKey =
  | 'social_butterfly'
  | 'digital_nomad'
  | 'adrenaline_junkie'
  | 'culture_buff'
  | 'chill_foodie'
  | 'budget_explorer'
  | 'nature_lover';

export type PersonaScore = Record<PersonaKey, number>;

// ─── Metadata de cada persona ─────────────────────────────────────────────────
export const PERSONAS: Record<PersonaKey, {
  label:        string;
  emoji:        string;
  description:  string;
  color:        string;         // tailwind/hex para UI
  priceRange:   'budget' | 'mid' | 'premium' | 'any';
}> = {
  social_butterfly: {
    label:       'Social Butterfly',
    emoji:       '🎉',
    description: 'Conhecer pessoas, festas, música ao vivo',
    color:       '#FF6B9D',
    priceRange:  'mid',
  },
  digital_nomad: {
    label:       'Digital Nomad',
    emoji:       '💻',
    description: 'Trabalho + exploração leve, final de tarde',
    color:       '#4ECDC4',
    priceRange:  'mid',
  },
  adrenaline_junkie: {
    label:       'Adrenaline Junkie',
    emoji:       '🏄',
    description: 'Desporto extremo, ação, velocidade',
    color:       '#FF6B35',
    priceRange:  'mid',
  },
  culture_buff: {
    label:       'Culture & History Buff',
    emoji:       '🏛️',
    description: 'UNESCO, história, arte, arquitetura',
    color:       '#A78BFA',
    priceRange:  'any',
  },
  chill_foodie: {
    label:       'Chill & Foodie',
    emoji:       '🍷',
    description: 'Vinho, gastronomia, pôr do sol, relaxar',
    color:       '#F59E0B',
    priceRange:  'premium',
  },
  budget_explorer: {
    label:       'Budget Explorer',
    emoji:       '🎒',
    description: 'Máximo com mínimo dinheiro',
    color:       '#34D399',
    priceRange:  'budget',
  },
  nature_lover: {
    label:       'Nature Lover',
    emoji:       '🌿',
    description: 'Wildlife, paisagens, sustentabilidade',
    color:       '#6EE7B7',
    priceRange:  'any',
  },
};

// ─── Tag → Persona Weights ────────────────────────────────────────────────────
// Baseado nas tags REAIS do CSV de experiências Editory/Lisbon Hostel
export const TAG_WEIGHTS: Record<string, Partial<PersonaScore>> = {

  // ── 🎉 Social Butterfly ───────────────────────────────────────────────────
  'Party':           { social_butterfly: 30 },
  'Pub Crawl':       { social_butterfly: 30 },
  'Nightlife':       { social_butterfly: 25 },
  'Live Music':      { social_butterfly: 20, culture_buff: 10 },
  'Fado':            { social_butterfly: 15, culture_buff: 25 },
  'Beer':            { social_butterfly: 20, budget_explorer: 10 },
  'Group Dinner':    { social_butterfly: 25, chill_foodie: 15 },
  'Group':           { social_butterfly: 20 },
  'Social':          { social_butterfly: 25 },
  'Evening':         { social_butterfly: 15, digital_nomad: 10 },
  'Night Tour':      { social_butterfly: 20, culture_buff: 10 },
  'Cabaret':         { social_butterfly: 20 },
  'Adults Only':     { social_butterfly: 15 },
  'Dinner':          { social_butterfly: 20, chill_foodie: 20 },
  'Bar':             { social_butterfly: 20, budget_explorer: 10 },

  // ── 💻 Digital Nomad ──────────────────────────────────────────────────────
  'After-work':      { digital_nomad: 25, social_butterfly: 10 },
  'E-Bike':          { digital_nomad: 20, budget_explorer: 15 },
  'Self-Drive':      { digital_nomad: 20 },
  'Photography':     { digital_nomad: 20, culture_buff: 10 },
  'Eco-Friendly':    { digital_nomad: 15, nature_lover: 20 },
  'Panoramic':       { digital_nomad: 15, chill_foodie: 10 },
  'Scenic':          { digital_nomad: 20, chill_foodie: 15 },
  'Relaxing':        { digital_nomad: 15, chill_foodie: 20 },
  'Sunset':          { digital_nomad: 20, chill_foodie: 20, social_butterfly: 10 },
  'Viewpoints':      { digital_nomad: 15, culture_buff: 10, chill_foodie: 10 },

  // ── 🏄 Adrenaline Junkie ──────────────────────────────────────────────────
  'Surf':            { adrenaline_junkie: 30 },
  'Surfing':         { adrenaline_junkie: 30 },
  'Kayak':           { adrenaline_junkie: 25, nature_lover: 15 },
  'Kayaking':        { adrenaline_junkie: 25, nature_lover: 15 },
  'Coasteering':     { adrenaline_junkie: 35 },
  'Cliff Jumping':   { adrenaline_junkie: 35 },
  'Paragliding':     { adrenaline_junkie: 35 },
  'Indoor Skydiving':{ adrenaline_junkie: 35 },
  '4x4':             { adrenaline_junkie: 25, nature_lover: 10 },
  'Off-Road':        { adrenaline_junkie: 25 },
  'Jeep':            { adrenaline_junkie: 20 },
  'Buggy':           { adrenaline_junkie: 25 },
  'Quad':            { adrenaline_junkie: 25 },
  'Adrenaline':      { adrenaline_junkie: 30 },
  'Extreme':         { adrenaline_junkie: 30 },
  'Active':          { adrenaline_junkie: 20 },
  'Hiking':          { adrenaline_junkie: 20, nature_lover: 20 },
  'Rock Climbing':   { adrenaline_junkie: 30 },
  'Balloon':         { adrenaline_junkie: 20, nature_lover: 15 },
  'Helicopter':      { adrenaline_junkie: 20 },
  'Aerial':          { adrenaline_junkie: 15 },
  'Scuba Diving':    { adrenaline_junkie: 25, nature_lover: 20 },
  'Snorkeling':      { adrenaline_junkie: 15, nature_lover: 20 },
  'Cycling':         { adrenaline_junkie: 20, budget_explorer: 15 },
  'Caving':          { adrenaline_junkie: 25, nature_lover: 15 },
  'Fishing':         { adrenaline_junkie: 15, nature_lover: 20 },
  'Water Sports':    { adrenaline_junkie: 25 },

  // ── 🏛️ Culture & History Buff ─────────────────────────────────────────────
  'History':         { culture_buff: 30 },
  'UNESCO':          { culture_buff: 30 },
  'Architecture':    { culture_buff: 25 },
  'Cultural':        { culture_buff: 25 },
  'Heritage':        { culture_buff: 25 },
  'Art':             { culture_buff: 20, social_butterfly: 10 },
  'Street Art':      { culture_buff: 15, budget_explorer: 15 },
  'Graffiti':        { culture_buff: 15, budget_explorer: 15 },
  'Murals':          { culture_buff: 15, budget_explorer: 10 },
  'Museum':          { culture_buff: 25 },
  'Guided Tour':     { culture_buff: 20, budget_explorer: 10 },
  'Walking Tour':    { culture_buff: 20, budget_explorer: 15 },
  'Medieval':        { culture_buff: 25 },
  'Discoveries':     { culture_buff: 25 },
  'Jewish Heritage': { culture_buff: 25 },
  'Monuments':       { culture_buff: 20 },
  'Azulejo':         { culture_buff: 25 },
  'Tile Painting':   { culture_buff: 20 },
  'Alfama':          { culture_buff: 20 },
  'Belém':           { culture_buff: 20 },
  'Mouraria':        { culture_buff: 20 },
  'Dictatorship':    { culture_buff: 25 },
  'WWII':            { culture_buff: 25 },
  'Dark History':    { culture_buff: 25 },
  'Storytelling':    { culture_buff: 20 },
  'Colonial History':{ culture_buff: 25 },
  'Spies':           { culture_buff: 20 },
  'Sephardic':       { culture_buff: 20 },
  'Slave Trade':     { culture_buff: 20 },
  'Thought-Provoking':{ culture_buff: 15 },
  'Educational':     { culture_buff: 20 },
  'Local Guide':     { culture_buff: 20, budget_explorer: 10 },

  // ── 🍷 Chill & Foodie ─────────────────────────────────────────────────────
  'Wine':            { chill_foodie: 30 },
  'Wine Tour':       { chill_foodie: 30 },
  'Wine Tasting':    { chill_foodie: 30 },
  'Tasting':         { chill_foodie: 25 },
  'Brunch':          { chill_foodie: 25 },
  'Cooking Class':   { chill_foodie: 30 },
  'Food Tour':       { chill_foodie: 30 },
  'Petiscos':        { chill_foodie: 25, culture_buff: 10 },
  'Tapas':           { chill_foodie: 25 },
  'Gastronomy':      { chill_foodie: 25 },
  'Culinary':        { chill_foodie: 25 },
  'Gourmet':         { chill_foodie: 25 },
  'Foodie':          { chill_foodie: 25 },
  'Portuguese Cuisine': { chill_foodie: 25, culture_buff: 10 },
  'Cheese':          { chill_foodie: 20 },
  'Pastries':        { chill_foodie: 20 },
  'Organic':         { chill_foodie: 15, nature_lover: 15 },
  'Vegan':           { chill_foodie: 15, nature_lover: 10 },
  'Sailing':         { chill_foodie: 20, nature_lover: 10, adrenaline_junkie: 10 },
  'Sailboat':        { chill_foodie: 20, nature_lover: 10 },
  'Cruise':          { chill_foodie: 20, social_butterfly: 15 },
  'Romantic':        { chill_foodie: 20, social_butterfly: 10 },
  'Couples':         { chill_foodie: 20, social_butterfly: 10 },
  'Rooftop':         { chill_foodie: 20, social_butterfly: 15 },
  'Boat':            { chill_foodie: 15, adrenaline_junkie: 10, nature_lover: 10 },
  'River':           { chill_foodie: 15, nature_lover: 15 },
  'Tagus River':     { chill_foodie: 15, nature_lover: 10 },
  'Golden Hour':     { chill_foodie: 25, digital_nomad: 10 },
  'Tastings':        { chill_foodie: 25 },
  'Street Food':     { chill_foodie: 15, budget_explorer: 20 },

  // ── 🎒 Budget Explorer ────────────────────────────────────────────────────
  'Free Tour':           { budget_explorer: 35, culture_buff: 10 },
  'Free':                { budget_explorer: 35 },
  'Pay What You Wish':   { budget_explorer: 35 },
  'Budget':              { budget_explorer: 30 },
  'Cheap':               { budget_explorer: 30 },
  '3€':                  { budget_explorer: 35 },
  'Tip-Based':           { budget_explorer: 30 },
  'Public Transport':    { budget_explorer: 25 },
  'Self-Guided':         { budget_explorer: 25, digital_nomad: 10 },

  // ── 🌿 Nature Lover ───────────────────────────────────────────────────────
  'Dolphins':            { nature_lover: 35 },
  'Wildlife':            { nature_lover: 35 },
  'Marine Biology':      { nature_lover: 30 },
  'Ocean':               { nature_lover: 25, adrenaline_junkie: 10 },
  'Atlantic':            { nature_lover: 25 },
  'Birdwatching':        { nature_lover: 30 },
  'Conservation':        { nature_lover: 30 },
  'Safari':              { nature_lover: 25 },
  'Fossils':             { nature_lover: 20, culture_buff: 15 },
  'Dinosaur':            { nature_lover: 20, culture_buff: 15 },
  'Cork Forest':         { nature_lover: 30, adrenaline_junkie: 10 },
  'Nature':              { nature_lover: 25 },
  'Animals':             { nature_lover: 25 },
  'Coastal':             { nature_lover: 20, adrenaline_junkie: 10 },
  'Sintra':              { nature_lover: 20, culture_buff: 15 },
  'Alentejo':            { nature_lover: 20, chill_foodie: 15 },
  'Serra':               { nature_lover: 25, adrenaline_junkie: 10 },
  'Horseback Riding':    { nature_lover: 25 },
  'Outdoors':            { nature_lover: 20, adrenaline_junkie: 15 },
  'Night Cruise':        { nature_lover: 15, social_butterfly: 15 },
};

// ─── Category → Persona Weights ───────────────────────────────────────────────
export const CATEGORY_WEIGHTS: Record<string, Partial<PersonaScore>> = {
  'Culture Dive':    { culture_buff: 25 },
  'Outdoors':        { adrenaline_junkie: 20, nature_lover: 20 },
  'Food & Drink':    { chill_foodie: 25, social_butterfly: 10 },
  'Night Explorer':  { social_butterfly: 25 },
  'Mind & Body':     { chill_foodie: 20, digital_nomad: 10 },
  'Local Cooking':   { chill_foodie: 25, culture_buff: 10 },
  'Learn & Create':  { culture_buff: 20, digital_nomad: 10 },
  'Micro Adventures':{ adrenaline_junkie: 20, nature_lover: 15 },
  'Time Stories':    { culture_buff: 25 },
  'Sports':          { adrenaline_junkie: 25 },
  'Nature':          { nature_lover: 30 },
  'Spa & Wellness':  { chill_foodie: 20, digital_nomad: 10 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function emptyPersonaScore(): PersonaScore {
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

export function getTopPersona(scores: PersonaScore): PersonaKey {
  return (Object.entries(scores) as [PersonaKey, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

export function getTopTwoPersonas(scores: PersonaScore): [PersonaKey, PersonaKey] {
  const sorted = (Object.entries(scores) as [PersonaKey, number][])
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

export function normalizeScores(scores: PersonaScore): PersonaScore {
  const max = Math.max(...Object.values(scores));
  if (max === 0) return scores;
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, Math.round((v / max) * 100)])
  ) as PersonaScore;
}

// Converte string de duração do CSV para horas numéricas
// Ex: "2h", "2 hours", "Full Day", "6 hours", "30 min"
export function parseDurationHours(duration: string | null): number {
  if (!duration) return 2;
  const d = duration.toLowerCase();
  if (d.includes('full day') || d.includes('day'))  return 8;
  if (d.includes('half day'))                        return 4;
  const hoursMatch = d.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hoursMatch) return parseFloat(hoursMatch[1]);
  const minsMatch  = d.match(/(\d+)\s*min/);
  if (minsMatch)  return parseInt(minsMatch[1]) / 60;
  const numMatch   = d.match(/(\d+(?:\.\d+)?)/);
  if (numMatch)   return parseFloat(numMatch[1]);
  return 2;
}
